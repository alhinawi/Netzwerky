import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
const btns = await p.$$eval('button', els => els.slice(0, 40).map(e => ({ t: (e.innerText || '').slice(0, 30), a: e.getAttribute('aria-label') || '' })))
console.log(JSON.stringify(btns, null, 0))
await b.close()
