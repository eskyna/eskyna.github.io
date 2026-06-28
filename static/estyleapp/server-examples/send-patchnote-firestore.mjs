/**
 * Sendet EStyle Patchnotes an alle FCM Tokens aus Cloud Firestore.
 *
 * Lokaler Test:
 *   npm install firebase-admin
 *   GOOGLE_APPLICATION_CREDENTIALS=/secure/path/service-account.json \
 *   PATCH_TITLE="EStyle Update" \
 *   PATCH_BODY="Neue Analyse-Verbesserungen sind live." \
 *   node send-patchnote-firestore.mjs
 *
 * GitHub Actions:
 *   Service-Account JSON als Base64 in FIREBASE_SERVICE_ACCOUNT_BASE64 speichern.
 */
import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID || "eskyna-style";
const collectionName = process.env.FCM_TOKENS_COLLECTION || "fcmTokens";
const title = process.env.PATCH_TITLE || "EStyle Update";
const body = process.env.PATCH_BODY || "Neue Verbesserungen in deiner EStyle App sind verfuegbar.";
const link = process.env.PATCH_URL || "https://eskyna.com/estyleapp/#welcome";

initializeFirebaseAdmin(projectId);

const db = admin.firestore();
const snapshot = await db.collection(collectionName).get();
const docs = snapshot.docs
  .map((doc) => ({ id: doc.id, ...doc.data() }))
  .filter((entry) => typeof entry.token === "string" && entry.token.length > 20);

if (!docs.length) {
  console.log(`Keine FCM Tokens in ${collectionName} gefunden.`);
  process.exit(0);
}

let successCount = 0;
let failureCount = 0;
const staleDocumentIds = [];

for (const batch of chunk(docs, 500)) {
  const response = await admin.messaging().sendEachForMulticast({
    tokens: batch.map((entry) => entry.token),
    notification: { title, body },
    data: {
      title,
      body,
      url: link,
      tag: `patchnotes-${new Date().toISOString().slice(0, 10)}`,
    },
    webpush: {
      fcmOptions: { link },
    },
  });

  successCount += response.successCount;
  failureCount += response.failureCount;

  response.responses.forEach((result, index) => {
    const code = result.error?.code || "";
    if (
      code.includes("registration-token-not-registered") ||
      code.includes("invalid-registration-token")
    ) {
      staleDocumentIds.push(batch[index].id);
    }
  });
}

for (const staleId of staleDocumentIds) {
  await db
    .collection(collectionName)
    .doc(staleId)
    .delete()
    .catch(() => undefined);
}

console.log(
  `Gesendet: ${successCount}, Fehler: ${failureCount}, geloeschte stale Tokens: ${staleDocumentIds.length}`
);

function initializeFirebaseAdmin(projectId) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString(
      "utf8"
    );
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(json)),
      projectId,
    });
    return;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

function chunk(items, size) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}
