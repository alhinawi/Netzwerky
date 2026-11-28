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
if (violations.length) {
  console.error(`glossary violations: ${violations.length}`)
  for (const x of violations) console.error(`  [${x.rule}] ${JSON.stringify(x.key)} => ${JSON.stringify(x.value)}`)
  process.exit(1)
}
console.log(`glossary OK: ${Object.keys(gloss).length} entries, 0 violations`)
