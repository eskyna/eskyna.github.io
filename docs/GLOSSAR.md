# ESKYNA Glossar – Richtlinien für Schreiber und Designer

Das ESKYNA Glossar ist kein trockenes Lexikon, sondern ein **stilvolles Beratungsformat**. Es hilft Nutzerinnen und Nutzern, ihr Stilverständnis zu vertiefen und Fehlkäufe zu vermeiden.

Die Seiten unter `/glossar` sind als elegante, präzise Stilberatungstexte konzipiert: ruhig in der Tonalität, hochwertig in der Gestaltung, praktisch in der Anwendung.

---

## 1. Tonalität: Wie ESKYNA im Glossar klingt

### Grundprinzipien

Die Sprache ist:

- **Elegant, aber nicht abgehoben.** Keine künstlichen Modefloskeln, keine übertriebene Luxus-Sprache. Lieber präzise Sätze mit Stilgefühl.
- **Professionell, aber warm.** ESKYNA darf fachlich auftreten, soll aber nicht streng oder distanziert wirken.
- **Klar, aber nicht banal.** Einfach verständlich, aber nicht nach Anfänger-Ratgeber klingend.
- **Beratend, nicht verkaufend.** Der Leser hat das Gefühl: „Jetzt verstehe ich meinen Stil besser." Nicht: „Mir wird etwas verkauft."
- **Sinnlich, aber kontrolliert.** Mode ist visuell und haptisch. Begriffe wie weich, fließend, strukturiert, matt, klar, ruhig, tief, leicht, schwer, kühl, warm, glänzend dürfen bewusst eingesetzt werden.

### Empfohlene Schlüsselwörter

Diese Wörter passen zur ESKYNA-Marke:

klar · bewusst · stimmig · hochwertig · tragbar · souverän · leicht · ruhig · modern · elegant · persönlich · authentisch · präzise · strukturiert · fein · reduziert · ausdrucksstark · harmonisch · wirkungsvoll · alltagstauglich

### Zu vermeidende Wörter und Phrasen

Diese wirken schnell beliebig oder zu werblich:

- mega, super stylish, Must-have, Fashionista
- It-Piece (außer bewusst erklärt)
- ultra trendy, jeder braucht, geht immer
- „steht jeder Frau", „Problemzone", „kaschieren um jeden Preis"
- „perfekter Körper", „No-Go"

ESKYNA arbeitet nicht mit Unsicherheit, sondern mit Klarheit.

---

## 1.1 Interpunktion und Wording – Die ESKYNA Regel

ESKYNA-Texte vermeiden den typischen „ChatGPT-Bindestrich" – den Gedankenstrich (– oder —), der KI-generierte Texte kennzeichnet.

**Regel: Keine Gedankenstriche im Marketing-Text verwenden.**

### So ersetzt du Gedankenstriche:

**❌ Falsch (ChatGPT-Stil):**

> „Eine gute Passform bedeutet – nicht zu eng, aber auch nicht zu locker – die richtige Balance zu finden."
>
> „15–20 Kombinationen möglich."

**✅ Richtig (ESKYNA-Stil):**

> „Eine gute Passform bedeutet, die richtige Balance zu finden. Nicht zu eng, aber auch nicht zu locker."
>
> „15 bis 20 Kombinationen möglich."

### Konkrete Ersetzungen:

| ❌ Vermeiden             | ✅ Verwenden                                            |
| ------------------------ | ------------------------------------------------------- |
| `Text – weitere Info`    | `Text. Weitere Info` oder `Text, weitere Info`          |
| `5–10 Teile`             | `5 bis 10 Teile`                                        |
| `Text – also richtig`    | `Text. Das bedeutet: richtig` oder `Text, also richtig` |
| `Punkt – nicht schlecht` | `Punkt. Nicht schlecht` oder `Punkt, nicht schlecht`    |

**Warum?** Gedankenstriche wirken maschinell geschrieben. ESKYNA-Texte sind menschlich, direkt und eigenwillig.

---

## 2. Aufbau eines Standard-Glossarbeitrags

Jeder Glossarbeitrag folgt dieser Struktur (für Begriffe wie Capsule Wardrobe, Passform, Layering, etc.):

### 2.1 Frontmatter (Hugo)

```yaml
---
title: "Was ist Passform?"
description: "Passform entscheidet über die Wirkung eines Kleidungsstücks oft stärker als Preis oder Marke."
category: "Schnitt & Proportionen"
tags: ["passform", "schnitt", "proportionen"]
weight: 25
glossar_order: "p" # Für alphabetische Sortierung
---
```

**Wichtig:**

