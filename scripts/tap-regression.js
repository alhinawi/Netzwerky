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
  '/read/a1-kb/120/': [
    ['Es', 0.5, 'هو (محايد)'],
    // "ist" is the verb, natural Egyptian order (K4 reviewer)
    ['ist', 0.5, 'بيكون / هو'],
  ],
  // "zur" gloss is a real preposition gloss, not a fragment (reviewer OK-fixes)
  '/read/a2-kb/19/': [['zur', 0.5, 'إلى / لـ']],
  // preposition "an" without meta text (K4 reviewer)
  '/read/a1-kb/104/': [['an', 0.5, 'على / عند']],
  // modal verbs without the echoed German label (K4 reviewer)
  '/read/a2-kb/156/': [
    ['können', 0.5, 'يقدر'],
    ['werden', 0.5, 'يبقى / يصير'],
  ],
  // a bare hyphen box opens nothing in any mode (reviewer OK-fixes)
  '/read/b1-kb/23/': [['–', 0.5, null, 'none']],
  // "natürlich" clean gloss (reviewer OK-fixes)
  '/read/b1-kb/32/': [['Abend essen wir in einem guten Restaurant - natürlich mit einem leckeren Nachtisch.', 0.58, 'طبعا / طبيعي']],
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
  '/read/a1-kb/111/': [['Ihnen gefällt etwas sehr gut.', 0.21, 'حاجة / شيء ما']],
  // stray scan pipes never leak into a gloss (PR 161 reviewer)
  '/read/b1-kb/21/': [['die Powerbank', 0.5, 'الباور بانك']],
  // a conjugation-table form shows the verb gloss, never the whole row (PR 161 reviewer)
  '/read/b1-kb/27/': [['er/es/sie lässt | sie/Sie lassen', 0.4, 'يترك / يخلّي']],
  // word taps give word-level glosses; an unglossed word opens the labeled sentence,
  // and a tap on a list separator opens nothing (PR 163 reviewer)
  '/read/b1-kb/43/': [
    // the sentence fallback first, then a word tap on the same box: the word
    // lookup must still run (PR 165: the fallback must not flip the global mode)
    ['Die Gedenkstätte Berliner Mauer erinnert', 0.43, 'نصب سور برلين التذكاري بيفكّر بتقسيم ألمانيا ومكانه في وسط', 'sentence'],
    ['Die Gedenkstätte Berliner Mauer erinnert', 0.12, 'النصب التذكاري'],
    // "einem" labeled as Dativ, "Glaskuppel" with the full adjective (reviewer OK-fixes)
    ['Der Checkpoint Charlie war ein Grenzübergang zwischen Ost- und West-Berlin. Mit einem', 0.97, 'أداة نكرة (Dativ)'],
    ['im Bundestag zusehen und in die moderne Glaskuppel gehen. Es lohnt sich: Die Aussicht von der', 0.51, 'القبة الزجاجية'],
  ],
  '/read/b1-kb/28/': [
    ['Berichte über Veränderungen im Leben verstehen |', 0.2, 'التغييرات'],
    ['Berichte über Veränderungen im Leben verstehen |', 0.485, null, 'none'],
  ],
}

// K4 reviewer fixes: word-level glosses, no sentence leaks, numbers as written
SPECS['/read/b1-kb/44/'] = [
  ['Gespräche bei der Arbeit verstehen | Irreales ausdrücken | sich entschuldigen | auf Entschuldigungen reagieren |', 0.05, 'محادثات'],
  ['Begründen Sie Ihre Vermutung.', 0.1, 'يبرّر'],
  ['Frau Mersa, sind Sie zufrieden in Ihrem Beruf?', 0.05, 'السيدة'],
]
SPECS['/read/b1-kb/47/'] = [
  // a track number opens nothing (numbers as written or not at all)
  ['1.33', 0.5, null, 'none'],
  // "(Es)" is no word tap target: the labeled sentence opens instead
  ['(Es) Tut mir (sehr/schrecklich) leid.', 0.05, '(أنا) آسف (جامد/جدا).', 'sentence'],
]
SPECS['/read/b1-kb/50/'] = [
  ['0551–893 022 99', 0.1, null, 'none'],
  ['Freie Zeiteinteilung zwischen', 0.1, 'حرة / فاضية'],
  ['Ja, die Stelle ist noch nicht besetzt.', 0.03, 'أيوه، الوظيفة لسه فاضية.', 'sentence'],
]
SPECS['/read/b1-kb/51/'] = [
  ['Tipps für ein erfolgreiches Vorstellungsgespräch', 0.04, 'نصايح'],
  ['beste Verbindung heraus und denken Sie auch an', 0.05, 'الأفضل'],
  ['üben. Wenn Sie im Gespräch vor lauter Aufregung', 0.34, 'أصحابها. ولو من التوتر في المقابلة', 'sentence'],
]
SPECS['/read/b1-kb/52/'] = [
  ['Laptop und schnelles Internet brauchen', 0.05, 'اللاب توب / الكمبيوتر المحمول'],
]
SPECS['/read/b1-kb/53/'] = [
  ['Rufen Sie den Personalchef', 0.08, 'كلم مدير الموظفين', 'sentence'],
  ['(Es) Tut mir (sehr/schrecklich) leid.', 0.05, 'متآسف (جدا/أوي).', 'sentence'],
  ['nach Informationen fragen', 0.05, 'بعد / عن'],
]

const cases = SPECS[location.pathname]
if (!cases) return 'no spec for ' + location.pathname
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const results = []
for (const [label, frac, expect, mode] of cases) {
  const btns = [...document.querySelectorAll('button')]
  const btn = btns.find((b) => (b.getAttribute('aria-label') || '') === label + ' — Bedeutung') || btns.find((b) => (b.getAttribute('aria-label') || '').startsWith(label))
  if (!btn) { results.push({ label, pass: false, err: 'button not found' }); continue }
  const r = btn.getBoundingClientRect()
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.left + r.width * frac, clientY: r.top + r.height / 2 }))
  await sleep(1400)
  const pop = document.querySelector('[class*="bg-neutral-900/95"]')
  if (mode === 'none') { results.push({ label, frac, expect: null, pass: !pop }); continue }
  const de = pop ? (pop.querySelector('div.font-semibold') || {}).textContent : null
  const ar = pop ? (pop.querySelector('div.ar') || {}).textContent : null
  const sentTab = pop && [...pop.querySelectorAll('button')].find((b) => b.textContent.trim() === 'جملة')
  const sentActive = Boolean(sentTab && /font-semibold/.test(sentTab.className))
  results.push({ label, frac, de, ar, expect, mode, sentActive, pass: ar === expect && (mode !== 'sentence' || sentActive) })
  const x = pop && [...pop.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'اقفل')
  if (x) { x.dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(250) }
}
return results
