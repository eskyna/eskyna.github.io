const DEFAULT_CONFIG = {
  apiEndpoint: "https://api.eskyna-style.workers.dev/v1/images",
  demoMode: false,
  uploadMode: "binary",
  contentType: "application/octet-stream",
  credentials: "same-origin",
  maxUploadWidth: 1600,
  jpegQuality: 0.88,
  timeoutMs: 45000,
  auth: {
    enabled: true,
    required: true,
    provider: "firebase",
    firebaseSdkVersion: "10.12.4",
    allowedProviders: ["google"],
    redirectAfterLogin: "create",
    attachIdTokenToAnalysisRequest: false,
    firebaseConfig: {
      apiKey: "",
      authDomain: "",
      projectId: "",
      appId: "",
    },
  },
};

const CONFIG = mergeConfig(DEFAULT_CONFIG, window.ESKYNA_CONFIG || {});
const STORAGE_KEYS = {
  authUser: "eskyna:authUser",
  authReturnRoute: "eskyna:authReturnRoute",
  analysis: "eskyna:lastAnalysis",
};
const PROTECTED_ROUTES = new Set(["create", "camera", "result"]);

const SAMPLE_ANALYSIS = {
  colorType: "SANFT- KALT",
  baseColors: [
    { name: "Navy", hex: "#00203d" },
    { name: "Mauve Brown", hex: "#645055" },
    { name: "Slate", hex: "#6d7a86" },
    { name: "Cool Grey", hex: "#7d878a" },
    { name: "Soft Lilac Grey", hex: "#a99aa8" },
    { name: "Mist", hex: "#aebbc1" },
  ],
  accentColors: [
    { name: "Blue", hex: "#2e5fa8" },
    { name: "Periwinkle", hex: "#7ea0d8" },
    { name: "Petrol", hex: "#1d7769" },
    { name: "Berry", hex: "#a14276" },
    { name: "Raspberry", hex: "#dd3158" },
    { name: "Rose", hex: "#ed839e" },
  ],
  noGoColors: [
    { name: "Tomate", hex: "#dc4744" },
    { name: "Orange", hex: "#f57100" },
    { name: "Eigelb", hex: "#ffbc0a" },
    { name: "Senf", hex: "#a58408" },
  ],
  noGoText: "Eigelb, Tomate, Orange, Senf - sie lassen dein Teint müde und gelblich wirken.",
};

