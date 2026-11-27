import { chromium } from 'playwright'
const b = await chromium.launch()
for (const w of [360, 390, 412]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  for (const u of ['/', '/read/a2-kb/28/', '/read/a1-kb/9/']) {
    await p.goto('http://localhost:8099' + u, { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
    console.log(w, u, JSON.stringify(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))))
  }
  await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400)
  await p.click('button[aria-label="Bibliothek"]'); await p.waitForTimeout(500)
  console.log(w, 'drawer', JSON.stringify(await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }))))
  if (w === 390) await p.screenshot({ path: '/tmp/shots/drawer-390.png' })
  await p.close()
}
await b.close()
