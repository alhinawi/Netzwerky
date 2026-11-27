import { chromium } from 'playwright'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
await p.goto('https://netzwerky.pages.dev/read/a1-kb/9/?cb=' + Date.now(), { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
const info = await p.evaluate(() => {
  const header = document.querySelector('.sticky.top-0')
  const btns = [...header.querySelectorAll('button')].map(x => x.getAttribute('aria-label') || x.textContent.trim())
  return { headerButtons: btns, pageW: document.documentElement.scrollWidth }
})
console.log(JSON.stringify(info))
await p.screenshot({ path: '/tmp/shots/fresh-a1p9b.png' })
await b.close()
