# 🎨 Natalia Kleemann – Style & Image Coaching

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Hugo](https://img.shields.io/badge/Made%20with-Hugo-FF4088?style=flat&logo=hugo)](https://gohugo.io)
[![Build Status](https://github.com/eskyna/eskyna.github.io/actions/workflows/hugo.yml/badge.svg)](https://github.com/eskyna/eskyna.github.io/actions/workflows/hugo.yml)
[![Linting](https://img.shields.io/badge/Linting-Active-brightgreen)](CONTRIBUTING.md)

Professional Style & Image Coaching website built with **Hugo** — fast, clean, and semantic.

**Live:** [eskyna.com](https://eskyna.com)

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Building & Deployment](#-building--deployment)
- [Quality Assurance](#-quality-assurance)
- [Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites

- **Hugo**: [Install Hugo](https://gohugo.io/installation/)
- **Git**: For version control

### Local Development Server

```bash
hugo server -D
```

The site will be available at `http://localhost:1313`

### Build for Production

```bash
hugo
```

Static output is generated in the `public/` directory, ready for deployment to GitHub Pages or any static host.

---

## 📁 Project Structure

```text
.
├── archetypes/              # Content templates
├── content/                 # Page content (Markdown)
│   ├── _index.md           # Homepage (frontmatter-based sections)
│   ├── about/              # About page
│   ├── estyle/             # EStyle service page
│   ├── datenschutz/        # Privacy policy
│   └── impressum/          # Legal notice
├── layouts/                # HTML templates
│   ├── index.html          # Homepage layout
│   ├── _default/
│   │   ├── baseof.html     # Base template wrapper
│   │   ├── single.html     # Single page layout
│   │   └── _markup/        # Content rendering overrides
│   └── partials/           # Reusable template components
│       ├── head.html       # <head> section (meta, CSS, favicon)
│       └── social-links.html # Social media links
├── static/                 # Static assets (CSS, images)
│   ├── css/main.css        # Global styles (semantic, responsive)
│   └── images/             # Brand images, photos
├── config.toml            # Hugo site configuration
├── package.json           # Node.js dependencies (linting)
└── bin/lint.sh           # Linting script wrapper
```

### Key Content Files

- `content/_index.md`: Homepage sections (hero, problems, coach, facts, services, contact)
- `content/about/index.md`: About & coaching philosophy
- `content/estyle/index.md`: EStyle digital offering
- `layouts/index.html`: Homepage template (sections, cards, CTA)
- `layouts/_default/single.html`: Default page template with sidebar
- `static/css/main.css`: Responsive design, color scheme, components

---

## 💻 Development

### Editing Content

Content is written in **Markdown** with YAML frontmatter for metadata:

```markdown
---
title: "Page Title"
eyebrow: "Subtitle"
image: "images/photo.jpg"
---

# Content starts here
```

### Editing Templates

Hugo templates use Go template syntax. Key files:

- `layouts/index.html` — Homepage layout
- `layouts/_default/single.html` — Inner page layout
- `layouts/partials/head.html` — Meta tags, CSS, favicon
- `layouts/partials/social-links.html` — Social media links

### Development Tips

- Use `hugo server -D` for live reload during editing
- Static files (CSS, images) are in `static/`
- Templates use `relURL` and `absURL` for asset paths
- Custom link handling: `layouts/_default/_markup/render-link.html`

---

## 🔨 Building & Deployment

### Local Build

```bash
hugo
# Output: public/
```

### GitHub Pages (Automated)

Deployments are triggered via GitHub Actions (if configured). Check `.github/workflows/` for current CI/CD setup.

### Manual Deployment

Copy the contents of `public/` to your hosting provider (GitHub Pages, Vercel, Netlify, etc.).

---

## ✅ Quality Assurance

### Linting

The project enforces code quality through automated linting.

#### Tools

- **stylelint**: CSS validation & formatting
- **markdownlint**: Markdown consistency

#### Commands

```bash
# Run all linters
bin/lint.sh

# Run individual linters
yarn lint:css
yarn lint:md
```

#### Setup

1. Install Node.js: [nodejs.org](https://nodejs.org)
2. Install dependencies:

   ```bash
   yarn install
   ```

3. Run linting:

   ```bash
   bin/lint.sh
   ```

#### Configuration

- `.stylelintrc.json` — CSS rules
- `.markdownlint-cli2.jsonc` — Markdown rules
- `.env` — Environment variables (bin/ in PATH)

---

## 🤝 Contributing

### Workflow

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes (content, templates, styles)
3. Test locally: `hugo server -D`
4. Run linting: `bin/lint.sh`
5. Commit: `git commit -m "feat: descriptive message"`
6. Push: `git push origin feature/my-feature`
7. Open a Pull Request

### Code Style

- **CSS**: Follow `stylelint` rules (semantic, responsive)
- **Markdown**: Follow `markdownlint` rules (consistent formatting)
- **Templates**: Use Hugo best practices (partials, data, loops)

### Pull Request Checklist

- [ ] Changes tested locally
- [ ] Linting passes (`bin/lint.sh`)
- [ ] Build succeeds (`hugo`)
- [ ] Commit messages are clear
- [ ] No hardcoded URLs or secrets

---

## 📄 License

This project is proprietary commercial software. All rights reserved.

Usage, copying, modification, and redistribution are not permitted without prior written permission from the copyright holder. See [LICENSE](LICENSE) for details.

---

## 📽 Contact & Links

**Website:** [eskyna.com](https://eskyna.com)  
**Email:** [natalia@eskyna.com](mailto:natalia@eskyna.com)  
**LinkedIn:** [Natalia Kleemann](https://de.linkedin.com/in/natalia-kleemann-94686b2b3)  
**Instagram:** [@natalia.kleemann](https://www.instagram.com/natalia.kleemann/)

---

## 🛠 Tech Stack

- **Static Site Generator:** Hugo
- **Linting:** stylelint, markdownlint-cli2
- **Package Manager:** Yarn
- **Deployment:** GitHub Pages (recommended)
- **CSS:** Semantic, mobile-first, custom properties
- **Accessibility:** WCAG 2.1 baseline (SVG alt text, semantic HTML)
