import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a1-kb/9/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth }))
console.log(JSON.stringify(m))
await p.screenshot({ path: '/tmp/shots/parity-original.png' })
const box = await p.$('button.absolute.rounded-sm')
if (box) { await box.click(); await p.waitForTimeout(300) }
await p.screenshot({ path: '/tmp/shots/parity-speaker2.png' })
await b.close()
