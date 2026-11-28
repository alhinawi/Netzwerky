// Glossary validator: fails (exit 1) when any WORD GLOSS violates the
// reviewer rules (K4 round 4). Runs at the end of scripts/build-glossary.mjs,
// so a bad gloss can never ship. Scope: single-word keys are the word glosses
// the reader's word taps resolve to; multiword keys are phrase entries gated
// by the reader's own box rules and are not checked here.
//   1. no broken Arabic word (a space before a harakah diacritic, or a value
//      that is only diacritics/tatweel)
//   2. no repeated adjacent word
//   3. no German label echo ("wollen: يريد")
//   4. no stray digits and no question text
//   5. no gloss over 40 characters
import fs from 'node:fs'

const gloss = JSON.parse(fs.readFileSync('public/glossary.json', 'utf8'))
const DIAC = '\\u064B-\\u0652\\u0670'
const rules = [
  ['space-inside-arabic-word', (v) => new RegExp(`\\s[${DIAC}]`).test(v) || new RegExp(`^[${DIAC}\\u0640\\s]+$`).test(v)],
  ['repeated-adjacent-word', (v) => {
    const ws = v.trim().split(/\s+/)
    return ws.some((w, i) => i > 0 && w === ws[i - 1])
  }],
  ['german-label-echo', (v) => /^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]*\s*[:：]/.test(v)],
  // a digit is stray only when it is neither the whole gloss nor in the key
  // ("stelle -> الوظيفة ؛ الموضع ٠" is garbage; "zweiundzwanzig -> ٢٢" and
  // "k4 -> فصل ٤" are not)
  ['stray-digit', (v, k) => {
    const ds = v.match(/[0-9٠-٩]/g)
    if (!ds) return false
    if (/^[0-9٠-٩\s.,:/-]+$/.test(v)) return false
    return ds.some((d) => !k.includes(d) && !k.includes(String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))))
  }],
  // a question mark belongs in the gloss only when the key itself is a
  // question ("wann? -> امتى؟" fine; "ihre -> ... ماذا تعنى هذه" is garbage)
  ['question-text', (v, k) => /[؟?]/.test(v) && !k.includes('?')],
  // known OCR/extraction stray fragments (extend when new ones appear)
  ['stray-fragment', (v) => /(^|\s)هته(\s|$)/.test(v)],
  ['over-40-chars', (v) => v.length > 40],
]
const violations = []
for (const [k, v] of Object.entries(gloss)) {
  if (k.includes(' ')) continue
  for (const [name, bad] of rules) if (bad(v, k)) violations.push({ key: k, value: v, rule: name })
}

// 8. spellcheck-style pass (K5 reviewer round 2). A full edit-distance
//    spellcheck is not feasible on Egyptian Arabic: 376 one-off glossary
//    words sit one edit from an established word and nearly all are normal
//    morphology (ب/ي prefixes, ة/ين endings, broken plurals), so a distance
//    rule would fail every build on legit words. What IS precise: Arabic
//    orthographic constraints. Hamza-on-ya (ئ) is never followed directly
//    by ن mid-word in correct spelling: "مئنوية" (the p54 typo, for
//    "مئوية") is the exact class. Word-FINAL ئن is fine (كائن، زبائن),
//    as are ئل/ئم/ئا (عائلة، غائم، السجائر).
for (const [k, v] of Object.entries(gloss)) {
  if (k.includes(' ')) continue
  if (/ئن[\u0621-\u064A]/.test(v)) violations.push({ key: k, value: v, rule: 'hamza-orthography' })
}

