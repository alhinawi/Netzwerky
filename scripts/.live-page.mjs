import { chromium } from 'playwright'
const book = process.argv[2], n = process.argv[3], tag = process.argv[4] || ''
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto(`https://netzwerky.pages.dev/read/${book}/${n}/`, { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
const sel = await p.$eval('select[aria-label="Kapitel"]', s => ({ value: s.value, label: s.options[s.selectedIndex]?.textContent, all: [...s.options].map(o => o.textContent) })).catch(() => null)
const a = await p.$$('button[aria-label*="Aufgabe"], button[aria-label*="Aussprache"], button[aria-label*="Gut gesagt"]')
let src = null
if (a[0]) { await a[0].click(); await p.waitForTimeout(700); src = await p.evaluate(() => { const x = document.querySelector('audio'); return x ? (x.currentSrc || x.src) : null }) }
const w = await p.$$('button[aria-label*="Bedeutung"]')
console.log(JSON.stringify({ book, n, chapter: sel, audioButtons: a.length, audioSrc: src, words: w.length, bad: bad.slice(0, 4) }))
await p.screenshot({ path: `/tmp/shots/live-${book}-${n}${tag}.png` })
await b.close()
