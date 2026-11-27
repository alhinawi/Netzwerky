import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
for (const url of ['http://localhost:8099/', 'http://localhost:8099/read/a2-kb/66/']) {
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(300)
  const r = await p.evaluate(() => {
    const wide = [...document.querySelectorAll('*')]
      .map(e => ({ t: e.tagName, c: (e.className||'').toString().slice(0,50), r: Math.round(e.getBoundingClientRect().right) }))
      .filter(x => x.r > window.innerWidth + 1).slice(0, 6)
    return { innerW: window.innerWidth, docW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, wide }
  })
  console.log(url, JSON.stringify(r))
}
await b.close()
