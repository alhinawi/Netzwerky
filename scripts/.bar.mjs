import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
for (const n of [28, 66, 110]) {
  await p.goto(`http://localhost:8099/read/a2-kb/${n}/`, { waitUntil: 'networkidle' }); await p.waitForTimeout(500)
  const w = await p.evaluate(() => { const btn = document.querySelector('button[aria-label="Kapitel wählen"]'); const r = btn.getBoundingClientRect(); return { btn: Math.round(r.width), sw: document.documentElement.scrollWidth } })
  console.log(n, JSON.stringify(w))
}
await p.screenshot({ path: '/tmp/shots/bar-compact.png' })
await p.click('button[aria-label="Kapitel wählen"]'); await p.waitForTimeout(300)
await p.screenshot({ path: '/tmp/shots/bar-menu.png' })
await b.close()
