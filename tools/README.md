# tools/

Node.js helper scripts for the Launchpad. Run them from the `dhruvinrsoni.github.io/` repo root.

---

## `add-card.mjs` — manage Launchpad cards (zero deps)

The deterministic, non-AI way to add, update, or validate the project cards in
[`scripts/data.js`](../scripts/data.js). Runs on a fresh clone with just `node` — no `npm install`.

### Add a card

```bash
# Flags (non-interactive)
node tools/add-card.mjs --id rangoli-royale --name "Rangoli Royale" --emoji 🪔 \
  --type "Game · PWA" --desc "Pass-the-device strategy on a dot grid."

# Interactive — just run it and answer the prompts
node tools/add-card.mjs
```

When you pass `--id`, the script fills in sensible defaults so you can type less:

| Field | Default |
|---|---|
| `--repo` | `https://github.com/dhruvinrsoni/<id>` |
| `--live` | `https://dhruvinrsoni.github.io/<id>/` |
| `--primary` | `live` (or `repo` if there's no live URL) |

The new card is appended to the `PROJECTS` array in the exact hand-formatted house style;
the rest of the file is left byte-for-byte untouched.

### Update an existing card

```bash
node tools/add-card.mjs --update smart-logger --desc "New one-line description."
```

Only the fields you pass change; everything else on that card is preserved. Only the one
card's `{ … }` block is rewritten.

### Validate every card

```bash
node tools/add-card.mjs --validate
```

Exits non-zero if any card has an error. Checks: required fields, kebab-case unique `id`,
at least one URL, `primary` points to a present URL, well-formed `https` URLs. Long
descriptions and odd emoji are reported as warnings (non-fatal).

### Preview without writing

Add `--dry-run` to any add/update to print the rendered block and write nothing.

### All fields

`--id --name --emoji --type --desc --sub --liveLabel --primary --repo --live --webstore --producthunt --featured`

(`--featured` is a flag — its presence sets `featured: true`.)

No build step: edit, run, then push `main` — GitHub Pages deploys automatically.

---

## `generate-assets.js` — PNG asset generator

Generates `og-image.png` and `apple-touch-icon.png` for the GitHub Pages sites. Requires
`npm install` here (uses `sharp`). See the script header for the site list.
