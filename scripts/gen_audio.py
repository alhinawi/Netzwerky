#!/usr/bin/env python3
"""Generate German pronunciation mp3s for every word/sentence text in content/scan.

Filename = slug(text) + '.mp3' under public/audio/de/. The reader computes the same
slug in TypeScript (see lib/pronounce.ts), so the files are found at runtime.
Idempotent: existing files are skipped, so it can be re-run as content grows.
"""
import glob, os, re, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'audio', 'de')

def slug(text: str) -> str:
    s = text.lower()
    for a, b in (('ä', 'ae'), ('ö', 'oe'), ('ü', 'ue'), ('ß', 'ss')):
        s = s.replace(a, b)
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:60].strip('-') or 'x'

def texts():
    seen = {}
    for f in glob.glob(os.path.join(ROOT, 'content', 'scan', '**', '*.ts'), recursive=True):
        src = open(f, encoding='utf-8').read()
        for m in re.finditer(r"text: '((?:[^'\\]|\\.)*)'", src):
            t = m.group(1).replace("\\'", "'")
            if t.strip():
                seen.setdefault(slug(t), t)
    return seen

def main(limit=None):
    from gtts import gTTS
    os.makedirs(OUT, exist_ok=True)
    items = texts()
    todo = [(s, t) for s, t in sorted(items.items()) if not os.path.exists(os.path.join(OUT, s + '.mp3'))]
    print(f'{len(items)} texts, {len(todo)} to generate')
    done = 0
    for s, t in todo:
        if limit is not None and done >= limit:
            break
        try:
            gTTS(t, lang='de').save(os.path.join(OUT, s + '.mp3'))
            done += 1
        except Exception as e:
            print('fail', s, e)
            time.sleep(2)
        time.sleep(0.15)
    print('generated', done)

if __name__ == '__main__':
    main(int(sys.argv[1]) if len(sys.argv) > 1 else None)
