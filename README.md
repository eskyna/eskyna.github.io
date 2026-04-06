# eskyna.com Homepage (Hugo)

Diese Seite ist als Hugo-Projekt aufgebaut.

## Lokal entwickeln

1. Hugo installieren: [https://gohugo.io/installation/](https://gohugo.io/installation/)
2. Dev-Server starten:

```bash
hugo server -D
```

Die Seite ist dann unter `http://localhost:1313` erreichbar.

## Struktur

- `content/_index.md`: Inhalte der Startseite (Texte, Services, Kontakt)
- `content/about/index.md`: Inhalte der About-Seite
- `content/estyle/index.md`: Inhalte der EStyle-Seite
- `layouts/index.html`: Homepage-Layout
- `layouts/_default/baseof.html`: Basis-Template
- `layouts/_default/single.html`: Layout fuer Inhaltsseiten wie `/about` und `/estyle`
- `layouts/partials/head.html`: Meta, CSS, Favicon
- `static/css/main.css`: Styles
- `static/images/`: verwendete Bilder

## Build

```bash
hugo
```

Der statische Output liegt in `public/`.