const state = {
  view: "welcome",
  cameraStream: null,
  facingMode: "user",
  selectedPhotoBlob: null,
  selectedPhotoDataUrl: "",
  selectedPhotoName: "",
  latestAnalysis: null,
  latestRaw: null,
  deferredInstallPrompt: null,
  returnRoute: CONFIG.auth?.redirectAfterLogin || "create",
  auth: {
    status: "idle",
    user: null,
    idToken: "",
    error: "",
    initPromise: null,
    firebase: null,
  },
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const els = {
  views: $$(".view"),
  authStatus: $("#authStatus"),
  loginButtons: $$("[data-provider]"),
  menuOverlay: $("#menuOverlay"),
  menuUser: $("#menuUser"),
  menuUserAvatar: $("#menuUserAvatar"),
  menuUserName: $("#menuUserName"),
  menuUserEmail: $("#menuUserEmail"),
  logoutButton: $("#logoutButton"),
  installButton: $("#installButton"),
  toast: $("#toast"),
  avatarImages: $$(".avatar-button img"),
  cameraVideo: $("#cameraVideo"),
  cameraCard: $("#cameraCard"),
  cameraEmpty: $("#cameraEmpty"),
  captureCanvas: $("#captureCanvas"),
  photoPreview: $("#photoPreview"),
  fileInput: $("#fileInput"),
  cameraActions: $("#cameraActions"),
  reviewActions: $("#reviewActions"),
  cameraMessage: $("#cameraMessage"),
  resultPortrait: $("#resultPortrait"),
  colorTypeText: $("#colorTypeText"),
  baseColors: $("#baseColors"),
  accentColors: $("#accentColors"),
  noGoColors: $("#noGoColors"),
  noGoText: $("#noGoText"),
  rawResponse: $("#rawResponse"),
  rawJson: $("#rawJson"),
};

init();

function init() {
  restoreUserState();
  bindEvents();
  renderAuthState();
  renderResult(state.latestAnalysis, state.latestRaw);
  registerServiceWorker();

  const initialRoute = sanitizeRoute(location.hash.replace("#", "")) || "welcome";
  state.returnRoute = PROTECTED_ROUTES.has(initialRoute)
    ? initialRoute
    : CONFIG.auth?.redirectAfterLogin || "create";
  navigate(initialRoute, { replace: true, silent: true });
  initAuth().catch((error) => {
    console.error(error);
    state.auth.status = "error";
    state.auth.error = authErrorMessage(error);
    renderAuthState();
  });
}

function bindEvents() {
  document.addEventListener("click", async (event) => {
    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      event.preventDefault();
      const route = routeButton.dataset.route;
      closeMenu();
      navigate(route);
      return;
    }

    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    event.preventDefault();

    const action = actionButton.dataset.action;
    switch (action) {
      case "open-menu":
        openMenu();
        break;
      case "close-menu":
        closeMenu();
        break;
      case "start-camera":
        await startCamera();
        break;
      case "switch-camera":
        state.facingMode = state.facingMode === "user" ? "environment" : "user";
        await startCamera();
        break;
      case "capture-photo":
        await capturePhoto();
        break;
      case "pick-file":
        els.fileInput.click();
        break;
      case "retake-photo":
        await retakePhoto();
        break;
      case "send-photo":
        await sendPhotoForAnalysis(actionButton);
        break;
      case "login-google":
        await signInWithProvider("google", actionButton);
        break;
      case "logout":
        await signOutUser();
        break;
      case "style-question":
        showToast("Der KI-Stylist kann hier später mit deinem Chat-Endpunkt verbunden werden.");
        break;
      case "install-app":
        await promptInstall();
        break;
      default:
        break;
    }
  });

  els.fileInput.addEventListener("change", async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    await handleFile(file);
    event.target.value = "";
  });

  window.addEventListener("hashchange", () => {
    const route = sanitizeRoute(location.hash.replace("#", "")) || "welcome";
    navigate(route, { replace: true, silent: true });
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    if (els.installButton) els.installButton.hidden = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCamera();
    } else if (state.view === "camera" && !state.selectedPhotoBlob) {
      startCamera().catch(() => undefined);
    }
  });
}

function restoreUserState() {
  const storedUser = safeJsonParse(safeLocalStorageGet(STORAGE_KEYS.authUser));
  if (storedUser?.uid) {
    state.auth.user = storedUser;
    state.auth.status = "cached";
  }

  const storedReturnRoute = sanitizeRoute(safeSessionStorageGet(STORAGE_KEYS.authReturnRoute));
  if (storedReturnRoute) state.returnRoute = storedReturnRoute;

  const storedAnalysis = safeJsonParse(safeLocalStorageGet(STORAGE_KEYS.analysis));
  if (storedAnalysis?.analysis) {
    state.latestAnalysis = storedAnalysis.analysis;
    state.latestRaw = storedAnalysis.raw || storedAnalysis.analysis;
  }
}

function sanitizeRoute(route) {
  const allowed = new Set(["welcome", "login", "create", "camera", "result"]);
  return allowed.has(route) ? route : "";
}

function navigate(route, options = {}) {
  let nextRoute = sanitizeRoute(route) || "welcome";
  const { replace = false, silent = false } = options;

  if (authRequiredFor(nextRoute) && !isAuthenticated()) {
    state.returnRoute = nextRoute;
    safeSessionStorageSet(STORAGE_KEYS.authReturnRoute, nextRoute);
    nextRoute = "login";
  } else if (nextRoute === "login" && isAuthenticated()) {
    nextRoute = sanitizeRoute(state.returnRoute) || CONFIG.auth?.redirectAfterLogin || "create";
  }

  if (state.view === "camera" && nextRoute !== "camera") stopCamera();

  state.view = nextRoute;
  els.views.forEach((view) => {
    view.classList.toggle("is-active", view.id === `view-${nextRoute}`);
  });

  if (!silent) {
    const hash = `#${nextRoute}`;
    if (replace) history.replaceState(null, "", hash);
    else if (location.hash !== hash) history.pushState(null, "", hash);
  }

  if (nextRoute === "camera") {
    prepareCameraView();
    startCamera().catch(() => undefined);
  }
  if (nextRoute === "result") {
    renderResult(state.latestAnalysis, state.latestRaw);
  }
}

function authIsEnabled() {
  return CONFIG.auth?.enabled !== false;
}

