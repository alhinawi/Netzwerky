import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('https://netzwerky.pages.dev/read/a1-kb/62/', { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
const res = await p.evaluate(() => {
  const page = document.querySelector('.paper > div')
  const pr = page.getBoundingClientRect()
  return [...page.querySelectorAll('*')].filter(el => {
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const thin = r.height < 6 && r.width > pr.width * 0.5
    const bordered = cs.borderTopWidth !== '0px' || cs.borderBottomWidth !== '0px' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
    return thin && bordered
  }).map(el => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80), w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height), y: Math.round(el.getBoundingClientRect().top - pr.top), bg: getComputedStyle(el).backgroundColor, bb: getComputedStyle(el).borderBottomColor }))
})
console.log(JSON.stringify(res, null, 1).slice(0, 1200))
await b.close()
