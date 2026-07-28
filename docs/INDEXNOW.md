# IndexNow

Diese Dokumentation beschreibt Setup, Betrieb und Wartung der IndexNow-Integration
für <https://eskyna.com/>.

## Status

- Domain: <https://eskyna.com/>
- Endpoint: <https://api.indexnow.org/indexnow>
- Verifizierungsdatei:
  <https://eskyna.com/8633327a-8e29-4a45-8f01-89faf53a2b8c.txt>
- Key-Datei im Repo:
  static/8633327a-8e29-4a45-8f01-89faf53a2b8c.txt

## Komponenten im Projekt

- Trigger-Skript: bin/indexnow-submit-changed
- NPM-Kommandos:
  - npm run indexnow:changed
  - npm run indexnow:changed:dry
- CI-Automation:
  .github/workflows/hugo.yml im Job indexnow

## Wie das Skript arbeitet

Das Skript ermittelt die geänderten Dateien aus einer Git-Range und leitet daraus
URLs ab.

- Content-Änderungen in content/de, content/en, content/ru werden auf die
  entsprechenden Seiten-URLs gemappt.
- Geänderte statische HTML-Dateien in static werden als direkte URLs gemeldet.
- Bei globalen Änderungen wie layouts oder config.toml wird statt Einzel-URLs
  die komplette public/sitemap.xml verwendet.
- Versand erfolgt als POST-Batches an den globalen IndexNow-Endpoint.
- Erfolgreiche Statuscodes sind 200 und 202.

## Lokale Nutzung

Dry run ohne Versand:

npm run indexnow:changed:dry

Echter Versand mit automatischer Git-Range:

npm run indexnow:changed

Optional explizite Range:

node bin/indexnow-submit-changed --from ALT_COMMIT --to NEUER_COMMIT

Optional kompletter Re-Submit aus Sitemap:

node bin/indexnow-submit-changed --all-from-sitemap --sitemap ./public/sitemap.xml

## CI-Automation nach Deploy

Der Job indexnow in .github/workflows/hugo.yml läuft automatisch:

- nur auf main
- nur nach erfolgreichem Build und Deploy
- nur im Live-Modus
- nicht bei Preview-Deploys

Im Job wird das gebaute Artefakt entpackt, public/sitemap.xml bereitgestellt und
danach das Skript mit der Push-Range ausgeführt.

## Key Rotation

Wenn der Key rotiert werden soll:

1. Neuen Key generieren, zum Beispiel mit uuidgen.
2. Neue Datei static/NEUER_KEY.txt anlegen, Inhalt exakt gleich dem Dateinamen
   ohne .txt.
3. Alte Key-Datei aus static entfernen.
4. Deployment laufen lassen.
5. Verifizieren über <https://eskyna.com/NEUER_KEY.txt>.

Wichtig: Es darf immer nur eine gültige IndexNow-Key-Datei in static liegen,
sonst bricht das Skript mit einem Fehler ab.

## Monitoring und Troubleshooting

- 200 oder 202: Submission akzeptiert.
- 400: Request-Format, URL oder Key prüfen.
- 422: Domain-Key-Mismatch oder ungültige URL-Liste.
- 429: Rate Limit erreicht, Einreichungen reduzieren und später erneut senden.

Empfehlung:

- Nur bei echten inhaltlichen Änderungen senden.
- Gleiches URL-Set nicht in hoher Frequenz erneut senden.
- Sitemap weiterhin pflegen, IndexNow ergänzt die Discovery.
