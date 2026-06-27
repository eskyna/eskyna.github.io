# EStyle Color ID PWA

Dies ist eine mobile-first PWA fuer die ESKYNA/EStyle Color-ID Fotoanalyse. Das Design orientiert sich an den gelieferten Figma-Screens: Welcome-Screen, Social Login, Foto-Regeln, Kamera-Upload und Ergebnisansicht mit Farbpaletten.

## Dateien

- `index.html` - App-Shell und Views
- `styles.css` - komplettes UI-Design
- `app.js` - Routing, Google Login, Kamera, Foto-Komprimierung, API-Upload, Ergebnisdarstellung
- `config.js` - API- und Auth-Konfiguration
- `manifest.webmanifest` - PWA Manifest
- `sw.js` - Service Worker fuer Offline-App-Shell
- `assets/` - aus dem Design extrahierte/optimierte Assets und PWA Icons
- `.htaccess` - optionale Apache-Konfiguration fuer eskyna.com
- `sample-api-response.json` - Beispielantwort fuer Demo-/Frontendtests

## Deployment auf https://eskyna.com

1. Den Inhalt dieses Ordners in das Webroot von `https://eskyna.com` hochladen.
2. `config.js` ist bereits auf denselben Analysedienst wie `https://eskyna.com/estylepwa/` eingestellt:

```js
window.ESKYNA_CONFIG = {
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
    allowedProviders: ["google"],
    attachIdTokenToAnalysisRequest: false,
    firebaseConfig: {
      apiKey: "AIzaSyBLnOeqtIgBUObt5S4G9vImavaeS0lua1E",
      authDomain: "eskyna-style.firebaseapp.com",
      projectId: "eskyna-style",
      storageBucket: "eskyna-style.firebasestorage.app",
      messagingSenderId: "349179931593",
      appId: "1:349179931593:web:332b9c02eaee3e8e525618",
      measurementId: "G-ERP45XHEG9",
    },
  },
};
```

3. Die Firebase Web-App-Konfiguration ist bereits in `config.js` eingetragen.
4. In Firebase Authentication nur den Provider `Google` aktivieren. `Email/Password` deaktiviert lassen. Die PWA enthaelt keine E-Mail-Registrierung, kein Passwortfeld und keinen `createUserWithEmailAndPassword`-Flow.
5. In Firebase unter den autorisierten Domains `eskyna.com` hinterlegen. Falls die App in einem Unterpfad laeuft, bleibt trotzdem die Domain `eskyna.com` relevant.
6. Die App muss ueber HTTPS laufen, sonst verweigern Browser den Kamerazugriff.
7. Nach Aenderungen an gecachten Dateien ggf. in `sw.js` `CACHE_NAME` erhoehen, damit bestehende Installationen die neue Version laden.

Wenn die PWA nicht im Root, sondern z. B. unter `/app/` liegt, muessen `start_url`, `scope` im Manifest sowie die Pfade im Service Worker entsprechend angepasst werden.

## Login-Logik

Die geschuetzten Bereiche `Color ID erstellen`, `Foto aufnehmen` und `Meine Analyse` sind hinter Login geschaltet. Der Startscreen zeigt nur `Loslegen`; wenn Nutzerinnen noch nicht eingeloggt sind, fuehrt `Loslegen` automatisch zur Login-Ansicht.

Implementiert ist Firebase Authentication mit Redirect-Flow fuer mobile Browser/PWAs:

- Google Login: `GoogleAuthProvider`
- Persistenz: lokale Firebase Auth Session plus minimales UI-Profil in `localStorage`
- Logout: im Seitenmenue ueber `Abmelden`

Es gibt bewusst keinen separaten E-Mail-Account in der PWA. Auch die alte E-Mail-Form wurde entfernt.

Optional kann der Firebase ID Token an die Analyse-API gesendet werden:

```js
auth: {
  attachIdTokenToAnalysisRequest: true;
}
```

Dann sendet die App zusaetzlich:

```http
Authorization: Bearer <firebase-id-token>
```

Wichtig: Der Analyse-Worker muss dann CORS fuer den Header `Authorization` erlauben und das Firebase ID Token serverseitig pruefen.

## API-Vertrag Fotoanalyse

Die App sendet das vorbereitete JPEG standardmaessig wie die bestehende `estylepwa` als Binary Body an den Worker:

```http
POST https://api.eskyna-style.workers.dev/v1/images
Content-Type: application/octet-stream
Accept: application/json
```

Das Bild wird vor dem Upload auf maximal 1600 px Kantenlaenge skaliert und mit JPEG-Qualitaet 0.88 erzeugt.

Optional kann in `config.js` `uploadMode: 'multipart'` gesetzt werden. Dann sendet die App `multipart/form-data` mit dem Feld `photo`. Bei aktivem Login werden zusaetzlich `userId`, `email` und `authProvider` als Formularfelder mitgesendet.

Erwartete JSON-Antwort, empfohlenes Format:

```json
{
  "colorType": "SANFT- KALT",
  "baseColors": [{ "name": "Navy", "hex": "#00203d" }],
  "accentColors": [{ "name": "Rose", "hex": "#ed839e" }],
  "noGoColors": [{ "name": "Orange", "hex": "#f57100" }],
  "noGoText": "Eigelb, Tomate, Orange, Senf - sie lassen dein Teint muede und gelblich wirken.",
  "imageUrl": "https://eskyna.com/uploads/analysis/user-image.jpg"
}
```

Die App akzeptiert zusaetzlich einige alternative Feldnamen wie `farbtyp`, `grundfarben`, `akzentfarben`, `no_go_colors`, `analysis.colorType` oder `result.baseColors`.

## Lokaler Test

Fuer einen Frontendtest ohne Analyse-Backend kann in `config.js` temporaer `demoMode: true` gesetzt werden. Fuer echte Login-Tests muss die laufende Domain in Firebase autorisiert sein.

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` oeffnen. Fuer echte Kamera-Tests auf dem Smartphone sollte ueber HTTPS getestet werden.
