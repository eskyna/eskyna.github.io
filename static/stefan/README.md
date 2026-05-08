# ESKYNA Stefan PWA

Static PWA named **ESKYNA** for `https://eskyna.com/stefan/`.

## What's included

- Eskyna-inspired warm neutral/gold design.
- Browser favicon and installable PWA icons generated from the Eskyna site favicon asset (`icons/sign_gold.png`).
- Natalia portrait loaded from `https://eskyna.com/images/IMG_5208_transparent.png`.
- Local optimized portrait fallback at `/stefan/images/natalia-portrait.webp`.
- Interactive **10 Styling-Tipps** checklist with local progress storage.
- PDF preview for `/10_Styling_Tipps.pdf` inside the PWA.
- Button to cache the PDF on demand for faster/offline access.
- Service worker for offline app shell caching.
- Install prompt support where browsers expose it.
- Web Share API with clipboard fallback.
- Local-storage note list.
- Playful sparkle interaction with a persisted sparkle count.

## Important PDF note

The PWA expects the original PDF to remain available at:

```text
/10_Styling_Tipps.pdf
```

That file is already present at the root of `eskyna.com`, so only the `/stefan/` app folder needs to be uploaded for the intended deployment target.

The PDF is **not pre-cached during install** because it is large. The user can tap "PDF offline speichern" to cache it on demand.

## Deploy

Upload the contents of this folder to the `/stefan/` directory on `eskyna.com`:

```text
/stefan/index.html
/stefan/styles.css
/stefan/app.js
/stefan/manifest.webmanifest
/stefan/sw.js
/stefan/icons/...
/stefan/images/...
```

The manifest is configured with:

```json
"start_url": "/stefan/",
"scope": "/stefan/"
```

## Test

1. Open `https://eskyna.com/stefan/` on HTTPS.
2. Confirm the Natalia portrait appears and the installable app name is ESKYNA.
3. Use "Glitzern lassen", save a note, and check off a few styling tips.
4. Tap "PDF-Vorschau laden" to verify the embedded PDF opens.
5. Tap "PDF offline speichern" while online.
6. Refresh, then switch to airplane mode and refresh again to verify the cached app shell, local progress, notes, and cached PDF behavior.
7. On a supported browser, use the install prompt or the browser's "Add to Home Screen" option.

## Update: styling tips PDF

This build adds a dedicated styling-tips section:

- 10 interactive tip cards
- local progress storage
- random tip roulette
- root PDF preview from `/10_Styling_Tipps.pdf`
- on-demand PDF caching

The service worker cache is now `eskyna-stefan-pwa-v5`, with a separate PDF cache `eskyna-stefan-pdf-v1`.
