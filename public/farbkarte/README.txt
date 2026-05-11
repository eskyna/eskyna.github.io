Eskyna Farbkarte PWA
====================

Diese Version enthält nur noch die eigentliche Farbkarte-App.
Die frühere Marketing-/Mockup-Seite um das Handy herum wurde entfernt.

Hosting unter https://eskyna.com/farbkarte/
------------------------------------------
1. ZIP entpacken.
2. Den Inhalt des Ordners "eskyna-farbkarte" in den Webserver-Ordner /farbkarte/ kopieren.
3. Danach öffnen: https://eskyna.com/farbkarte/

Enthalten:
- index.html
- styles.css
- app.js
- manifest.webmanifest
- service-worker.js
- assets/sign.png
- PWA-Icons
- .htaccess

Hinweise:
- Kein Build-Prozess nötig.
- Kein React, kein Node, keine externen Dependencies.
- HTTPS ist für Installation und Offline-Funktion erforderlich.
- Über ?palette=soft-summer oder ?palette=clear-winter kann eine Palette direkt geöffnet werden.