function authRequiredFor(route) {
  return authIsEnabled() && CONFIG.auth?.required !== false && PROTECTED_ROUTES.has(route);
}

function isAuthenticated() {
  return Boolean(state.auth.user?.uid);
}

async function initAuth() {
  if (!authIsEnabled()) {
    state.auth.status = "disabled";
    renderAuthState();
    return;
  }

  if ((CONFIG.auth?.provider || "firebase") !== "firebase") {
    state.auth.status = "error";
    state.auth.error = "Der konfigurierte Auth-Provider wird von dieser PWA nicht unterstützt.";
    renderAuthState();
    return;
  }

  if (!hasFirebaseConfig()) {
    state.auth.status = "missing-config";
    state.auth.error = "Firebase-Konfiguration fehlt. Bitte in config.js eintragen.";
    renderAuthState();
    return;
  }

  state.auth.status = state.auth.user ? "cached" : "initializing";
  state.auth.error = "";
  renderAuthState();

  state.auth.initPromise = setupFirebaseAuth();
  await state.auth.initPromise;
}

async function setupFirebaseAuth() {
  const sdkVersion = CONFIG.auth?.firebaseSdkVersion || DEFAULT_CONFIG.auth.firebaseSdkVersion;
  const baseUrl = `https://www.gstatic.com/firebasejs/${encodeURIComponent(sdkVersion)}`;

  const [appModule, authModule] = await Promise.all([
    import(`${baseUrl}/firebase-app.js`),
    import(`${baseUrl}/firebase-auth.js`),
  ]);

  const app = appModule.initializeApp(getFirebaseConfig());
  const auth = authModule.getAuth(app);
  auth.languageCode = "de";

  if (authModule.browserLocalPersistence && authModule.setPersistence) {
    await authModule
      .setPersistence(auth, authModule.browserLocalPersistence)
      .catch(() => undefined);
  }

  state.auth.firebase = { auth, authModule };

  try {
    await authModule.getRedirectResult(auth);
  } catch (error) {
    console.error(error);
    state.auth.error = authErrorMessage(error);
    showToast(state.auth.error);
  }

  authModule.onAuthStateChanged(auth, async (user) => {
    if (user) {
      await applyFirebaseUser(user);
      const targetRoute =
        sanitizeRoute(safeSessionStorageGet(STORAGE_KEYS.authReturnRoute)) ||
        sanitizeRoute(state.returnRoute) ||
        CONFIG.auth?.redirectAfterLogin ||
        "create";
      safeSessionStorageRemove(STORAGE_KEYS.authReturnRoute);
      if (state.view === "login" || authRequiredFor(state.view)) {
        navigate(targetRoute, { replace: true });
      }
      return;
    }

    clearAuthUser();
    state.auth.status = "signed-out";
    renderAuthState();
    if (authRequiredFor(state.view)) navigate("login", { replace: true });
  });
}

async function applyFirebaseUser(user) {
  const normalized = normalizeFirebaseUser(user);
  state.auth.user = normalized;
  state.auth.status = "authenticated";
  state.auth.error = "";
  state.auth.idToken = await user.getIdToken().catch(() => "");
  safeLocalStorageSet(STORAGE_KEYS.authUser, JSON.stringify(normalized));
  renderAuthState();
}

function normalizeFirebaseUser(user) {
  const providerData = Array.isArray(user.providerData) ? user.providerData : [];
  const providerId = providerData[0]?.providerId || "";
  const email = user.email || providerData.find((item) => item.email)?.email || "";
  return {
    uid: user.uid,
    displayName:
      user.displayName ||
      providerData.find((item) => item.displayName)?.displayName ||
      email.split("@")[0] ||
      "EStyle Nutzerin",
    email,
    photoURL: user.photoURL || providerData.find((item) => item.photoURL)?.photoURL || "",
    providerId,
    signedInAt: new Date().toISOString(),
  };
}

