import { chromium } from 'playwright'
const b = await chromium.launch()
for (const w of [360, 390, 412]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  await p.click('button[aria-label="Profil"]')
  await p.waitForTimeout(400)
  console.log(w, 'profile', JSON.stringify(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))))
  await p.screenshot({ path: `/tmp/shots/ov-profile-${w}.png` })
  await p.close()
}
await b.close()
