import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a1-kb/9/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
console.log(JSON.stringify(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth }))))
await p.screenshot({ path: '/tmp/shots/parity-bars.png' })
await b.close()
