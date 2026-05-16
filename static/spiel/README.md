# Eskyna Style Run

Ein statisches Browser-Spiel für `https://eskyna.com/spiel`: keine Dependencies, kein Build-Prozess, kein Tracking.

## Dateien

- `index.html` - Markup, Meta-Tags und Overlays
- `styles.css` - Layout, responsive Styling und Eskyna-nahe Farbwelt
- `game.js` - Canvas-Endless-Runner mit Score, Natalia-Figur, Kleeblatt-Items, Hindernissen und EStyle-Auswertung

## Hosting unter `/spiel`

1. Auf dem Webserver den Ordner `spiel` anlegen.
2. Die drei Dateien `index.html`, `styles.css` und `game.js` in diesen Ordner kopieren.
3. Aufrufen: `https://eskyna.com/spiel/`

Die Pfade für CSS und JavaScript sind bewusst relativ (`./styles.css`, `./game.js`), damit das Spiel direkt in einem Unterordner läuft. Die Bildassets werden aus den bestehenden Eskyna-Pfaden geladen: `https://eskyna.com/images/Natalia_white_hero.png` und `https://eskyna.com/images/sign.png`.

## Steuerung

- Desktop: Leertaste oder Pfeil hoch = springen, Pfeil runter = ducken, P = Pause
- Mobil: Tippen = springen, nach unten wischen oder Button = ducken

## Anpassung

- CTA-Link: In `index.html` beim Link mit `id="estyleLink"` aktuell `/estyle` ändern, falls die Zielseite anders heißt.
- Farben: In `styles.css` die CSS-Variablen im `:root`-Block anpassen.
- Texte und Auswertung: In `game.js` in `setResultCopy()` bearbeiten.
- Items/Hindernisse: In `game.js` die Arrays `itemTypes` und `obstacleTypes` bearbeiten.
- Bildassets: In `game.js` im Objekt `ASSET_URLS` die Pfade für Natalia und das Kleeblatt ändern, falls sie später verschoben werden.

## Datenschutz

Das Spiel sendet keine Daten an Server. Nur der Highscore wird lokal im Browser per `localStorage` gespeichert.
