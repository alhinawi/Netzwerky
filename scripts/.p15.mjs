import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a1-kb/15/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
// click each word box, log popup label + first 40 chars
const boxes = await p.$$('button.absolute.rounded-sm')
const out = []
for (let i = 0; i < Math.min(boxes.length, 40); i++) {
  await boxes[i].click({ force: true }).catch(() => {})
  await p.waitForTimeout(60)
  const t = await p.evaluate(() => {
    const d = document.querySelector('.bg-neutral-900\\/95')
    if (!d) return null
    const active = d.querySelector('.bg-white\\/20')?.textContent?.trim()
    const body = d.querySelector('.font-semibold')?.textContent?.trim() || ''
    return { active, body: body.slice(0, 45) }
  })
  if (t) out.push(t)
  await p.keyboard.press('Escape').catch(() => {})
  await p.click('body', { position: { x: 5, y: 300 } }).catch(() => {})
}
const long = out.filter(o => (o.body || '').length > 28)
console.log('boxes', boxes.length, 'longText', long.length)
console.log(JSON.stringify(long.slice(0, 6), null, 0))
await b.close()