- `category`: Nutzen Sie die festen Kategorien (siehe Abschnitt 7: Kategorien und Taxonomie)
- `glossar_order`: Einzelner Buchstabe für A-Z-Sortierung
- `weight`: Für Seiten-Reihenfolge innerhalb einer Kategorie (höher = weiter oben)

### 2.2 Titel

Kurz und suchmaschinenfreundlich. Nutzen Sie Frageformat:

- „Was ist eine Capsule Wardrobe?"
- „Was bedeutet A-Linie?"
- „Wie wirkt Passform?"

**Nicht:**

- Nur der Begriff: „Passform"
- Zu lang: „Alles, was du über Passform wissen musst"

### 2.3 Kurze Definition (ca. 2-3 Sätze)

Stellen Sie direkt nach der Überschrift eine klare, einfache Definition bereit.

**Beispiel:**

> **Passform** beschreibt, wie ein Kleidungsstück am Körper sitzt und fällt. Sie entscheidet oft stärker über die Wirkung als der Preis oder die Marke – ein schlichtes Teil mit guter Passform wirkt hochwertiger als ein teures Teil, das nicht richtig sitzt.

### 2.4 Einfach erklärt (ca. 2-4 Absätze)

Hier wird der Begriff menschlich und alltagsnah erklärt. Nutzen Sie konkrete Situationen.

**Beispiel:**

> Es geht nicht um Perfektion, sondern um Stimmigkeit. Eine gute Passform bedeutet: Die Schultern sitzen richtig, der Armausschnitt erlaubt Bewegung, Längen sind harmonisch, und der Stoff fällt elegant, nicht verknittert.
>
> Bei Hosen sitzt eine gute Passform in der Taille, ohne zu zwicken. Der Oberschenkel hat ein wenig Bewegungsfreiheit, ohne zu schlabbern. Die Saumlänge reicht bis zur Ferse oder sitzt elegant auf dem Schuh.

### 2.5 Warum dieser Begriff wichtig ist (ca. 1-2 Absätze)

Hier kommt die ESKYNA-Haltung hinein: Warum ist dieser Begriff relevant für besseren Stil und weniger Fehlkäufe?

**Beispiel:**

> Wenn du deine Passform-Standards kennst, erkennst du schneller, welche Teile wirklich zu dir passen. Das reduziert Fehlkäufe dramatisch. Eine schlechte Passform können keine teuren Stoffe oder bekannte Designer-Namen ausgleichen.

### 2.6 Typische Missverständnisse (optional, aber empfohlen)

Dieser Abschnitt macht die Texte professionell und hilfreich.

**Format:**

```
**Missverständnis:** Gute Passform bedeutet, eng zu sitzen.

**Besser:** Gute Passform bedeutet, dass das Teil an den richtigen Stellen sitzt – ohne zu zwicken, aber auch ohne zu schlabbern.
```

Nutzen Sie bis zu 2–3 Missverständnisse pro Beitrag.

### 2.7 Praktisches Beispiel oder Checkliste

Ein konkretes Alltagsbeispiel macht den Begriff sichtbar.

**Beispiel:**

> **Checkliste gute Passform:**
>
> - Schultern: Naht endet genau an der Schulterkante
> - Ärmel: Enden knapp über dem Handgelenk
> - Taille: Sitzt an der richtigen Stelle, erlaubt zwei Finger Platz
> - Länge: Harmonisch zur Körpergröße (nicht zu kurz oder zu lang)
> - Bewegung: Du kannst dich beugen und greifen ohne dass das Teil zwickt

### 2.8 ESKYNA-Merksatz (1 Satz, maximal 2)

Ein kurzer, eleganter Satz am Ende des Haupttexts.

**Beispiele:**

- „Ein schlichtes Teil mit guter Passform wirkt wertiger als ein teures Teil, das nicht richtig sitzt."
- „Gute Passform ist die stille Grundlage guten Stils."
- „Passform ist nicht Größe. Passform ist Stimmigkeit."

### 2.9 Verwandte Begriffe

Interne Links zu 3–5 verwandten Glossar-Begriffen (am Ende des Inhalts).

**Format:**

```
**Verwandte Begriffe:**
[Silhouette](/glossar/silhouette/),
[Proportion](/glossar/proportion/),
[Saumlänge](/glossar/saumlange/),
[Key-Piece](/glossar/key-piece/)
```

### 2.10 Subtiler CTA (optional)

Am Ende: Ein sehr dezenter Call-to-Action. Nicht hart verkäuferisch.

**Beispiele:**

- „Du möchtest herausfinden, welche Passformen deine Wirkung am meisten stärken? Eine persönliche Stilberatung hilft dir, deine Standards zu klären."
- „[Mehr über Passform in unserer Stilberatung](/begleitung/)"

