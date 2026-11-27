#!/usr/bin/env python3
"""Remove the scanner seam: a thin full-width light/dark line left by the sheet feed.

For every page image, find rows that differ from the rows above/below across almost the
whole width (the seam), then rebuild those rows by linear interpolation between the
nearest clean rows. Printed rules and text never qualify: they are either dark over a
large magnitude or do not span the width.

usage: python3 scripts/despeckle.py [--apply] [pages...]
"""
import glob, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = os.path.join(ROOT, 'public', 'pages')

def find_seams(a, gap=3, frac_min=0.85, lo=3.5, hi=80, top=250):
    g = a.astype(np.float32).mean(axis=2)
    H = g.shape[0]
    hits = []
    for r in range(max(gap, top), H - gap):
        ref = (g[r - gap] + g[r + gap]) / 2
        dev = g[r] - ref
        frac = float((np.abs(dev) > 5).mean())
        mag = float(np.abs(dev).mean())
        sign = float((np.sign(dev) == np.sign(dev.mean())).mean())
        if frac >= frac_min and lo <= mag <= hi and sign >= 0.8:
            hits.append((r, frac, mag))
    return hits

def bands(rows):
    out, cur = [], []
    for r in rows:
        if cur and r - cur[-1] > 8:
            out.append((cur[0], cur[-1]))
            cur = []
        cur.append(r)
    if cur:
        out.append((cur[0], cur[-1]))
    return out


def apply_seams(a, rows, gap=2, pad=0):
    """Rebuild each seam band by a vertical blend of the clean rows just outside it."""
    out = a.astype(np.float32).copy()
    for a0, b0 in bands(rows):
        a0, b0 = a0 - pad, b0 + pad
        top_i = max(0, a0 - gap)
        bot_i = min(a.shape[0] - 1, b0 + gap)
        top = a[top_i].astype(np.float32)
        bot = a[bot_i].astype(np.float32)
        span = bot_i - top_i
        for i in range(a0, b0 + 1):
            t = (i - top_i) / span if span else 0.5
            out[i] = top * (1 - t) + bot * t
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    apply = '--apply' in sys.argv
    files = sorted(glob.glob(os.path.join(PAGES, '*', '*.jpg')))
    total = 0
    for f in files:
        a = np.asarray(Image.open(f).convert('RGB'))
        hits = find_seams(a)
        if not hits:
            continue
        rows = [h[0] for h in hits]
        total += len(rows)
        print(os.path.relpath(f, ROOT), [(r, round(m, 1)) for r, _, m in hits])
        if apply:
            out = apply_seams(a, rows)
            Image.fromarray(out).save(f, quality=88, optimize=True)
    print('seam rows:', total, 'applied' if apply else 'dry run')

if __name__ == '__main__':
    main()
