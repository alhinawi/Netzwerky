import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/83/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
const labels = await p.evaluate(() => [...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).filter(Boolean))
console.log(JSON.stringify(labels))
const inputs = await p.$$('input[aria-label]')
await inputs[0].fill('5')
await p.waitForTimeout(200)
const btn = await p.$('button[aria-label="Zurücksetzen"]')
console.log('found reset', !!btn)
if (btn) { await btn.click({ force: true }); await p.waitForTimeout(400) }
console.log('values', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('input[aria-label]')].map(i=>i.value))))
await b.close()