---

## 3. Spezialaufbau: Farb-Glossarbeiträge

Farbseiten sind **Editorials im Glossar-Format**. Sie erklären nicht nur die Farbe, sondern ihre Wirkung im Kontext von Nuance, Helligkeit, Material, Schnitt und Styling.

Der **Rosa-Beitrag** ist die Vorlage für alle Farbseiten.

### 3.1 Frontmatter für Farben

```yaml
---
title: "Rosa im Stil erklärt"
description: "Rosa wirkt je nach Nuance, Material und Styling sportlich, elegant, modern oder business-tauglich."
category: "Farb-Lexikon"
color_hex: "#D9A5B2"
tags: ["rosa", "farbe", "farbberatung"]
weight: 15
glossar_order: "r"
---
```

### 3.2 Struktur einer Farbseite

#### Einstieg (ca. 1-2 Sätze)

Nicht mit „Die Farbe X bedeutet ..." beginnen. Stattdessen: Eine Beobachtung oder aktuelle Lesart.

**Gut:**

> Rosa ist eine aufgehellte Form von Rot – aber es wirkt je nach Nuance, Material und Styling völlig unterschiedlich. Rosa kann romantisch, sportlich, elegant, modern oder sogar business-tauglich wirken.

**Nicht gut:**

> Rosa bedeutet Weiblichkeit und Romantik.

#### Wirkung der Farbe (ca. 1-2 Absätze)

Beschreiben Sie die Grundwirkung, ohne absolute Behauptungen.

**Gut:**

> Rosa kann präsent oder zurückhaltend wirken. Ein kräftiges Fuchsia wirkt selbstbewusst. Ein zartes Puderrosa wirkt weicher. Altrosa wirkt erwachsen und subtil.

**Nicht gut:**

> Rosa steht für Liebe und Zärtlichkeit.

#### Nuancen erklären (ca. 1-2 Absätze)

Zeigen Sie, wie die Farbe in verschiedenen Tönen wirkt.

**Beispiel:**

> - **Puderrosa**: Zart, hell, weich – eignet sich für romantische oder pastellige Looks
> - **Altrosa**: Gedämpfter, erwachsener – harmoniert mit Neutral- und Naturfarben
> - **Fuchsia**: Kräftig und präsent – braucht Ruhe im Rest des Outfits
> - **Mauve**: Gedämpft mit Grauanteil – wirkt modern und ruhig

#### Material und Schnitt (ca. 1 Absatz)

Erklären Sie, wie Material die Farbwirkung verändert.

**Beispiel:**

> Rosa in Denim wirkt sportlich und unkompliziert. Rosa in Seide wirkt eleganter. Rosa in feinem Strick wirkt weich. Rosa in straffem Blazerstoff wirkt klarer und souveräner.

#### Kombinationen (ca. 1 Absatz)

Nennen Sie konkrete, funktionierende Kombinationen.

**Beispiel:**

> - Rosa + Denim: modern und entspannt
> - Rosa + Navy: klassisch und zugänglich
> - Rosa + Braun: warm und harmonisch
> - Rosa + Schwarz: elegant und stark
> - Rosa + Creme: weich und hochwertig

#### Für Business und Alltag (ca. 1 Absatz)

Adressieren Sie: Kann ich die Farbe im Business tragen? Wie?

**Wichtig:** Nicht „Diese Farbe steht dir", sondern „Wie kann man sie einsetzen?"

**Beispiel:**

> Rosa im Business wirkt am stärksten, wenn der Schnitt klar bleibt. Eine rosafarbene Bluse unter einem dunklen Blazer ist im Meeting tragbar. Ein komplett rosafarbenes Outfit wirkt eher nach Event. Rosa als Accessoire – Tasche, Schuh, Schal – funktioniert in fast jedem Business-Kontext.

#### Für wen und wo im Outfit (ca. 1 Absatz)

**Wichtig:** Nicht sagen „Diese Farbe steht dir nicht."

Stattdessen: Wo im Outfit kann die Farbe trotzdem funktionieren?

**Beispiel:**

> Wenn Rosa nahe am Gesicht zu blass wirkt, kann es as Hose, Tasche, Schuh, Gürtel, Schal oder Nagellack trotzdem hervorragend funktionieren. So bekommst du die Farbe im Look, ohne dich unwohl zu fühlen.

#### ESKYNA-Merksatz (1-2 Sätze)

**Beispiel:**

> Rosa wirkt nie allein. Es wird durch Styling lesbar. Die Frage ist nicht „Steht mir Rosa?" sondern „Welches Rosa und wo im Outfit funktioniert es für meine Wirkung?"

