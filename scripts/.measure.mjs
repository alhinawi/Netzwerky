import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(400)
const m = await p.evaluate(() => ({
  docW: document.documentElement.scrollWidth,
  bodyW: document.body.scrollWidth,
  innerW: window.innerWidth,
  visualW: window.visualViewport?.width,
  overflowers: [...document.querySelectorAll('*')].filter(e => e.scrollWidth > window.innerWidth + 2).slice(0,5).map(e => e.tagName + '.' + (e.className || '').toString().slice(0,40) + ' w=' + e.scrollWidth),
}))
console.log(JSON.stringify(m, null, 1))
await b.close()
