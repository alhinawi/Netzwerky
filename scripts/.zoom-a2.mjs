import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/65/', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
// click "Original" for 100% zoom
for (const label of ['Original', '100%']) {
  const el = await p.$(`button:has-text("${label}")`)
  if (el) { await el.click(); break }
}
await p.waitForTimeout(700)
const info = await p.evaluate(() => { const i = document.querySelector('img[src*="/pages/a2-kb/"]'); return i ? { src: i.currentSrc, w: i.naturalWidth, cw: i.clientWidth } : null })
console.log(JSON.stringify(info))
await p.screenshot({ path: '/tmp/shots/a2-p65-zoom.png' })
await b.close()
