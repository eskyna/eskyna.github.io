# ESKYNA Stefan PWA

Static PWA named **ESKYNA** for `https://eskyna.com/stefan/`.

## What's included

- Eskyna-inspired warm neutral/gold design.
- Favicon/app icons generated from the transparent Natalia image at `https://eskyna.com/images/IMG_5208_transparent.png`.
- Natalia portrait loaded from `https://eskyna.com/images/IMG_5208_transparent.png`.
- Local optimized portrait fallback at `/stefan/images/natalia-portrait.webp`.
- Service worker for offline app shell caching.
- Install prompt support where browsers expose it.
- Web Share API with clipboard fallback.
- Local-storage note list.
- Playful sparkle interaction with a persisted sparkle count.

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
3. Use "Make it sparkle" and save a note.
4. Refresh, then switch to airplane mode and refresh again to verify the cached app shell and fallback portrait.
5. On a supported browser, use the install prompt or the browser's "Add to Home Screen" option.
