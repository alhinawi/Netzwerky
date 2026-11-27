import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('http://localhost:8099/read/a2-kb/65/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.screenshot({ path: '/tmp/shots/a2-p65.png' })
// audio box
const boxes = await p.$$('button[aria-label*="Aufgabe"]')
console.log('audio buttons', boxes.length)
if (boxes[0]) {
  await boxes[0].click()
  await p.waitForTimeout(700)
  const src = await p.evaluate(() => { const a = document.querySelector('audio'); return a ? a.currentSrc || a.src : null })
  console.log('audio src', src)
  await p.screenshot({ path: '/tmp/shots/a2-p65-audio.png' })
}
// word tap
const w = await p.$$('button[aria-label*="Bedeutung"]')
console.log('word buttons', w.length)
if (w[0]) { await w[0].click(); await p.waitForTimeout(400); await p.screenshot({ path: '/tmp/shots/a2-p65-tap.png' }) }
console.log('errors', bad.slice(0,5))
await b.close()
