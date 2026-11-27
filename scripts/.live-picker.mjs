import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
const btn = await p.$('button[aria-label="Seite wählen"]')
const label = btn ? await btn.innerText() : null
if (btn) { await btn.evaluate(el => el.click()); await p.waitForTimeout(600) }
await p.screenshot({ path: '/tmp/shots/live-picker.png' })
const chips = await p.$$eval('button', els => els.filter(e => /^\d+$/.test((e.innerText||'').trim())).length)
console.log(JSON.stringify({ label, chips, bad: bad.slice(0,3) }))
await b.close()
