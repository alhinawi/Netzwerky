import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
// slow the turn 5x so three screenshots can catch it; production timing is unchanged
await p.addStyleTag({ content: '.turn-next{animation-duration:2.9s!important}.turn-prev{animation-duration:2.9s!important}' })
await p.evaluate(() => { const b = document.querySelector('button[aria-label="Nächste Seite"]'); b && b.click() })
await p.waitForFunction(() => !!document.querySelector('.turn-next, .turn-prev'), null, { timeout: 8000 })
for (const [name, ms] of [['v1', 120], ['v2', 500], ['v3', 700]]) {
  await p.waitForTimeout(ms)
  await p.screenshot({ path: `/tmp/shots/${name}.png` })
}
console.log('done', p.url())
await b.close()
