import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.click('button[aria-label="Bibliothek"]')
await p.waitForTimeout(700)
await p.screenshot({ path: '/tmp/shots/live-drawer.png' })
const drawer = await p.evaluate(() => document.body.innerText.split('\n').filter(Boolean).slice(0, 10).join(' | '))
await p.keyboard.press('Escape'); await p.waitForTimeout(400)
await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await p.waitForTimeout(500)
const footerBtns = await p.$$eval('button', els => els.filter(e => e.offsetParent !== null).slice(-8).map(e => ({ t: (e.innerText||'').slice(0,24), a: e.getAttribute('aria-label')||'' })))
await p.screenshot({ path: '/tmp/shots/live-footer.png' })
// try the page picker
const pick = await p.$('button[aria-label*="Seite"], button[aria-label*="Buchseite"]')
let opened = false
if (pick) { await pick.click(); await p.waitForTimeout(600); opened = true }
await p.screenshot({ path: '/tmp/shots/live-pages.png' })
console.log(JSON.stringify({ drawer, footerBtns, opened, bad: bad.slice(0,3) }))
await b.close()
