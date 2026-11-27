import { chromium } from 'playwright'
const b = await chromium.launch()
const urls = ['/', '/read/a1-kb/9/', '/read/a2-kb/28/', '/read/a2-kb/66/', '/hilfe/']
for (const w of [360, 390, 412]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  for (const u of urls) {
    await p.goto('http://localhost:8099' + u, { waitUntil: 'networkidle' })
    await p.waitForTimeout(500)
    const m = await p.evaluate(() => {
      const de = document.documentElement
      const wide = [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > de.clientWidth + 1).slice(0, 3).map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 40))
      return { sw: de.scrollWidth, cw: de.clientWidth, wide }
    })
    console.log(w, u, JSON.stringify(m))
  }
  await p.close()
}
await b.close()
