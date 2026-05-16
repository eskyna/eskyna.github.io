# EStyle (beta) PWA

Eine kleine, statische Demo-PWA: Foto aufnehmen, an den Analysedienst senden und die Antwort nutzerfreundlich anzeigen.

## Inhalt

- `index.html` – App Shell und UI
- `styles.css` – Styling
- `app.js` – Fotoauswahl, Bildkomprimierung, API-Call, Ergebnisanzeige, Install-Button
- `manifest.webmanifest` – PWA Manifest
- `sw.js` – Offline App Shell Cache, API Calls werden nicht gecacht
- `icons/` – SVG und PNG App Icons

## API

Die App sendet das vorbereitete Bild als Binary Body an:

```txt
POST https://api.eskyna-style.workers.dev/v1/images
Content-Type: application/octet-stream
Accept: application/json
```

Der Browser setzt den `Origin` Header automatisch. Für produktiven Einsatz sollte die PWA unter `https://eskyna.com` oder einer im Worker erlaubten Origin laufen.

## Lokal testen

Viele PWA-Funktionen benötigen HTTPS. Für einen einfachen lokalen Test genügt:

```bash
cd static/estylepwa
python3 -m http.server 8080
```

Dann `http://localhost:8080` öffnen. Falls der Worker `localhost` nicht in CORS erlaubt, funktioniert die UI, aber der API-Call kann blockiert werden.

## Deployment

Den kompletten Ordner auf `https://eskyna.com/style-scan/` oder an eine andere HTTPS-URL deployen. Bei Unterordner-Deployment funktionieren die relativen Pfade unverändert.

## Anpassung

In `app.js` kann der Dienst bei Bedarf geändert werden:

```js
const API_BASE_URL = "https://api.eskyna-style.workers.dev";
```
