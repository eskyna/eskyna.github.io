# 🤖 Lint & Format Agent

Ein automatisierter Agent für Code-Linting und Formatierung, der Prettier, Stylelint und Markdownlint orchestriert.

## 🚀 Schnelleinstieg

### Berichte anzeigen (ohne Änderungen)

```bash
npm run lint-and-format
# oder
npm run lint-and-format:check
node bin/lint-and-format
```

### Automatisch beheben (--fix)

```bash
npm run lint-and-format:fix
node bin/lint-and-format --fix
```

## 📋 Was der Agent prüft

### 📝 **Prettier** (Code-Formatierung)

- JavaScript, JSON, Markdown, HTML
- Konsistente Einrückung und Leerzeichen
- Zeilenumbrüche und Quote-Styles
- **Kann automatisch beheben**: ✅ Ja

### 🎨 **Stylelint** (CSS-Linting)

- CSS/SCSS Best Practices
- Farb- und Property-Namen
- Selector-Struktur
- **Kann automatisch beheben**: ⚠️ Teilweise

### 📄 **Markdownlint** (Markdown-Linting)

- Heading-Struktur
- Link und Image Syntax
- Listen-Formatierung
- **Kann automatisch beheben**: ✅ Ja

## 📊 Report-Beispiel

```bash
======================================================================
                  🤖 LINT & FORMAT AGENT - CHECK MODE
======================================================================

Starting automated code quality checks...

📝 Running Prettier (Code Formatter)...
   ✅ All files formatted correctly

🎨 Running Stylelint (CSS Linter)...
   ✅ All CSS files valid

📄 Running Markdownlint (Markdown Linter)...
   ✅ All Markdown files valid

======================================================================
                   📊 LINTING & FORMATTING REPORT
======================================================================

Mode: CHECK-ONLY
Duration: 2.34s

📝 Prettier (Code Formatting)
   ✅ Status: PASS

🎨 Stylelint (CSS Linting)
   ✅ Status: PASS

📄 Markdownlint (Markdown Linting)
   ✅ Status: PASS

✅ All checks passed!

======================================================================
```

## 🔧 NPM Script Integration

In Ihrer `package.json` sind bereits drei Scripts verfügbar:

```json
{
  "scripts": {
    "lint": "npm run lint:css && npm run lint:md",
    "lint-and-format": "node bin/lint-and-format",
    "lint-and-format:check": "node bin/lint-and-format",
    "lint-and-format:fix": "node bin/lint-and-format --fix"
  }
}
```

## 🎯 Workflow-Integration

### Vor dem Commit

```bash
npm run lint-and-format:fix && git add .
```

### Vor dem Deploy

```bash
npm run lint-and-format
if [ $? -ne 0 ]; then
  echo "Code quality check failed!"
  exit 1
fi
```

### GitHub Actions

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run lint-and-format
```

## 🔍 Detaillierte Konfiguration

### Prettier (.prettierrc.json)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "useTabs": false,
  "tabWidth": 2
}
```

### Stylelint (.stylelintrc.json)

```json
{
  "extends": "stylelint-config-standard"
}
```

### Markdownlint (.markdownlintrc.json)

```json
{
  "default": true,
  "MD003": { "style": "consistent" },
  "MD004": { "style": "consistent" },
  "MD013": false
}
```

## 📝 Best Practices

### ✅ DO

```javascript
// Good - clean formatting
const config = {
  name: "ESKYNA",
  version: "1.0.0",
  description: "Professional styling service",
};
```

```css
/* Good - organized and consistent */
.button {
  padding: 1rem;
  background-color: #c5a059;
  border: none;
  border-radius: 4px;
}
```

### ❌ DON'T

```javascript
// Bad - inconsistent spacing
const config = {
  name: "ESKYNA",
  version: "1.0.0",
};
```

```css
/* Bad - inconsistent style */
.button {
  padding: 1rem;
  background-color: #c5a059;
  border: 0;
  border-radius: 4px;
}
```

## 🚨 Typische Fehler & Lösungen

### Prettier-Fehler

```bash
# ❌ Falsch
npm run lint-and-format

# ✅ Richtig
npm run lint-and-format:fix
```

### CSS-Fehler

```bash
# Stylelint meldet Unknown CSS properties
# → Prüfen Sie auf Vendor-Prefixe oder Custom Properties

/* ✅ Korrekt */
.element {
  --custom-color: #c5a059;
  -webkit-transform: scale(1);
  transform: scale(1);
}
```

### Markdown-Fehler

```bash
# Markdownlint meldet MD013 (Zeilenlänge)
# → Prüfen Sie auf zu lange Zeilen

<!-- ✅ Korrekt -->
Dies ist ein Absatz mit angemessener Zeilenlänge,
der nicht zu lang wird.

<!-- ❌ Falsch -->
Dies ist ein sehr langer Absatz der auf einer einzigen Zeile steht und die Markdownlint Zeilenlängen-Regel überschreitet
```

## 🔄 Automatisierte Workflows

### Pre-Commit Hook (mit Husky)

```bash
npx husky install
npx husky add .husky/pre-commit "npm run lint-and-format:fix"
```

### Automatische Fixes vor Push

```bash
#!/bin/bash
# .git/hooks/pre-push

npm run lint-and-format:fix
npm run seo-audit

if [ $? -ne 0 ]; then
  echo "Quality checks failed!"
  exit 1
fi
```

## 📊 Quality Gates

| Tool         | Status | Ziel            |
| ------------ | ------ | --------------- |
| Prettier     | ✅     | 100% formatiert |
| Stylelint    | ✅     | 0 Fehler        |
| Markdownlint | ✅     | 0 Fehler        |
| SEO Audit    | ⚠️     | < 50 Fehler     |

## 🎓 Ressourcen

- [Prettier Dokumentation](https://prettier.io/docs)
- [Stylelint Dokumentation](https://stylelint.io/)
- [Markdownlint Regeln](https://github.com/igorshubovych/markdownlint-cli2#configuration)

---

**Tipp:** Nutzen Sie `npm run lint-and-format:fix` vor jedem Commit, um konsistente Code-Qualität zu halten!
