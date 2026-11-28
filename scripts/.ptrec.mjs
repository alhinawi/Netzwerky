import { chromium } from 'playwright'
const b = await chromium.launch()
for (let n = 1; n <= 10; n++) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 760 }, deviceScaleFactor: 1, recordVideo: { dir: '/tmp/pturn/out', size: { width: 390, height: 760 } } })
  const p = await ctx.newPage()
  await p.goto('file:///tmp/pturn/page.html')
  await p.waitForTimeout(600)
  await p.evaluate((i) => { document.getElementById('label').textContent = 'Option ' + i; window.play(i, 1100) }, n)
  await p.waitForTimeout(1700)
  await ctx.close()
}
await b.close()
