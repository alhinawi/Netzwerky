// Live tap regression list for the Netzwerky reader.
//
// Run after EVERY glossary change (scripts/build-glossary.mjs output) and
// every ScanReader popup-semantics change, so new fixes cannot re-break old ones.
//
// How to run (cloud browser):
//   1. acquire a lease, then for every page key in SPECS:
//      navigate to https://netzwerky.pages.dev<PAGE>?cb=<PR-number>  (fresh cache)
//   2. execute-js this whole file in that tab
//   3. every case must come back pass:true — a fail means a regression
const SPECS = {
  // "Es" must be the neuter pronoun, never a tatweel placeholder (PR 157 regression)
  '/read/a1-kb/120/': [['Es', 0.5, 'هو (محايد)']],
  // article before a noun is never the separable verb (PR 157)
  '/read/b1-kb/17/': [
    ['ein Gespräch über die Reiseplanung führen', 0.03, 'أداة نكرة'],
    // preposition "mit", not the mitbringen verb fragment (PR 157)
    ['Waren Sie schon mal in ...? / Wie wäre es mit ...? /', 0.84, 'مع / بـ'],
  ],
  // a list marker maps to the number itself, never to a word gloss (PR 152)
  '/read/a1-kb/54/': [['6. Er besucht seine Oma.', 0.03, '٦']],
  // preposition "zu", not the zuhören verb fragment (PR 157)
  '/read/b1-kb/16/': [['Sehen Sie die Szene noch einmal', 0.99, 'لـ / إلى']],
  // article + noun: the noun wins (der Hafen -> الميناء)
  '/read/a1-kb/28/': [['der Hafen', 0.5, 'الميناء']],
  // official Klett glossary entry stays reachable
  '/read/a1-kb/111/': [['Ihnen gefällt etwas sehr gut.', 0.21, 'شيئا ما ؛ بعض الشئ هل ترغب فى شئ']],
}

const cases = SPECS[location.pathname]
if (!cases) return 'no spec for ' + location.pathname
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
for (const [label, frac, expect] of cases) {
  const btn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || '').startsWith(label))
  if (!btn) { results.push({ label, pass: false, err: 'button not found' }); continue }
  const r = btn.getBoundingClientRect()
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.left + r.width * frac, clientY: r.top + r.height / 2 }))
  await sleep(1400)
  const pop = document.querySelector('[class*="bg-neutral-900/95"]')
  const de = pop ? (pop.querySelector('div.font-semibold') || {}).textContent : null
  const ar = pop ? (pop.querySelector('div.ar') || {}).textContent : null
  results.push({ label, frac, de, ar, expect, pass: ar === expect })
  const x = pop && [...pop.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'اقفل')
  if (x) { x.dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(250) }
}
return results
