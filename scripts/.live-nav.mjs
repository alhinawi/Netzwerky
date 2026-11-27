import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const bad = []
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
// 1. library drawer via the hamburger
const burger = await p.$('button[aria-label*="Library"], button[aria-label*="Bibliothek"], header button')
if (burger) { await burger.click(); await p.waitForTimeout(600) }
await p.screenshot({ path: '/tmp/shots/live-nav-drawer.png' })
const drawerText = await p.evaluate(() => document.body.innerText.split('\n').slice(0, 14).join(' | '))
// close it
await p.keyboard.press('Escape'); await p.waitForTimeout(300)
// 2. page-number picker
const pick = await p.$('button[aria-label*="Seite"], button:has-text("Buchseite")')
let pickInfo = null
if (pick) { pickInfo = await pick.innerText(); await pick.click(); await p.waitForTimeout(600) }
await p.screenshot({ path: '/tmp/shots/live-nav-pages.png' })
const pageListCount = await p.evaluate(() => document.querySelectorAll('button').length)
console.log(JSON.stringify({ drawerText, pickInfo, pageListCount, bad: bad.slice(0, 4) }))
await b.close()