async function signInWithProvider(providerName, button) {
  if (!authIsEnabled()) {
    navigate(CONFIG.auth?.redirectAfterLogin || "create");
    return;
  }

  const allowedProviders = CONFIG.auth?.allowedProviders || DEFAULT_CONFIG.auth.allowedProviders;
  if (!allowedProviders.includes(providerName)) {
    showToast("Dieser Login-Anbieter ist deaktiviert.");
    return;
  }

  if (!hasFirebaseConfig()) {
    state.auth.status = "missing-config";
    state.auth.error = "Firebase-Konfiguration fehlt. Bitte zuerst config.js ausfüllen.";
    renderAuthState();
    showToast(state.auth.error);
    return;
  }

  setBusy(button, true, "Weiterleitung...");
  try {
    if (!state.auth.firebase) {
      if (!state.auth.initPromise) state.auth.initPromise = setupFirebaseAuth();
      await state.auth.initPromise;
    }

    const { auth, authModule } = state.auth.firebase;
    const provider = createFirebaseProvider(providerName, authModule);
    safeSessionStorageSet(
      STORAGE_KEYS.authReturnRoute,
      sanitizeRoute(state.returnRoute) || CONFIG.auth?.redirectAfterLogin || "create"
    );
    await authModule.signInWithRedirect(auth, provider);
  } catch (error) {
    console.error(error);
    state.auth.status = "error";
    state.auth.error = authErrorMessage(error);
    renderAuthState();
    showToast(state.auth.error);
    setBusy(button, false);
  }
}

function createFirebaseProvider(providerName, authModule) {
  if (providerName === "google") {
    const provider = new authModule.GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
  }

  throw new Error("Unbekannter Login-Anbieter.");
}

async function signOutUser() {
  closeMenu();
  try {
    if (state.auth.firebase?.authModule?.signOut) {
      await state.auth.firebase.authModule.signOut(state.auth.firebase.auth);
    }
  } catch (error) {
    console.error(error);
  }
  clearAuthUser();
  state.auth.status = "signed-out";
  renderAuthState();
  navigate("login", { replace: true });
}

function clearAuthUser() {
  state.auth.user = null;
  state.auth.idToken = "";
  safeLocalStorageRemove(STORAGE_KEYS.authUser);
}

async function getCurrentIdToken() {
  if (!authIsEnabled()) return "";
  if (state.auth.firebase?.auth?.currentUser) {
    state.auth.idToken = await state.auth.firebase.auth.currentUser
      .getIdToken()
      .catch(() => state.auth.idToken || "");
  }
  return state.auth.idToken || "";
}

function renderAuthState() {
  const allowedProviders = CONFIG.auth?.allowedProviders || DEFAULT_CONFIG.auth.allowedProviders;
  els.loginButtons.forEach((button) => {
    const provider = button.dataset.provider;
    button.hidden = !allowedProviders.includes(provider);
    button.disabled = state.auth.status === "initializing";
  });

  const user = state.auth.user;
  document.body.classList.toggle("is-authenticated", Boolean(user));

  if (els.authStatus) {
    els.authStatus.classList.remove("error", "success");
    if (!authIsEnabled()) {
      els.authStatus.textContent = "Login ist aktuell deaktiviert.";
    } else if (state.auth.status === "initializing") {
      els.authStatus.textContent = "Login wird vorbereitet...";
    } else if (state.auth.status === "missing-config") {
      els.authStatus.textContent = "Firebase Auth ist noch nicht konfiguriert.";
      els.authStatus.classList.add("error");
    } else if (state.auth.error) {
      els.authStatus.textContent = state.auth.error;
      els.authStatus.classList.add("error");
    } else if (user) {
      els.authStatus.textContent = `Angemeldet als ${user.displayName || user.email || "EStyle Nutzerin"}.`;
      els.authStatus.classList.add("success");
    } else {
      els.authStatus.textContent = "Bitte mit Google anmelden.";
    }
  }

  if (els.logoutButton) els.logoutButton.hidden = !user;
  if (els.menuUser) els.menuUser.hidden = !user;
  if (user) {
    const displayName = user.displayName || "EStyle Nutzerin";
    const email = user.email || providerLabel(user.providerId);
    const avatarSrc = user.photoURL || "assets/avatar.webp";
    if (els.menuUserName) els.menuUserName.textContent = displayName;
    if (els.menuUserEmail) els.menuUserEmail.textContent = email;
    if (els.menuUserAvatar) els.menuUserAvatar.src = avatarSrc;
    els.avatarImages.forEach((image) => {
      image.src = avatarSrc;
    });
  } else {
    if (els.menuUserAvatar) els.menuUserAvatar.src = "assets/avatar.webp";
    els.avatarImages.forEach((image) => {
      image.src = "assets/avatar.webp";
    });
  }
}

