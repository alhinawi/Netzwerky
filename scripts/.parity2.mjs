import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
const box = await p.$('button.absolute.rounded-sm')
if (box) { await box.click(); await p.waitForTimeout(400) }
await p.screenshot({ path: '/tmp/shots/parity-speaker.png' })
console.log('ok')
await b.close()
