# Color Match Dash für Eskyna

Statisches Mini-Game für `https://eskyna.com/spiel`.

## Dateien

- `spiel/index.html` - Spiel-Markup und Dialoge
- `spiel/styles.css` - Layout, responsive Design, Animationen
- `spiel/game.js` - Spielmechanik, Scoring, Ausstrahlung, Highscore

## Deployment

1. Den Inhalt des Ordners `spiel/` in den Webserver-Pfad `/spiel` kopieren.
2. Sicherstellen, dass `https://eskyna.com/spiel/index.html` ausgeliefert wird.
3. Optional im Footer/Endscreen den CTA-Link in `index.html` anpassen:
   `href="/"` auf die passende Eskyna Basic-, EStyle- oder Farbpass-Seite setzen.

## Spielmechanik

- Oben erscheint ein Anlass: Business Meeting, Date, Kundentermin oder Alltag.
- Farbchips fliegen durch den Spielbereich.
- Klick/Tap auf passende Farben bringt Punkte und Ausstrahlung.
- Falsche Farben kosten Ausstrahlung und brechen die Serie.
- Drei passende Farben bilden eine Kombination und geben Bonuspunkte.
- Die Runde endet nach 60 Sekunden oder wenn Ausstrahlung 0 erreicht.

## Anpassbare Stellen

- Anlaesse: `occasions` in `game.js`
- Farben/Farbwirkung: `colors` in `game.js`
- Rundendauer: `state.time` in `startGame()`
- CTA im Ergebnisdialog: `#cta-link` in `index.html`