function hasFirebaseConfig() {
  const firebaseConfig = getFirebaseConfig();
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

function getFirebaseConfig() {
  return CONFIG.auth?.firebaseConfig || CONFIG.auth?.firebase || CONFIG.firebase || {};
}

function providerLabel(providerId = "") {
  if (providerId.includes("google")) return "Google Login";
  return "Social Login";
}

function authErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request"))
    return "Login wurde abgebrochen.";
  if (code.includes("unauthorized-domain"))
    return "Diese Domain ist im Auth-Provider noch nicht freigeschaltet.";
  if (code.includes("network-request-failed"))
    return "Netzwerkfehler beim Login. Bitte erneut versuchen.";
  if (code.includes("operation-not-allowed"))
    return "Dieser Login-Anbieter ist in Firebase noch nicht aktiviert.";
  return error?.message || "Login fehlgeschlagen. Bitte erneut versuchen.";
}

function openMenu() {
  els.menuOverlay.hidden = false;
}

function closeMenu() {
  els.menuOverlay.hidden = true;
}

function prepareCameraView() {
  setCameraMessage("", "");
  if (!state.selectedPhotoBlob) {
    els.cameraActions.hidden = false;
    els.reviewActions.hidden = true;
    els.photoPreview.hidden = true;
    els.cameraCard.classList.remove("has-photo");
  }
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraMessage(
      "Dein Browser erlaubt keinen direkten Kamerazugriff. Bitte wähle ein Foto aus.",
      "error"
    );
    return;
  }

  clearCapturedPhoto(false);
  stopCamera();
  setCameraMessage("Kamera wird gestartet...", "");

  try {
    const constraints = {
      audio: false,
      video: {
        facingMode: { ideal: state.facingMode },
        width: { ideal: 1280 },
        height: { ideal: 1600 },
      },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.cameraStream = stream;
    els.cameraVideo.srcObject = stream;
    els.cameraVideo.classList.toggle("is-front", state.facingMode === "user");
    await els.cameraVideo.play();
    els.cameraCard.classList.add("is-live");
    setCameraMessage(
      "Positioniere dein Gesicht mittig und blicke direkt in die Kamera.",
      "success"
    );
  } catch (error) {
    console.error(error);
    setCameraMessage(
      "Kamera konnte nicht gestartet werden. Prüfe die Berechtigung oder wähle ein Foto aus.",
      "error"
    );
  }
}

function stopCamera() {
  if (!state.cameraStream) return;
  state.cameraStream.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
  if (els.cameraVideo) els.cameraVideo.srcObject = null;
  els.cameraCard?.classList.remove("is-live");
}

async function capturePhoto() {
  if (!state.cameraStream || !els.cameraVideo.videoWidth) {
    await startCamera();
    return;
  }

  const { blob, dataUrl } = await drawMediaToJpeg(els.cameraVideo);
  setCapturedPhoto(blob, dataUrl, `estyle-color-id-${Date.now()}.jpg`);
  stopCamera();
  setCameraMessage("Foto bereit. Starte jetzt die Analyse.", "success");
}

async function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    setCameraMessage("Bitte wähle eine Bilddatei aus.", "error");
    return;
  }

  setCameraMessage("Foto wird vorbereitet...", "");
  try {
    const image = await loadImage(file);
    const { blob, dataUrl } = await drawMediaToJpeg(image);
    setCapturedPhoto(blob, dataUrl, file.name || `estyle-color-id-${Date.now()}.jpg`);
    stopCamera();
    setCameraMessage("Foto bereit. Starte jetzt die Analyse.", "success");
  } catch (error) {
    console.error(error);
    setCameraMessage("Das Foto konnte nicht gelesen werden. Bitte versuche es erneut.", "error");
  }
}

async function retakePhoto() {
  clearCapturedPhoto(true);
  await startCamera();
}

function setCapturedPhoto(blob, dataUrl, name) {
  state.selectedPhotoBlob = blob;
  state.selectedPhotoDataUrl = dataUrl;
  state.selectedPhotoName = name;
  els.photoPreview.src = dataUrl;
  els.photoPreview.hidden = false;
  els.cameraCard.classList.add("has-photo", "is-live");
  els.cameraActions.hidden = true;
  els.reviewActions.hidden = false;
}

function clearCapturedPhoto(clearPreview) {
  state.selectedPhotoBlob = null;
  state.selectedPhotoDataUrl = "";
  state.selectedPhotoName = "";
  els.cameraActions.hidden = false;
  els.reviewActions.hidden = true;
  els.cameraCard.classList.remove("has-photo");
  if (clearPreview) {
    els.photoPreview.removeAttribute("src");
    els.photoPreview.hidden = true;
  }
}

