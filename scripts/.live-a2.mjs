import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/65/', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
await p.screenshot({ path: '/tmp/shots/live-a2-p65.png' })
const w = await p.$$('button[aria-label*="Bedeutung"]')
if (w[3]) { await w[3].click(); await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/shots/live-a2-p65-tap.png' }) }
const a = await p.$$('button[aria-label*="Aufgabe"]')
let src = null
if (a[0]) { await a[0].click(); await p.waitForTimeout(800); src = await p.evaluate(() => { const x = document.querySelector('audio'); return x ? (x.currentSrc || x.src) : null }) }
console.log('word btns', w.length, 'audio btn', a.length, 'audio src', src)
console.log('4xx', bad.slice(0, 5))
await b.close()
