import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.evaluate(() => { const b = document.querySelector('button[aria-label="Nächste Seite"]'); b && b.click() })
await p.waitForFunction(() => !!document.querySelector('.turn-next, .turn-prev'), null, { timeout: 8000 })
const st = await p.evaluate(() => {
  const el = document.querySelector('.turn-next, .turn-prev')
  const cs = getComputedStyle(el)
  return { cls: el.className, name: cs.animationName, dur: cs.animationDuration, transform: cs.transform, opacity: cs.opacity }
})
console.log(JSON.stringify(st))
await b.close()