async function drawMediaToJpeg(media) {
  const naturalWidth = media.videoWidth || media.naturalWidth || media.width;
  const naturalHeight = media.videoHeight || media.naturalHeight || media.height;
  if (!naturalWidth || !naturalHeight) throw new Error("Keine Bilddimensionen erkannt.");

  const maxDimension = Number(CONFIG.maxUploadWidth) || DEFAULT_CONFIG.maxUploadWidth;
  const scale = Math.min(1, maxDimension / Math.max(naturalWidth, naturalHeight));
  const targetWidth = Math.max(1, Math.round(naturalWidth * scale));
  const targetHeight = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = els.captureCanvas;
  const context = canvas.getContext("2d", { alpha: false });
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  context.drawImage(media, 0, 0, targetWidth, targetHeight);

  const quality = Math.max(
    0.55,
    Math.min(0.98, Number(CONFIG.jpegQuality) || DEFAULT_CONFIG.jpegQuality)
  );
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error("JPEG konnte nicht erzeugt werden.")),
      "image/jpeg",
      quality
    );
  });
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  return { blob, dataUrl };
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Bild konnte nicht geladen werden."));
    };
    image.src = url;
  });
}

async function sendPhotoForAnalysis(button) {
  if (authRequiredFor("camera") && !isAuthenticated()) {
    setCameraMessage("Bitte melde dich zuerst mit Google an.", "error");
    state.returnRoute = "camera";
    navigate("login");
    return;
  }

  if (!state.selectedPhotoBlob) {
    setCameraMessage("Nimm zuerst ein Foto auf oder wähle eines aus.", "error");
    return;
  }

  setBusy(button, true, "Analyse läuft...");
  setCameraMessage("Foto wird sicher an die Analyse-API gesendet...", "");

  try {
    const raw = CONFIG.demoMode ? await getDemoResponse() : await postPhotoToApi();
    const analysis = normalizeAnalysis(raw);
    state.latestAnalysis = analysis;
    state.latestRaw = raw;
    persistAnalysis(analysis, raw);
    renderResult(analysis, raw, state.selectedPhotoDataUrl);
    setCameraMessage("Analyse abgeschlossen.", "success");
    navigate("result");
  } catch (error) {
    console.error(error);
    setCameraMessage(error.message || "Analyse fehlgeschlagen. Bitte versuche es erneut.", "error");
  } finally {
    setBusy(button, false);
  }
}

