// Desktop screenshot with the tap boxes outlined (#boxes). Serve the export first:
//   python3 -m http.server 8099 -d out &
// Usage: node scripts/shoot-desktop.mjs 22 23 24
// Writes /tmp/shots/v-p<printed>.png
import { chromium } from 'playwright'
const pages = process.argv.slice(2).map(Number)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 900, height: 1200 }, deviceScaleFactor: 1.5 })
for (const n of pages) {
  await p.goto(`http://localhost:8099/read/a1-kb/${n}/#boxes`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(400)
  const el = await p.$('.relative.mx-auto.select-none')
  await el.screenshot({ path: `/tmp/shots/v-p${n}.png` })
}
await b.close(); console.log('ok')
