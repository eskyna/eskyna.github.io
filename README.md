# Natalia Kleemann Style & Image Coaching

Website for ESKYNA, built with Hugo.

Live: <https://eskyna.com>

## What this project contains

This repository contains the bilingual ESKYNA website.
German content is the source of truth. Russian content follows the same structure.

## Quick start

Prerequisites:

- Hugo
- Node.js
- npm or yarn

Start local development:

```bash
hugo server -D
```

Build production output:

```bash
npm run build
```

Run checks:

```bash
npm run lint
npm run translation-sync:check
```

## Project structure

```text
.
├── archetypes/              # Hugo content templates
├── content/
│   ├── de/                  # German source content
│   └── ru/                  # Russian localized content
├── data/
│   └── design_tokens.yaml   # Machine readable brand tokens
├── docs/                    # Project, brand and quality docs
├── layouts/                 # Hugo templates and partials
├── static/
│   ├── css/main.css         # Global styles and runtime design tokens
│   └── css/machn.css        # MACHN campaign styles
├── bin/                     # Quality and helper scripts
├── .github/                 # Workflows and Copilot instructions
├── config.toml              # Hugo configuration
└── package.json             # Node scripts and dev dependencies
```

## AI and Copilot guidance

GitHub Copilot should read:

- `.github/copilot-instructions.md`
- `docs/AI_CONTEXT.md`
- `docs/GLOSSAR_MASTERPLAN_2026-07-19.md`
- `docs/BRAND_STYLEGUIDE.md`
- `docs/DESIGN_SYSTEM.md`
- `data/design_tokens.yaml`

Core rules:

- German marketing copy uses the Du Form.
- Russian marketing copy uses respectful `вы`.
- German marketing copy avoids em dashes and en dashes.
- Sentences should be short, concrete and warm.
- Standard components use the color tokens in `static/css/main.css`.

## Content workflow

When editing German content:

1. Edit the matching file in `content/de`.
2. Check whether the matching Russian file in `content/ru` needs a structural update.
3. Keep frontmatter keys aligned.
4. Localize Russian text instead of copying German placeholders.
5. Run the copy and translation checks.

Useful commands:

```bash
node bin/check-copy-style
node bin/translation-sync
```

## Design workflow

Use the design system before adding new CSS.
The runtime token source is the `:root` block in `static/css/main.css`.
The machine readable reference is `data/design_tokens.yaml`.

Prefer these semantic variables:

```css
--bg
--bg-soft
--page-wash
--text
--muted
--accent
--accent-strong
--surface-card-soft
--card-border
```

Do not invent new beige, gold or brown values for standard website components.

## Quality assurance

Formatting and linting:

```bash
npm run format
npm run format:check
npm run lint
npm run lint:css
npm run lint:md
npm run lint:copy
```

Other checks:

```bash
npm run translation-sync:check
npm run seo-audit
npm run test:responsive
```

## Key files

- `content/de/_index.md`: German homepage content.
- `content/ru/_index.md`: Russian homepage content.
- `layouts/index.html`: Homepage template.
- `layouts/_default/single.html`: Default page template.
- `layouts/partials/offer-page.html`: Offer page component.
- `layouts/partials/head.html`: Metadata, critical CSS and global CSS loading.
- `static/css/main.css`: Global styles, CSS variables and components.
- `bin/check-copy-style`: Copy style guard for German marketing copy.
- `bin/translation-sync`: Structural sync check for German and Russian pages.

## Deployment

The GitHub Pages workflow lives in `.github/workflows/hugo.yml`.
It checks formatting, linting, translation structure and then builds the Hugo site.

IndexNow setup and operations are documented in `docs/INDEXNOW.md`.

## License

This project is proprietary commercial software.
Usage, copying, modification and redistribution are not permitted without prior written permission from the copyright holder.
See `LICENSE` for details.

## Contact

Website: <https://eskyna.com>
Email: <natalia@eskyna.com>
