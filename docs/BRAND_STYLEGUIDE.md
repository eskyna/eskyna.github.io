# ESKYNA brand styleguide

## Brand feeling

ESKYNA should feel warm, clear, refined and personal.
The tone is confident without pressure.
The copy should make style feel easier, not more complicated.

## German tone

German marketing copy uses the Du Form.
Use:

- `du`
- `dich`
- `dir`
- `dein`
- `deine`

Avoid formal customer address:

- `Sie`
- `Ihnen`
- `Ihr`
- `Ihre`

Legal pages such as `Datenschutz` and `Impressum` may keep legal wording.

## Russian tone

Russian marketing copy uses respectful `вы`.
Keep it consistent.
Do not mix `ты` and `вы`.

## Sentence style

Write short and precise sentences.
One sentence should usually contain one thought.
Use active verbs.
Make the benefit concrete.

Good:

- `Du erkennst schneller, was zu dir passt.`
- `Du kaufst bewusster.`
- `Dein Auftritt wirkt klarer.`

Avoid:

- Long abstract explanations.
- Empty promises.
- Generic AI phrases.
- Overuse of adjectives.

## Punctuation

Do not use em dashes or en dashes in German marketing copy.
Use a period, colon, comma or a new sentence instead.

Good:

- `Du bekommst Klarheit: für Farben, Schnitte und Wirkung.`
- `Dein Stil wird ruhiger. Deine Entscheidungen werden leichter.`

Avoid:

- `Du bekommst Klarheit [em dash] für Farben, Schnitte und Wirkung.`
- `Dein Stil wird ruhiger [en dash] und deine Entscheidungen leichter.`

Normal ASCII hyphens are allowed for real compound words.
Examples: `Style-Coaching`, `Online-Beratung`, `B2B-Nutzung`.

## Vocabulary

Prefer these words:

- Klarheit
- Wirkung
- Stilgefühl
- Garderobe
- stimmig
- bewusst
- sichtbar
- hochwertig
- alltagstauglich
- sicherer Auftritt

Use carefully:

- Transformation
- Premium
- exklusiv
- perfekt
- nachhaltig

Avoid unless context is clear:

- revolutionär
- magisch
- unvergleichlich
- maßgeschneidert
- Gamechanger

## CTA style

CTAs should be direct.
They should describe the next step.

Examples:

- `Beratung anfragen`
- `Stilfrage klären`
- `Gutschein anfragen`
- `EStyle testen`

## Content checklist

Before publishing German marketing copy, check:

- Is the copy in the Du Form?
- Are the sentences short?
- Is the benefit concrete?
- Are long dashes removed?
- Does the matching Russian file still match the structure?
- Does the CTA use existing wording patterns?

Run:

```bash
node bin/check-copy-style
node bin/translation-sync
```
