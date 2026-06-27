# EStyle Color ID PWA

Dies ist eine mobile-first PWA für die ESKYNA/EStyle Color-ID Fotoanalyse. Das Design orientiert sich an den gelieferten Figma-Screens: Welcome-Screen, Account-Erstellung, Foto-Regeln, Kamera-Upload und Ergebnisansicht mit Farbpaletten.

## Dateien

- `index.html` - App-Shell und Views
- `styles.css` - komplettes UI-Design
- `app.js` - Routing, Kamera, Foto-Komprimierung, API-Upload, Ergebnisdarstellung
- `config.js` - API-Konfiguration
- `manifest.webmanifest` - PWA Manifest
- `sw.js` - Service Worker für Offline-App-Shell
- `assets/` - aus dem Design extrahierte/optimierte Assets und PWA Icons
- `.htaccess` - optionale Apache-Konfiguration für eskyna.com
- `sample-api-response.json` - Beispielantwort für Demo-/Frontendtests

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
};
```

3. Die App muss über HTTPS laufen, sonst verweigern Browser den Kamerazugriff.
4. Nach Änderungen an gecachten Dateien ggf. in `sw.js` `CACHE_NAME` erhöhen, damit bestehende Installationen die neue Version laden.

Wenn die PWA nicht im Root, sondern z. B. unter `/app/` liegt, müssen `start_url`, `scope` im Manifest sowie die Pfade im Service Worker entsprechend angepasst werden.

## API-Vertrag

Die App sendet das vorbereitete JPEG standardmäßig wie die bestehende `estylepwa` als Binary Body an den Worker:

```http
POST https://api.eskyna-style.workers.dev/v1/images
Content-Type: application/octet-stream
Accept: application/json
```

Das Bild wird vor dem Upload auf maximal 1600 px Kantenlänge skaliert und mit JPEG-Qualität 0.88 erzeugt.

Optional kann in `config.js` `uploadMode: 'multipart'` gesetzt werden. Dann sendet die App `multipart/form-data` mit dem Feld `photo`.

Erwartete JSON-Antwort, empfohlenes Format:

```json
{
  "colorType": "SANFT- KALT",
  "baseColors": [{ "name": "Navy", "hex": "#00203d" }],
  "accentColors": [{ "name": "Rose", "hex": "#ed839e" }],
  "noGoColors": [{ "name": "Orange", "hex": "#f57100" }],
  "noGoText": "Eigelb, Tomate, Orange, Senf - sie lassen dein Teint müde und gelblich wirken.",
  "imageUrl": "https://eskyna.com/uploads/analysis/user-image.jpg"
}
```

Die App akzeptiert zusätzlich einige alternative Feldnamen wie `farbtyp`, `grundfarben`, `akzentfarben`, `no_go_colors`, `analysis.colorType` oder `result.baseColors`.

## Lokaler Test

Für einen Frontendtest ohne Backend kann in `config.js` temporär `demoMode: true` gesetzt werden. Dann wird `sample-api-response.json` verwendet.

```bash
python3 -m http.server 8080
```

Danach `http://localhost:8080` öffnen. Für echte Kamera-Tests auf dem Smartphone sollte über HTTPS getestet werden.
