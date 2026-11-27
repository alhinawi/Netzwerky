import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' }); await p.waitForTimeout(700)
await p.screenshot({ path: '/tmp/shots/bars-word.png' })
await p.click('button[aria-label*="Wortmodus"]'); await p.waitForTimeout(300)
await p.screenshot({ path: '/tmp/shots/bars-sentence.png' })
const m = await p.evaluate(() => {
  const btns = [...document.querySelectorAll('button')].filter(b => /Word|Sentence/.test(b.textContent))
  return { w: btns.map(b => Math.round(b.getBoundingClientRect().width)), sw: document.documentElement.scrollWidth }
})
console.log(JSON.stringify(m))
await b.close()
