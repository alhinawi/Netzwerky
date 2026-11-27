import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const r = await p.goto('http://localhost:8099/read/a2-kb/83/', { waitUntil: 'networkidle' })
console.log('status', r.status())
await p.waitForTimeout(800)
console.log('inputs', (await p.$$('input[aria-label]')).length)
console.log('labels', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).filter(Boolean))))
await b.close()
