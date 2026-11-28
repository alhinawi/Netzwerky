import fs from 'node:fs'
import path from 'node:path'

const roots = ['content/scan/a1-kb', 'content/scan/a2-kb', 'content/scan/b1-kb']
const gloss = {}
const seen = new Set()
for (const dir of roots) {
  for (const f of fs.readdirSync(dir)) {
    if (!/^p\d+\.ts$/.test(f)) continue
    const src = fs.readFileSync(path.join(dir, f), 'utf8')
    const re = /text:\s*'((?:[^'\\]|\\.)*)'\s*,\s*ar:\s*'((?:[^'\\]|\\.)*)'/g
    let m
    while ((m = re.exec(src))) {
      const text = m[1].replace(/\\'/g, "'").trim()
      const ar = m[2].replace(/\\'/g, "'").trim()
      if (!text || !ar) continue
      if (ar.trim().toLowerCase() === text.trim().toLowerCase()) continue
      // "a ｜ b ｜ c" boxes carry one meaning per segment: index each pair
      const add = (de, meaning) => {
        // never index placeholders or pure numbers/markers as words
        if (!/[a-zäöüßA-ZÄÖÜ]/.test(de)) return
        // a gloss is Egyptian Arabic: boxes whose ar is German dictionary text
        // (a2-kb appendix separable-verb fragments like "ein" -> "laden, er lädt ein, ...")
        // must not become word glosses; tatweel-only placeholders are no gloss either
        // (U+0640 sits inside the Arabic block, so strip it before testing)
        if (!/[\u0600-\u06FF]/.test(meaning.replace(/\u0640/g, ''))) return
        const words = de.split(/\s+/).filter(Boolean)
        const bare = (w) => w.toLowerCase().replace(/[^a-zäöüß0-9-]/g, '')
        // single-word keys only for clean words: fragment boxes like
        // 'Geschichte“?' or 'gefallen.' carry fragment translations, not word
        // glosses, and must not pollute the glossary (PR 164 reviewer sample)
        const keys = [words.length === 1 && /^[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]*$/.test(de) ? bare(de) : de.toLowerCase()]
        // article + noun: index the noun on its own too ("die Zeitung" -> "zeitung")
        if (words.length === 2 && /^(der|die|das)$/i.test(words[0])) keys.push(bare(words[1]))
        for (const key of keys) {
          if (!key || seen.has(key)) continue
          seen.add(key)
          gloss[key] = meaning
        }
      }
      if (text.includes('｜') && ar.includes('｜')) {
        const de = text.split('｜').map((x) => x.trim()).filter(Boolean)
        const mean = ar.split('｜').map((x) => x.trim()).filter(Boolean)
        if (de.length === mean.length && de.length > 1) {
          de.forEach((d, i) => add(d, mean[i]))
          continue
        }
      }
      if (text.split(/\s+/).length > 4) continue
      add(text, ar)
    }
  }
}
// single-word glosses recovered from the official Klett A1/A2 Arabic glossaries
// (content/scan/glossary-official.json); page data keeps priority
const official = JSON.parse(fs.readFileSync('content/scan/glossary-official.json', 'utf8'))
for (const [k, v] of Object.entries(official)) {
  if (!seen.has(k)) { seen.add(k); gloss[k] = v }
}
// standalone function words and place names: correct single-word glosses.
// Only fill keys no page box or official entry supplied (those win).
const extra = {
  ein: 'أداة نكرة',
  mit: 'مع / بـ',
  zu: 'لـ / إلى',
  ab: 'من / ابتداءً من',
  weg: 'بعيد / مش موجود',
  um: 'حوالين / عند (الساعة)',
  fern: 'بعيد',
  statt: 'بدلًا من',
  teil: 'جزء',
  leid: 'آسف / زعلان',
  weh: 'وجع',
  vorbei: 'عدّى / خلص',
  weiter: 'كمان / لقدّام',
  zurecht: 'في مكانه / تمام',
  bereit: 'جاهز / مستعد',
  herein: 'لجوا',
  herunter: 'لتحت',
  runter: 'لتحت',
  'rügen': 'جزيرة روجن',
  // conjugation-table forms (kurz und klar / appendix tables): the tapped form
  // shows the verb's own gloss, never the whole table row
  lasse: 'يترك / يخلّي',
  'lässt': 'يترك / يخلّي',
  lasst: 'يترك / يخلّي',
  lassen: 'يترك / يخلّي',
  gelassen: 'يترك / يخلّي',
  'weißt': 'يعرف',
  wisst: 'يعرف',
  gewusst: 'يعرف',
  hatte: 'كان عنده',
  hattest: 'كان عندك',
  hatten: 'كان عندهم',
  hattet: 'كان عندكم',
  gehabt: 'كان عنده',
  warst: 'كان (إنت)',
  waren: 'كانوا',
  wart: 'كنتوا',
  gewesen: 'كان (تصريف ثالث)',
  geworden: 'صار / أصبح',
  darf: 'مسموح له / يجوز له',
  soll: 'المفروض',
  'würde': 'حـ (شرطية)',
  // reviewer word-tap list (K1-K3 running text): single-word glosses for words
  // whose taps used to show the whole sentence translation (self-written, listed for review)
  'gedenkstätte': 'النصب التذكاري',
  'reichstagsgebäude': 'مبنى البرلمان (الرايخستاج)',
  'glaskuppel': 'القبة الزجاجية',
  fotos: 'صور',
  stunden: 'ساعات',
  einem: 'أداة نكرة (Dativ)',
  'veränderung': 'تغيير',
  'veränderungen': 'تغييرات',
  unterschiede: 'فروق / اختلافات',
  vergleich: 'مقارنة',
  je: 'كل / لكل',
  arbeitet: 'بيشتغل / بتشتغل',
  'verhältnis': 'نسبة / علاقة',
  besonderer: 'مميز / خاص',
  geschichte: 'تاريخ / حكاية',
  menschen: 'الناس',
}
for (const [k, v] of Object.entries(extra)) {
  if (!seen.has(k)) { seen.add(k); gloss[k] = v }
}
fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/glossary.json', JSON.stringify(gloss))
// REMINDER: when this output changes, bump the nw-gloss-vN cache key in components/ScanReader.tsx
console.log('glossary entries', Object.keys(gloss).length)
