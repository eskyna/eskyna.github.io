# Copilot instructions for ESKYNA

## Project context

This is the Hugo website for ESKYNA, Natalia Kleemann's style and image coaching brand.
The site is bilingual:

- German content is the source of truth: `content/de`.
- Russian content mirrors the German structure: `content/ru`.
- Reusable layouts live in `layouts`.
- Global CSS lives in `static/css/main.css`.
- Campaign specific CSS, for example MACHN, lives in separate files such as `static/css/machn.css`.

## Brand voice

Write German marketing copy in the Du Form.
Use clear, warm and confident language.
Use short sentences.
Prefer concrete benefits over broad claims.
Avoid filler words.
Avoid generic AI phrases.
Do not use formal address in German marketing copy.
Use `du`, `dein`, `dich`, `dir`.
Do not use `Sie`, `Ihnen`, `Ihr`, `Ihre` as customer address.
Legal pages can keep formal or legal wording when needed.

Russian copy uses respectful `вы` consistently.
Do not mix Russian `ты` and `вы`.

## Punctuation and wording

Do not use em dashes or en dashes in German marketing copy.
Avoid the typical AI dash rhythm.
Use a period, comma, colon or a short new sentence instead.
Normal ASCII hyphens are fine for real compound words.

Prefer:

- `Dein Stil wird klarer. Deine Garderobe wird leichter.`
- `Du bekommst Orientierung für Farben, Schnitte und Wirkung.`
- `Für Business, Alltag und besondere Momente.`

Avoid:

- `Dein Stil wird klarer - und deine Garderobe leichter.`
- `Dein Stil wird klarer [em dash] und deine Garderobe leichter.`
- `Entdecken Sie Ihren Stil.`

## Design system

Use the tokens in `static/css/main.css` and the reference in `data/design_tokens.yaml`.
Do not invent new colors for normal site components.
Use the semantic aliases first:

- `--bg`
- `--bg-soft`
- `--page-wash`
- `--text`
- `--muted`
- `--accent`
- `--accent-strong`
- `--surface-card-soft`
- `--card-border`

MACHN may use its campaign tokens in `static/css/machn.css`, but should stay close to the brand palette.

## Content editing rules

When editing a German page, check whether the matching Russian page exists.
If the German frontmatter structure changes, update the Russian structure too.
Keep translated copy localized.
Do not paste German copy into Russian pages as a placeholder.

Use existing frontmatter patterns.
Keep section names stable unless the matching layout is updated too.

## Quality commands

Run these before committing when possible:

```bash
npm run lint
npm run translation-sync:check
npm run build
```

If Hugo is not installed locally, at least run:

```bash
node bin/check-copy-style
node bin/translation-sync
```
