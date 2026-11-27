// Phone screenshot of the DEPLOYED page, cache-busted. Usage:
//   node scripts/shoot-live.mjs 22 [tap]
// Writes /tmp/shots/m-p<printed>[-tap].png
import { chromium } from 'playwright'
const n = Number(process.argv[2] || 20)
const tap = process.argv[3] === 'tap'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto(`https://netzwerky.pages.dev/read/a1-kb/${n}/?cb=${Date.now()}`, { waitUntil: 'networkidle' })
await p.waitForTimeout(500)
if (tap) {
  const btn = await p.$('button[aria-label*="Bedeutung"]')
  if (btn) { await btn.click(); await p.waitForTimeout(400) }
}
await p.screenshot({ path: `/tmp/shots/m-p${n}${tap ? '-tap' : ''}.png`, fullPage: false })
await b.close(); console.log('ok')
