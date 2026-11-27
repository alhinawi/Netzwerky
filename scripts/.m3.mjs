import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
const wide = await p.evaluate(() => [...document.querySelectorAll('*')]
  .map(e => ({ t: e.tagName, c: (e.className||'').toString().slice(0,60), r: Math.round(e.getBoundingClientRect().right), w: Math.round(e.getBoundingClientRect().width) }))
  .filter(x => x.r > 392 || x.w > 392).slice(0, 12))
console.log(JSON.stringify(wide, null, 1))
await b.close()
