import { chromium } from 'playwright'
const pages = process.argv.slice(2).map(Number)
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })
const pg = await ctx.newPage()
for (const p of pages) {
  await pg.goto(`http://localhost:8099/read/a2-ab/${p}/`, { waitUntil: 'networkidle' })
  await pg.waitForTimeout(700)
  await pg.screenshot({ path: `/downloads/abv-${String(p).padStart(3,'0')}.png` })
  const t = await pg.evaluate(() => document.body.innerText.slice(0, 120).replace(/\n/g, ' | '))
  console.log(p, '::', t)
}
await b.close()
