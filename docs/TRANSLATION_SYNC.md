# Translation Sync Agent

## Übersicht

Der **Translation Sync Agent** synchronisiert Änderungen von der deutschen (DE) Seite zu allen anderen Übersetzungen. Er überwacht strukturelle Änderungen und stellt sicher, dass Metadaten (wie Bildpfade, Icons, Datum) über alle Sprachversionen hinweg konsistent bleiben, während die übersetzten Inhalte erhalten bleiben.

## Features

✅ **Struktur-Vergleich**: Detectiert Unterschiede in der Seitenstruktur zwischen DE und RU  
✅ **Bildpfad-Validierung**: Prüft, ob alle Bilder in DE auch in RU vorhanden sind  
✅ **Sektion-Zählung**: Verifiziert, dass beide Versionen die gleiche Anzahl von Abschnitten haben  
✅ **Metadaten-Sync**: Synchronisiert non-content Felder (Image, Icon, Date, etc.)  
✅ **CHECK & SYNC Modi**: CHECK zeigt nur Probleme an, SYNC wendet Änderungen an

## Installation

Agent ist bereits in `bin/translation-sync` vorhanden.

## Verwendung

### CHECK Mode (Standard)

Analysiert die Deutsche und Russischen Inhalte ohne Änderungen vorzunehmen:

```bash
npm run translation-sync
# oder
node bin/translation-sync
```

Gibt einen farbcodierten Report mit Problemen:

- ✅ Aktualisierte Seiten (Struktur identisch)
- ⚠️ Seiten die Sync benötigen (strukturelle Unterschiede)
- ❌ Fehlende RU Übersetzungen

### SYNC Mode

Wendet automatische Fixes an (Metadaten-Synchronisation):

```bash
npm run translation-sync:apply
# oder
node bin/translation-sync --sync
```

**ACHTUNG**: Dieser Modus modifiziert RU Dateien! Verwenden Sie mit Vorsicht und committen Sie zuerst zu Git.

## Beispiel Output

```bash
======================================================================
🌍 TRANSLATION SYNC AGENT
======================================================================

Running in CHECK mode (use --sync to apply changes)

Analyzing German (DE) content structure...
Checking Russian (RU) translations...
Scanning for structure changes...
Generating report...

======================================================================
📊 TRANSLATION SYNC REPORT
======================================================================

📄 Content Pages:
   Total DE pages: 8
   ✅ Up-to-date RU pages: 1
   ⚠️  Pages needing sync: 7
   ❌ Missing RU translations: 0

📋 Issues Found:

[SECTIONS] datenschutz/index.md
   DE: 22 sections | RU: 9 sections
[SECTIONS] estyle/index.md
   DE: 6 sections | RU: 5 sections

======================================================================

Duration: 0.01s
```

## Fehlertypen

### [MISSING]

RU Übersetzungsdatei existiert nicht. Manuell erstellen erforderlich:

```bash
# Beispiel: Kopieren Sie die DE-Datei und übersetzen Sie diese
cp content/FILENAME content/ru/FILENAME
```

### [SECTIONS]

Unterschiedliche Anzahl von Abschnitten (##) zwischen DE und RU. Dies deutet darauf hin, dass:

- Neue Abschnitte zu DE hinzugefügt wurden
- Abschnitte aus RU entfernt wurden
- Synchronisation erforderlich ist

**Aktion**:

- Überprüfen Sie die Unterschiede manuell
- Harmonisieren Sie die Struktur
- Übersetzen Sie neue Inhalte

### [IMAGES]

Bildpfade sind zwischen DE und RU unterschiedlich:

- **Missing in RU**: Bilder werden in DE verwendet, aber nicht in RU
- **Extra in RU**: Bilder in RU, die in DE nicht verwendet werden

**Aktion**:

- Überprüfen Sie die verwendeten Bilder
- Aktualisieren Sie die RU Datei, um die gleichen Bilder zu verwenden

## Integration in CI/CD

Fügen Sie den Agent zu Ihrem CI/CD-Pipeline hinzu:

### GitHub Actions

```yaml
name: Translation Sync Check

on: [pull_request]

jobs:
  translation-sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm install
      - run: npm run translation-sync
```

### Pre-commit Hook (Husky)

```bash
# .husky/pre-commit
npm run translation-sync
```

## Best Practices

1. **Vor neuen Übersetzungen**: Führen Sie `npm run translation-sync` aus, um den aktuellen Status zu überprüfen
2. **Nach DE-Änderungen**: Führen Sie den Agent aus, um zu sehen, was in RU angepasst werden muss
3. **Regelmäßige Audits**: Lassen Sie den Agent als Teil Ihrer regelmäßigen QA laufen
4. **Versionskontrolle**: Committen Sie vor dem Ausführen von `--sync` mode

## Architektur

Agent in Node.js:

- Liest alle `.md` Dateien aus `content/` und `content/ru/`
- Vergleicht Frontmatter (YAML) und Markdownstruktur
- Erstellt Fehlerberichte gruppiert nach Schweregrad
- Optional: Synchronisiert konfigurierbare Felder automatisch

**Konfigurierbare Sync-Felder** (in `bin/translation-sync`):

```javascript
const syncFields = ["image", "icon", "date", "draft", "weight", "type"];
```

Diese Felder werden bei `--sync` automatisch von DE zu RU kopiert.

## Troubleshooting

**Agent zeigt "exit code 1" aber keine Probleme?**
→ Eine oder mehr der erkannten Probleme werden noch verarbeitet

**RU Datei wird nicht erkannt?**
→ Überprüfen Sie, dass die Datei unter `content/ru/SECTION/index.md` vorhanden ist

**Zu viele falsche Positive?**
→ Verfeinern Sie die Erkennungslogik in `bin/translation-sync`

## Weitere Locales hinzufügen

Um einen neuen Language Locale (z.B. Französisch) hinzuzufügen:

1. Erstellen Sie `content/fr/` Ordner
2. Kopieren Sie die DE-Struktur nach `content/fr/`
3. Aktualisieren Sie `config.toml` mit neuer Sprache
4. Passen Sie `bin/translation-sync` an, um mehrere Locales zu unterstützen
