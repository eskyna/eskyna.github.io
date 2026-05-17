# 🔍 SEO Audit Agent

Ein automatisierter SEO-Audit-Agent, der Ihre gesamte Website auf häufige SEO- und Zugänglichkeitsprobleme überprüft.

## 🚀 Installation & Nutzung

### Schnelleinstieg

```bash
# Audit der generierten Seiten (public/)
npm run seo-audit

# Audit der statischen Outfit-Seiten
npm run seo-audit:static

# Audit eines spezifiziehen Verzeichnisses
node bin/seo-audit ./public
```

## 📋 Prüfungen

Der SEO-Agent prüft automatisch auf:

### 🔴 Kritisch (Fehler)

- **Links ohne TITLE-Attribut** - Wichtig für Barrierefreiheit und Hover-Text
- **Links ohne Linktext** - Text oder Aria-Label muss vorhanden sein
- **Bilder ohne ALT-Attribut** - Essentiell für Screen-Reader und SEO

### 🟡 Warnung

- **Bilder ohne TITLE-Attribut** - Verbessert User Experience
- **Seiten ohne Meta-Beschreibung** - Kritisch für SEO
- **Seiten ohne H1-Tag** - Strukturelle Best Practice
- **Leere ALT-Texte** - ALT sollte aussagekräftig sein
- **Seitentitel zu kurz** (< 30 Zeichen) - SEO Best Practice
- **Seitentitel zu lang** (> 60 Zeichen) - Wird in Suchergebnissen abgeschnitten
- **Fehlender lang-Attribut** - HTML-Sprachdeklaration

## 📊 Report-Interpretation

### Beispiel Output

```bash
🔍 Scanning 34 HTML files...

======================================================================
                    📊 SEO AUDIT REPORT
======================================================================

❌ Links without TITLE attribute: 67
   📄 public/colormatch/index.html
      <a class="cta" href="/">...

⚠️  Page titles too short (< 30 chars): 12
   📄 public/index.html (25 chars)

======================================================================
                  Total issues found: 121
======================================================================
```

### Farbcodierung

- **❌ Rot** = Kritische Fehler (müssen behoben werden)
- **⚠️ Gelb** = Warnungen (sollten behoben werden)
- **✅ Grün** = Alles OK

## 🔧 Automatische Nutzung in CI/CD

Sie können den SEO-Audit in Ihre Build-Pipeline integrieren:

```bash
#!/bin/bash
npm run lint
npm run seo-audit
if [ $? -ne 0 ]; then
  echo "SEO Audit failed!"
  exit 1
fi
```

## 📝 Typische Fehlerbehebung

### Links ohne title

```html
<!-- Falsch ❌ -->
<a href="/about/">About</a>

<!-- Richtig ✅ -->
<a href="/about/" title="Über mich">About</a>
```

### Bilder ohne alt

```html
<!-- Falsch ❌ -->
<img src="portrait.png" />

<!-- Richtig ✅ -->
<img src="portrait.png" alt="Natalia Kleemann" title="Natalia Kleemann" />
```

### Seitentitel (30-60 Zeichen)

```html
<!-- Zu kurz ❌ -->
<title>Shop</title>

<!-- Zu lang ❌ -->
<title>Willkommen auf der ESKYNAWebsite - Ihre Stilberatung für Hannover und Online</title>

<!-- Optimal ✅ -->
<title>ESKYNA – Stilberatung Hannover & Online</title>
```

## 🎯 Ziele für dieses Projekt

- **Links ohne TITLE**: 0
- **Links ohne Linktext**: 0 (außer SVG-Icons mit aria-label)
- **Bilder ohne ALT**: 0
- **Seiten ohne Meta-Beschreibung**: 0
- **Seitentitel-Länge**: 30-60 Zeichen

## 🔄 Workflow-Integration

1. Nach Änderungen an Templates → `npm run seo-audit`
2. Vor jedem Deploy → `npm run lint && npm run seo-audit`
3. Im Github Actions:

   ```yaml
   - name: SEO Audit
     run: npm run seo-audit
   ```

## 📚 Verwendete Standards

- [WCAG 2.1 - Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Google - SEO Starter Guide](https://developers.google.com/search/docs)
- [MDN - HTML semantics](https://developer.mozilla.org/en-US/docs/Glossary/Semantics)

---

**Tipp:** Führen Sie den SEO-Audit nach jedem Build aus, um sicherzustellen, dass Ihre Website zugänglich und SEO-optimiert bleibt!
