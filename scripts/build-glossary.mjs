import fs from 'node:fs'
import path from 'node:path'

const roots = ['content/scan/a1-kb', 'content/scan/a2-kb']
const derived = {}
const STOP = new Set('der die das den dem des ein eine einen einem einer eines und oder aber mit ohne fuer für von bei aus nach zu zum zur im in an am auf ueber über unter vor hinter neben zwischen ist sind war sein hat haben wird werden sich sie er es wir ihr ich du man nicht auch noch nur schon sehr mehr wie was wer wo'.split(/\s+/))
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
        const words = de.split(/\s+/).filter(Boolean)
        const bare = (w) => w.toLowerCase().replace(/[^a-zäöüß0-9-]/g, '')
        const keys = [words.length === 1 ? bare(de) : de.toLowerCase()]
        // article + noun: index the noun on its own too ("die Zeitung" -> "zeitung")
        if (words.length === 2 && /^(der|die|das)$/i.test(words[0])) keys.push(bare(words[1]))
        // short phrases: let a tap on any content word show the phrase meaning,
        // but only as a fallback after every exact entry has been collected
        if (words.length > 1 && words.length <= 4) {
          for (const w of words) {
            const k = bare(w)
            if (k.length > 2 && !STOP.has(k)) derived[k] = derived[k] || meaning
          }
        }
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
for (const [k, v] of Object.entries(derived)) if (!(k in gloss)) gloss[k] = v
fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/glossary.json', JSON.stringify(gloss))
console.log('glossary entries', Object.keys(gloss).length)
