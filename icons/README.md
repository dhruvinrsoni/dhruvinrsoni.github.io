# App icons

Four ready-made icon themes for the installed app. **Open `preview.png`** to see all four.

| Theme | Look |
|-------|------|
| `rocket-space` | dark navy + stars + white rocket — **active default** |
| `rocket-vivid` | blue→violet gradient + white rocket |
| `seedling-fresh` | teal→green gradient + white seedling |
| `seedling-light` | near-white minimal + green seedling |

Each folder has `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-180.png`.

## How to switch the active theme (text-only, mobile-friendly)

Replace the theme name `rocket-space` in **two files**, then commit:

1. **`manifest.webmanifest`** — the three `"src": "/icons/<theme>/…"` lines.
2. **`index.html`** — the `<link rel="apple-touch-icon" … href="/icons/<theme>/apple-touch-180.png">` line.

That's it — GitHub Pages serves the new icon to **new installs / re-installs**. An
already-installed app keeps its old icon until you remove and re-add it (a
platform limitation, not a bug).

> Want a brand-new design? Re-run the generator that created these (it lives in
> the chat history / can be regenerated) or drop your own PNGs into a new
> `icons/<your-theme>/` folder following the same four filenames.
