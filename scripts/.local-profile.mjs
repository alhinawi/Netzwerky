import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
await p.evaluate(() => { const b = document.querySelector('button[aria-label="Profil"]'); b && b.click() })
await p.waitForTimeout(600)
await p.screenshot({ path: '/tmp/shots/local-profile.png' })
await b.close()