### 3.3 Visuelles für Farbseiten

**Vom Designer erwartet:**

- **Farbfeld / Farbskala**: Die verschiedenen Nuancen nebeneinander
- **Materialbeispiele**: Wie wirkt die Farbe in verschiedenen Stoffen? (Seide, Leinen, Denim, Strick, Wolle)
- **Kombinationskarten**: 3–5 funktionierende Farbkombinationen
- **Outfit-Kapseln** (optional): 2–3 kleine Outfit-Ideen (z.B. Casual, Elegant, Business)

---

## 4. Checkliste vor Veröffentlichung

Vor jedem Glossarbeitrag durchführen:

- [ ] Titel ist eine Frage oder nutzt das Format „Was ist X?" / „Wie wirkt X?"
- [ ] Definition ist klar und kurz (max. 3 Sätze)
- [ ] Der Text vermeidet absolute Regeln („Das steht dir nicht")
- [ ] Der Text nutzt positive Formulierungen und Klarheit, nicht Druck
- [ ] Kein Wort aus der Zu-vermeiden-Liste wurde verwendet
- [ ] Der Merksatz ist elegant und prägnant
- [ ] Verwandte Begriffe sind intern verlinkt
- [ ] Frontmatter ist vollständig (Titel, Beschreibung, Kategorie, Tags, glossar_order)
- [ ] Für Farben: Nuancen, Material, Kombinationen sind erklärt
- [ ] Der Ton ist beratend, nicht verkaufend

---

## 5. Länge und Umfang

**Standard-Glossarbeiträge:** 250–400 Wörter  
**Farb-Lexikon-Beiträge:** 300–500 Wörter  
**Minimale Länge:** 150 Wörter  
**Maximale Länge:** 600 Wörter (eher Ausnahme)

Kurz ist besser. ESKYNA-Texte sind präzise.

---

## 6. SEO und Kategorisierung

### Suchmaschinen-Optimierung

- **Title:** Nutzen Sie Frageformat für bessere Featured Snippets: „Was ist X?" / „Wie wirkt X?"
- **Description:** 155–160 Zeichen, klare Definition, kein Clickbait
- **Slug:** Einfach und aussagekräftig (`/glossar/passform/`, nicht `/glossar/was-ist-passform-definition/`)
- **Überschriften:** H2 und H3 nutzen, aber nicht überladend

### Frontmatter-Beispiel für SEO:

```yaml
title: "Was ist Passform?"
description: "Passform entscheidet über die Wirkung eines Kleidungsstücks oft stärker als Preis oder Marke."
keywords: ["passform", "schnitt", "größe", "kleidung", "stilberatung"]
```

---

## 7. Kategorien und Taxonomie

Das Glossar ist in diese Hauptkategorien unterteilt:

### Stil & Wirkung

Begriffe wie Stil, Mode, Personal Style, Signature Look, Image, Wirkung, Stilbruch, Quiet Luxury, Minimalismus, Statement-Piece

### Farbberatung & Farbe

Farbtyp, Unterton, Farbtemperatur, Sättigung, Helligkeit, Kontrast, Monochrom, Ton-in-Ton, Akzentfarbe, Neutrale Farben + alle Farb-Lexikon-Beiträge

### Schnitt, Proportion & Passform

Passform, Silhouette, Proportion, Taillierung, A-Linie, H-Linie, V-Linie, Oversized, Layering, Saumlänge

### Garderobe & Alltag

Capsule Wardrobe, Basic, Key-Piece, Garderobenlogik, Fehlkauf, Outfit-Formel, Anlassgarderobe, Business Casual, Smart Casual, Dresscode

### Materialien & Details

Materialfall, Struktur, Glanzgrad, Leinen, Baumwolle, Viskose, Seide, Denim, Accessoire, Styling

### Farb-Lexikon (Unterkategorie)

Schwarz, Weiß, Creme, Grau, Beige, Camel, Braun, Navy, Blau, Grün, Rot, Rosa, Pink, Lila, Orange, Terracotta, Bordeaux, usw.

**Im Frontmatter nutzen:**

```yaml
category: "Schnitt, Proportion & Passform"
tags: ["passform", "schnitt", "proportionen", "silhouette"]
```

---

## 8. Verlinkung und Beziehungen

Glossarbeiträge sind miteinander verlinkt. Nutzen Sie diese Struktur:

- **Verwandte Begriffe am Ende:** 3–5 Links
- **Interne Links im Text:** Wo ein anderer Begriff erwähnt wird, verlinken Sie ihn (keine Überoptimierung)

**Beispiel:**

> Eine gute [Capsule Wardrobe](/glossar/capsule-wardrobe/) basiert auf klarer [Garderobenlogik](/glossar/garderobenlogik/) und bewusster [Passform](/glossar/passform/).

---

## 9. Multilingual: Deutsch und Russisch

### Für Deutsch

- Nutzen Sie durchgehend die **Sie-Form** bei direkter Anrede
- „Du" nur in direkten Fragen oder sehr persönlichen Ratschlägen
- Formatierung und Wortlaut sollten elegant sein

### Für Russisch

- Nutzen Sie durchgehend die **вы-Form** (Höflichkeitsform)
- Mischen Sie nie ты und вы
- Übersetzen Sie nicht mechanisch – lokalisieren Sie den Inhalt

---

## 10. Häufig gestellte Fragen beim Schreiben

**F: Soll ich absolute Regeln aufstellen?**  
A: Nein. ESKYNA arbeitet mit Orientierung, nicht mit Regeln. Nutzen Sie „kann", „wirkt oft", „funktioniert besonders dann, wenn..."

**F: Wie lang sollte ein Beitrag sein?**  
A: 250–400 Wörter für Standard-Begriffe. Farbseiten bis 500 Wörter. Qualität vor Quantität.

**F: Kann ich Emojis nutzen?**  
A: Nein. ESKYNA wirkt elegant und editorialer als mit Emojis.

**F: Wie oft sollte ich verlinken?**  
A: Im Text: 0–3 Links pro Beitrag. Am Ende: 3–5 verwandte Begriffe.

**F: Was ist, wenn ich mir unsicher bin?**  
A: Lesen Sie den Rosa-Beitrag nochmal durch. Kopieren Sie seinen Ton, nicht seinen Wortlaut.

---

## 11. Inhaltliche Roadmap: Erste 25 Glossarbeiträge

Diese Beiträge sollten zuerst veröffentlicht werden (in dieser Reihenfolge):

### Phase 1: Fundament (8 Beiträge)

1. Farbtyp
2. Unterton
3. Kontrast
4. Passform
5. Silhouette
6. Proportion
7. Capsule Wardrobe
8. Garderobenlogik

### Phase 2: Farben & Grundlagen (10 Beiträge)

9. Schwarz
10. Weiß
11. Navy
12. Beige
13. Braun
14. Blau
15. Grün
16. Rot
17. Rosa
18. Bordeaux

### Phase 3: Stil & Alltag (7 Beiträge)

19. Stilbruch
20. Quiet Luxury
21. Signature Look
22. Key-Piece
23. Outfit-Formel
24. Business Casual
25. Statement-Piece

---

## 12. Gestaltungs-Richtlinien für Designer

Das Glossar sollte visuell ruhig und hochwertig wirken: viel Weißraum, klare Typografie, elegante Farbfelder bei Farbseiten, feine Linien, hochwertige Bildsprache.

### Layout-Prinzipien

- **Übersichtsseite:** A-Z-Navigation, Kategorie-Filter, 5–8 empfohlene Einstiege
- **Einzelseite:** Titel + Definition oben, klare Inhaltsstruktur, verwandte Begriffe unten
- **Farbseiten zusätzlich:** Farbfeld/Skala, Materialbeispiele, Kombinationskarten
- **Weißraum:** Großzügig nutzen. Nicht zu voll wirken.

### Typografie

- Headline: Große, klare Schrift (ähnlich wie Blog)
- Body: Bestehende ESKYNA-Typografie nutzen
- Gewichtung: Nicht zu viele verschiedene Gewichte; Fokus auf Lesbarkeit

---

## 13. Technische Umsetzung (Hugo)

### Content-Struktur

```
content/de/glossar/
├── _index.md                  (Glossar-Übersichtsseite)
├── passform.md
├── silhouette.md
├── rosa.md
├── capsule-wardrobe.md
└── ... (weitere Beiträge)

content/ru/glossar/            (Russische Übersetzungen)
├── _index.md
├── passform.md
├── ... (Analoges Setup)
```

### Taxonomie

```toml
[taxonomies]
  category = "categories"
  tag = "tags"
```

### Frontmatter-Template

```yaml
---
title: "Was ist [Begriff]?"
description: "Kurze, prägnante Definition (155–160 Zeichen)."
category: "[Hauptkategorie]"
tags: ["tag1", "tag2", "tag3"]
glossar_order: "[A-Z]"
weight: 25
draft: false
---
```

---

## Kontakt und Fragen

Für Fragen zur Glossar-Tonalität oder Struktur: Kontaktieren Sie die ESKYNA-Redaktion.
