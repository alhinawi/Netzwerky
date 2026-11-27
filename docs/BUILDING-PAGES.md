# Building pages for Netzwerky

Netzwerky is a reader for the **real scanned pages** of the Netzwerk neu books, in
the same shape as menscheny.pages.dev: the scan fills the screen, every printed
line and word has an invisible tap box with its Egyptian Arabic meaning, pages
carry the book's own audio, and the sentence tab shows whole-sentence
translations.

Live: https://netzwerky.pages.dev — repo: https://github.com/alhinawi/Netzwerky

## Ground rules

- **The page is the scan.** Never rebuild a page as HTML text, never crop or
  retouch photos. Overlay boxes only.
- **One page, one file.** `content/scan/<book>/p<printed>.ts`. Nothing else in the
  repo needs to change to add a page — the registry
  (`content/scan/index.ts`) is generated and gitignored.
- **No shared-file edits.** Don't touch `lib/`, `components/`, `content/scan/types.ts`
  or other pages. If a page genuinely needs a new field or component, say so in
  your report instead of editing shared code.
- **Photos are untouchable.** No patch, no seam repair, no filter may cover or
  shift photo pixels. The scanner seam on the A1 pages is a known, parked item.
- **Commits:** author `Mohamed Alhinawi <68702059+alhinawi@users.noreply.github.com>`.
  One branch + one PR per batch (2-5 pages), squash-merged into `main`, branch
  deleted. Never push to `main` directly, never rewrite history.
- UI labels are English, page content is German, meanings are **Egyptian Arabic**
  (عامية مصرية), not MSA.

## What one page needs

| Piece | Where | Notes |
| --- | --- | --- |
| Page data | `content/scan/a1-kb/p<printed>.ts` | exports `export const p<printed>: ScanPage` |
| Scan image | `public/pages/a1-kb/<printed 3 digits>.jpg` | 1241x1753 px |
| Book audio | `public/audio/a1/kb/NWn_A1_KB_Audio_1-0XX.mp3` | already in the repo |
| German pronunciation | `public/audio/de/<slug>.mp3` | generated, see below |

### Page numbering

The printed page number is **not** the PDF page:

| Book | printed page = |
| --- | --- |
| A1 Kursbuch | PDF page − 1 |
| A2 Kursbuch | PDF page − 2 |
| B1 Übungsbuch | PDF page |

Render the scan:

```bash
pdftoppm -f 23 -l 23 -r 150 -jpeg -jpegopt quality=82 "/downloads/NWn A1 KB.pdf" /tmp/pg22
python3 -c "from PIL import Image; Image.open('/tmp/pg22-023.jpg').save('public/pages/a1-kb/022.jpg', quality=82)"
```

## Page data format

Full types in `content/scan/types.ts`. Coordinates are in the **1241x1753 scan
space**, top-left origin, and cover the printed ink (not the whitespace).

```ts
import type { ScanPage } from '../types'

export const p22: ScanPage = {
  book: 'a1-kb',
  printed: 22,
  chapter: 2,
  image: '/pages/a1-kb/022.jpg',
  width: 1241,
  height: 1753,
  words: [
    { id: 't', x: 203, y: 180, w: 385, h: 42, text: 'Mein Beruf', ar: 'شغلي' },
  ],
  audio: [
    { id: 'a20', x: 82, y: 1390, w: 34, h: 34, src: ['NWn_A1_KB_Audio_1-020.mp3'], label: 'Aufgabe 7b (1.20)' },
  ],
  fields: [],
  matchings: [],
  groups: [],
  sentences: [
    { id: 's1', text: 'Mein Beruf', ar: 'شغلي', words: ['t'] },
  ],
  patches: [
    { x: 205, y: 360, w: 86, h: 28 },
  ],
}
```

- `words` — one entry per printed line, phrase, label or heading. `text` is the
  exact German on the page, `ar` the Egyptian Arabic meaning. `id` is any short
  unique string; sentence entries point at these ids.
- `audio` — a speaker button over the book's own speaker icon. `src` lists the
  mp3 file(s); `label` shows in the audio card.
- `sentences` — the جملة tab in the word popup: whole sentences with their Arabic,
  `words` listing the ids that make up the sentence.
- `fields` / `matchings` — only for pages whose exercise is a fill-in or a
  matching task that we render as interactive. Most pages leave them empty.
- `patches` — white rectangles that cover **handwriting only** (see below).

### Measuring boxes

Grid overlay helper (draws 50 px lines and 200 px labels on the scan):

```bash
python3 /tmp/grid.py 022     # -> /tmp/shots/grid-022-top.png, grid-022-bot.png
```

Open both halves, read the box edges off the grid, and write them down. Check the
result in a screenshot with the debug outline on (`#boxes` in the URL), not just
by eye on the numbers.

## Audio

The book prints a track label next to a speaker icon (e.g. `1.17`). The file is
`NWn_A1_KB_Audio_1-017.mp3` — **the printed label is the file number**. Verify the
track by its content (it must be the exercise it sits next to) before mapping it.
A page usually has 1-3 tracks; not every exercise has one.

## Handwriting patches

Students wrote answers into some scans. Cover handwriting with small white
patches **only** where nothing printed sits underneath, and only in the blank
margin or in the blank line the student wrote on:

- Never let a patch overlap printed text, a photo, or a rule line.
- Keep the patch as small as the handwriting plus ~4 px.
- The book's own printed handwriting-style answers stay — do not cover those.
- Re-check the patched area at 100 % zoom in a screenshot before you ship.

## German pronunciation mp3s

`public/audio/de/` holds one mp3 per unique text, named by slug. The reader builds
the same slug at runtime, so you only have to generate files for new text:

```bash
python3 scripts/gen_audio.py     # idempotent: skips texts that already have a file
```

## Verification checklist (before the PR)

1. `node scripts/build-registry.mjs && npm run build` — no errors.
2. Serve the export and shoot both viewports:
   ```bash
   python3 -m http.server 8099 -d out &
   node shotM.mjs 22        # 390x844 phone -> /tmp/shots/m-p22.png
   node shotN.mjs 22        # 900x1200 desktop with boxes -> /tmp/shots/v-p22.png
   pkill -f "http.server 8099"
   ```
3. Phone shot: page edge-to-edge, header band and footer not clipped, toolbar and
   audio card usable, no patch over printed text.
4. Desktop shot with `#boxes`: every tap box sits on its own printed line, none
   overlaps a neighbour, nothing printed is left without a box.
5. Tap a word on the live build (`node shotMLive.mjs 22 tap`): popup opens with the
   Arabic meaning, the جملة tab lists the sentences, the speaker plays.
6. Audio button plays the right track.
7. After merge, wait for the Pages deploy (~2 min), then re-shoot the **live** URL
   with a cache-buster (`shotMLive.mjs`) and confirm the page renders.

## PR

```bash
git checkout -b feat/p22-24
git add -A
git -c user.name="Mohamed Alhinawi" -c user.email="68702059+alhinawi@users.noreply.github.com" commit -m "A1 Kursbuch Seiten 22-24"
git push -u origin feat/p22-24
gh pr create --base main --head feat/p22-24 --title "A1 Kursbuch Seiten 22-24" --body "..."
gh pr merge --squash --delete-branch
```

Report every finished batch with the **exact live deep links** for the first and
last page of the batch, e.g. `https://netzwerky.pages.dev/read/a1-kb/22/`.

If two workers touch neighbouring ranges at the same time, the only file that can
ever collide is a page file itself (different pages never do) — the generated
registry is not committed, so merges stay clean.
