# AI context for ESKYNA

This document helps GitHub Copilot and other AI tools understand the project faster.

## What this project is

ESKYNA is a bilingual Hugo website for style and image coaching by Natalia Kleemann.
The core promise is simple: style becomes easier when colors, cuts, personality and desired impact work together.

## Main audience

German site:

- People who want more confidence in clothing, shopping and visual impact.
- Professionals who want a clearer presence in business contexts.
- People who want a wardrobe that fits their current life.

Russian site:

- Same offer structure as the German site.
- Russian copy uses respectful `вы`.

## Source hierarchy

1. German content in `content/de` is the structural source.
2. Russian content in `content/ru` follows that structure.
3. Layouts in `layouts` define which frontmatter keys are rendered.
4. Global visual language is defined in `static/css/main.css`.
5. Design reference is documented in `docs/DESIGN_SYSTEM.md` and `data/design_tokens.yaml`.

## Important files

- `config.toml`: languages, site params, contact endpoint and SEO defaults.
- `content/de/_index.md`: German homepage copy and section data.
- `content/ru/_index.md`: Russian homepage copy and section data.
- `layouts/index.html`: homepage rendering.
- `layouts/_default/single.html`: default page rendering.
- `layouts/partials/offer-page.html`: offer page rendering.
- `static/css/main.css`: global styles and design tokens.
- `static/css/machn.css`: MACHN campaign styles.
- `bin/translation-sync`: checks German and Russian page structure.
- `bin/check-copy-style`: checks brand copy rules.

## Copy principles

German marketing copy is always in the Du Form.
Use direct and human language.
Each sentence should earn its place.
A good section has one clear thought, one concrete benefit and one next step.

Avoid:

- Formal customer address.
- Long AI style sentences.
- Em dashes and en dashes in German marketing copy.
- Generic phrases such as `maßgeschneiderte Lösung`, unless the context is specific.

Prefer:

- `Du erkennst, was wirklich zu dir passt.`
- `Du kaufst bewusster und brauchst weniger Kompromisse.`
- `Dein Stil wirkt klarer, hochwertiger und mehr nach dir.`

## Translation principles

Do not translate word for word.
Preserve structure.
Preserve meaning.
Preserve offer logic.
Localize rhythm and tone.

German uses `du`.
Russian uses respectful `вы`.

## Design principles

The brand should feel warm, clear, refined and calm.
Use earth tones, soft contrast and generous white space.
Avoid loud colors for normal components.
Use gold only as an accent.
Use Espresso Brown for text instead of pure black.
