import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
const rows = await p.evaluate(() => [...document.querySelectorAll('.fixed.inset-x-0.bottom-0 button, .fixed.inset-x-0.bottom-0 a')].map(e => ({ a: e.getAttribute('aria-label') || '', t: (e.innerText||'').slice(0,12), y: Math.round(e.getBoundingClientRect().top) })))
console.log(JSON.stringify(rows))
await b.close()