async function postPhotoToApi() {
  if (!CONFIG.apiEndpoint) throw new Error("Kein API-Endpunkt konfiguriert.");

  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    Number(CONFIG.timeoutMs) || DEFAULT_CONFIG.timeoutMs
  );
  const uploadMode = CONFIG.uploadMode || "binary";
  const headers = { Accept: "application/json" };
  const authToken = CONFIG.auth?.attachIdTokenToAnalysisRequest ? await getCurrentIdToken() : "";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  let body;

  if (uploadMode === "multipart") {
    const formData = new FormData();
    formData.append(
      CONFIG.requestFieldName || "photo",
      state.selectedPhotoBlob,
      normalizeFileName(state.selectedPhotoName)
    );
    formData.append("client", "eskyna-pwa");
    formData.append("capturedAt", new Date().toISOString());
    formData.append("facingMode", state.facingMode);
    if (state.auth.user?.uid) {
      formData.append("userId", state.auth.user.uid);
      formData.append("email", state.auth.user.email || "");
      formData.append("authProvider", state.auth.user.providerId || "");
    }
    body = formData;
  } else {
    body = state.selectedPhotoBlob;
    headers["Content-Type"] = CONFIG.contentType || "application/octet-stream";
  }

  try {
    const response = await fetch(CONFIG.apiEndpoint, {
      method: "POST",
      headers,
      body,
      cache: "no-store",
      credentials: CONFIG.credentials || "same-origin",
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const apiMessage = typeof payload === "object" ? payload.message || payload.error : payload;
      throw new Error(apiMessage || `API-Fehler ${response.status}`);
    }
    if (typeof payload !== "object" || payload === null) {
      throw new Error("Die API hat kein JSON zurückgegeben.");
    }
    return payload;
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("Die Analyse hat zu lange gedauert. Bitte erneut versuchen.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function getDemoResponse() {
  await new Promise((resolve) => window.setTimeout(resolve, 650));
  try {
    const response = await fetch("sample-api-response.json", { cache: "no-store" });
    if (response.ok) return await response.json();
  } catch (_) {
    // Fallback below.
  }
  return SAMPLE_ANALYSIS;
}

function normalizeFileName(name) {
  const clean = (name || `estyle-color-id-${Date.now()}.jpg`).replace(/[^a-zA-Z0-9._-]/g, "-");
  return clean.toLowerCase().endsWith(".jpg") || clean.toLowerCase().endsWith(".jpeg")
    ? clean
    : `${clean}.jpg`;
}

function normalizeAnalysis(raw) {
  const colorType =
    pick(raw, [
      "colorType",
      "colourType",
      "farbtyp",
      "season",
      "type",
      "analysis.colorType",
      "analysis.farbtyp",
      "result.colorType",
      "result.farbtyp",
      "data.colorType",
      "data.farbtyp",
    ]) || "Analyse erhalten";

  const baseColors = normalizePalette(
    pick(raw, [
      "baseColors",
      "grundfarben",
      "palette.base",
      "palette.baseColors",
      "colors.base",
      "analysis.baseColors",
      "analysis.grundfarben",
      "result.baseColors",
      "data.baseColors",
    ])
  );

  const accentColors = normalizePalette(
    pick(raw, [
      "accentColors",
      "akzentfarben",
      "palette.accent",
      "palette.accentColors",
      "colors.accent",
      "analysis.accentColors",
      "analysis.akzentfarben",
      "result.accentColors",
      "data.accentColors",
    ])
  );

  const noGoColors = normalizePalette(
    pick(raw, [
      "noGoColors",
      "nogoColors",
      "no_go_colors",
      "noGo",
      "nogos",
      "palette.noGo",
      "colors.noGo",
      "analysis.noGoColors",
      "analysis.no_go_colors",
      "result.noGoColors",
      "data.noGoColors",
    ])
  );

  const noGoText =
    pick(raw, [
      "noGoText",
      "noGoDescription",
      "nogoText",
      "avoidText",
      "beschreibung",
      "analysis.noGoText",
      "analysis.noGoDescription",
      "result.noGoText",
      "data.noGoText",
    ]) || "";

  const imageUrl =
    pick(raw, [
      "imageUrl",
      "portraitUrl",
      "analysis.imageUrl",
      "result.imageUrl",
      "data.imageUrl",
    ]) || "";

  return {
    colorType: String(colorType).trim(),
    baseColors,
    accentColors,
    noGoColors,
    noGoText: String(noGoText).trim(),
    imageUrl: String(imageUrl).trim(),
    receivedAt: new Date().toISOString(),
  };
}

function pick(source, paths) {
  for (const path of paths) {
    const value = getPath(source, path);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function getPath(source, path) {
  if (!source || typeof source !== "object") return undefined;
  return path.split(".").reduce((current, key) => {
    if (current && Object.prototype.hasOwnProperty.call(current, key)) return current[key];
    return undefined;
  }, source);
}

function normalizePalette(value) {
  if (!value) return [];

  if (typeof value === "string") {
    const hexes = value.match(/#?[0-9a-fA-F]{6}\b/g) || [];
    return hexes.map((hex) => normalizeColorItem(hex));
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value)
      .map(([name, val]) =>
        normalizeColorItem({ name, ...(typeof val === "object" ? val : { hex: val }) })
      )
      .filter(Boolean);
  }

  if (!Array.isArray(value)) return [];
  return value.map(normalizeColorItem).filter(Boolean).slice(0, 12);
}

function normalizeColorItem(item) {
  if (!item) return null;

  if (typeof item === "string") {
    const hex = normalizeHex(item);
    return hex ? { hex, name: hex.toUpperCase() } : null;
  }

  if (typeof item === "object") {
    const hexCandidate = item.hex || item.color || item.value || item.code || item.hsl || item.rgb;
    const hex = normalizeHex(hexCandidate);
    if (!hex) return null;
    const name = item.name || item.label || item.title || hex.toUpperCase();
    return { hex, name: String(name) };
  }

  return null;
}

function normalizeHex(value) {
  if (!value) return "";
  const raw = String(value).trim();

  const long = raw.match(/^#?([0-9a-fA-F]{6})$/);
  if (long) return `#${long[1].toLowerCase()}`;

  const short = raw.match(/^#?([0-9a-fA-F]{3})$/);
  if (short) {
    return `#${short[1]
      .split("")
      .map((char) => char + char)
      .join("")
      .toLowerCase()}`;
  }

  const rgb = raw.match(/rgba?\((\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (rgb) {
    const parts = rgb.slice(1, 4).map((part) => Math.max(0, Math.min(255, Number(part))));
    return `#${parts.map((part) => part.toString(16).padStart(2, "0")).join("")}`;
  }

  return "";
}

function renderResult(analysis = null, raw = null, portraitOverride = "") {
  const hasAnalysis = Boolean(analysis);
  const data = analysis || {
    colorType: "Noch keine Analyse",
    baseColors: [],
    accentColors: [],
    noGoColors: [],
    noGoText: "",
  };

  els.colorTypeText.textContent = data.colorType || "Analyse erhalten";
  renderPalette(els.baseColors, data.baseColors || []);
  renderPalette(els.accentColors, data.accentColors || []);
  renderPalette(els.noGoColors, data.noGoColors || [], true);

  els.noGoText.textContent =
    data.noGoText ||
    (hasAnalysis
      ? "Die API hat keine No-Go-Beschreibung geliefert."
      : "Mache zuerst ein Foto, damit deine persönlichen Farben angezeigt werden.");
  els.resultPortrait.src =
    portraitOverride ||
    data.imageUrl ||
    state.selectedPhotoDataUrl ||
    "assets/portrait-default.webp";

  if (raw) {
    els.rawResponse.hidden = false;
    els.rawJson.textContent = JSON.stringify(raw, null, 2);
  } else {
    els.rawResponse.hidden = true;
    els.rawJson.textContent = "";
  }
}

function renderPalette(container, colors, compact = false) {
  container.innerHTML = "";
  if (!colors.length) {
    const empty = document.createElement("span");
    empty.className = "empty-palette";
    empty.textContent = "Noch nicht verfügbar";
    container.append(empty);
    return;
  }

  colors.forEach((color) => {
    const swatch = document.createElement("button");
    swatch.type = "button";
    swatch.className = compact ? "swatch compact" : "swatch";
    swatch.style.setProperty("--color", color.hex);
    swatch.title = `${color.name} ${color.hex}`;
    swatch.setAttribute("aria-label", `${color.name} ${color.hex}`);
    container.append(swatch);
  });
}

function persistAnalysis(analysis, raw) {
  safeLocalStorageSet(
    STORAGE_KEYS.analysis,
    JSON.stringify({ analysis, raw, createdAt: new Date().toISOString() })
  );
}

function setCameraMessage(message, type) {
  els.cameraMessage.textContent = message;
  els.cameraMessage.classList.remove("error", "success");
  if (type) els.cameraMessage.classList.add(type);
}

function setBusy(button, busy, label = "") {
  if (!button) return;
  if (busy) {
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    const labelNode = button.querySelector("span:last-child") || button;
    labelNode.textContent = label || "Bitte warten...";
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => els.toast.classList.remove("show"), 2800);
}

async function promptInstall() {
  if (!state.deferredInstallPrompt) {
    showToast("Installation: In Safari über Teilen > Zum Home-Bildschirm hinzufügen.");
    return;
  }
  state.deferredInstallPrompt.prompt();
  await state.deferredInstallPrompt.userChoice.catch(() => undefined);
  state.deferredInstallPrompt = null;
  if (els.installButton) els.installButton.hidden = true;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!["http:", "https:"].includes(location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((error) => console.warn("Service Worker konnte nicht registriert werden:", error));
  });
}

function safeLocalStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_) {
    return "";
  }
}

function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_) {
    /* Storage may be blocked. */
  }
}

function safeLocalStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (_) {
    /* Storage may be blocked. */
  }
}

function safeSessionStorageGet(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (_) {
    return "";
  }
}

function safeSessionStorageSet(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (_) {
    /* Storage may be blocked. */
  }
}

function safeSessionStorageRemove(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (_) {
    /* Storage may be blocked. */
  }
}

function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function mergeConfig(base, override) {
  if (!override || typeof override !== "object") return base;
  const output = Array.isArray(base) ? [...base] : { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = output[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      baseValue &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      output[key] = mergeConfig(baseValue, value);
    } else if (Array.isArray(value)) {
      output[key] = [...value];
    } else {
      output[key] = value;
    }
  }
  return output;
}
