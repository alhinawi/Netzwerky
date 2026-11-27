import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
// turn on answer mode
await p.click('button[aria-label="Antwortfeld setzen"]')
await p.waitForTimeout(200)
// click on the checkbox line area of exercise b
const box = await p.$('.paper > div')
const bb = await box.boundingBox()
await p.mouse.click(bb.x + bb.width * 0.25, bb.y + bb.height * 0.78)
await p.waitForTimeout(200)
await p.mouse.click(bb.x + bb.width * 0.25, bb.y + bb.height * 0.82)
await p.waitForTimeout(300)
const inputs = await p.$$('input[placeholder="…"]')
console.log('fields', inputs.length)
if (inputs[0]) { await inputs[0].fill('das Handy'); }
if (inputs[1]) { await inputs[1].fill('falsch geraten') }
await p.waitForTimeout(200)
await p.screenshot({ path: '/tmp/shots/fields-typed.png' })
const pr = await p.$('button[aria-label="Prüfen"]')
if (pr) await pr.click()
await p.waitForTimeout(300)
await p.screenshot({ path: '/tmp/shots/fields-checked.png' })
const borders = await p.evaluate(() => [...document.querySelectorAll('input[placeholder="…"]')].map(i => getComputedStyle(i).borderColor))
console.log(JSON.stringify(borders))
// reset
await p.click('button[aria-label="Zurücksetzen"]')
await p.waitForTimeout(300)
console.log('after reset', (await p.$$('input[placeholder="…"]')).length)
await p.screenshot({ path: '/tmp/shots/fields-reset.png' })
await b.close()