// 9. page-file gate (K5 reviewer round 3): footer page-number boxes and
//    standalone audio-track boxes must never be tap targets. The printed
//    marks stay on the scan; the overlay box is removed at source and this
//    gate keeps them from coming back.
const numWords = (() => {
  const ones = ['','eins','zwei','drei','vier','fünf','sechs','sieben','acht','neun','zehn','elf','zwölf','dreizehn','vierzehn','fünfzehn','sechzehn','siebzehn','achtzehn','neunzehn','zwanzig']
  // compound unit before 'und' drops the s: einundzwanzig, not einsundzwanzig
  const u = o => (o === 1 ? 'ein' : ones[o])
  const tens = ['','','zwanzig','dreißig','vierzig','fünfzig','sechzig','siebzig','achtzig','neunzig']
  const w = new Set(ones.slice(1))
  w.add('hundert'); w.add('tausend')
  for (const t of tens.slice(2)) { w.add(t); for (let o = 1; o < 10; o++) w.add(u(o) + 'und' + t) }
  for (let h = 1; h < 10; h++) {
    const hu = (h === 1 ? 'ein' : ones[h]) + 'hundert'; w.add(hu)
    for (let o = 1; o < 20; o++) w.add(hu + ones[o])
    for (const t of tens.slice(2)) { w.add(hu + t); for (let o = 1; o < 10; o++) w.add(hu + u(o) + 'und' + t) }
  }
  return w
})()
// footer combos like '100 einhundert' or 'einhundertfünf 105'
const isFooterNum = t => {
  const tl = t.trim().toLowerCase()
  if (numWords.has(tl) || /^\d+$/.test(tl)) return true
  const p = tl.split(' ')
  return p.length === 2 && ((/^\d+$/.test(p[0]) && numWords.has(p[1])) || (/^\d+$/.test(p[1]) && numWords.has(p[0])))
}
const boxRe = /\{ id: '[^']+', x: (\d+), y: (\d+), w: (\d+), h: (\d+), text: ('[^']*'|"[^"]*"), ar: ('[^']*'|"[^"]*")/
for (const book of fs.readdirSync('content/scan')) {
  const dir = `content/scan/${book}`
  if (!fs.statSync(dir).isDirectory()) continue
  for (const f of fs.readdirSync(dir)) {
    if (!/^p\d+\.ts$/.test(f)) continue
    const lines = fs.readFileSync(`${dir}/${f}`, 'utf8').split('\n')
    lines.forEach((line, i) => {
      const m = line.match(boxRe)
      if (!m) return
      const y = +m[2], txt = m[5].slice(1, -1).trim(), ar = m[6].slice(1, -1).trim()
      const t = txt.toLowerCase()
      if (y >= 1550 && isFooterNum(txt))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: txt, rule: 'footer-page-number-box' })
      if (/^\d{1,2}[.,]\d{1,2}([\u2013\u2014-]\d{1,2})?$/.test(txt))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: txt, rule: 'standalone-track-box' })
      // no empty popups (reviewer): a digit/dot/dash-only or letter-marker box
      // never echoes its own text as the gloss — it carries the Arabic-Indic
      // digit / Arabic letter form or the box is removed
      if (txt === ar && (/^[\d\s.,\u2013\u2014\-/:]+$/.test(txt) || /^\d{0,2}\s*\)?\s*[A-Za-z]\s*\)?$/.test(txt) || /^\d{1,2}\)\s*[A-Za-z]$/.test(txt)))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: txt, rule: 'echo-gloss-box' })
    })
  }
}
// 10. sentence-level gate: no standalone track-number sentences, no
//     footer page-number sentences, and no sentence whose word boxes are
//     all missing (orphan left after a box removal).
const sentRe = /^\s*\{ id: '([^']+)', text: ('[^']*'|"[^"]*"), ar: ('[^']*'|"[^"]*")(?:, words: \[([^\]]*)\])?\s*\},?\s*$/
for (const book of fs.readdirSync('content/scan')) {
  const dir = `content/scan/${book}`
  if (!fs.statSync(dir).isDirectory()) continue
  for (const f of fs.readdirSync(dir)) {
    if (!/^p\d+\.ts$/.test(f)) continue
    const lines = fs.readFileSync(`${dir}/${f}`, 'utf8').split('\n')
    const defined = new Set()
    for (const line of lines) {
      const d = line.match(/^\s*\{ id: '([^']+)', x: \d+, y: \d+, w: \d+, h: \d+, text:/)
      if (d) defined.add(d[1])
    }
    lines.forEach((line, i) => {
      const m = line.match(sentRe)
      if (!m) return
      const txt = m[2].slice(1, -1).trim(), ar = m[3].slice(1, -1).trim()
      const refs = (m[4] || '').split(',').map((r) => r.trim().replace(/^'|'$/g, '')).filter(Boolean)
      if (/^\d{1,2}[.,]\d{1,2}([\u2013\u2014-]\d{1,2})?$/.test(txt))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: txt, rule: 'track-sentence' })
      if (isFooterNum(txt))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: txt, rule: 'footer-number-sentence' })
      if (refs.length && refs.every((r) => !defined.has(r)))
        violations.push({ key: `${book}/${f}:${i + 1}`, value: `${txt} -> [${refs}]`, rule: 'orphan-sentence-words' })
    })
  }
}
if (violations.length) {
  console.error(`glossary violations: ${violations.length}`)
  for (const x of violations) console.error(`  [${x.rule}] ${JSON.stringify(x.key)} => ${JSON.stringify(x.value)}`)
  process.exit(1)
}
console.log(`glossary OK: ${Object.keys(gloss).length} entries, 0 violations`)
