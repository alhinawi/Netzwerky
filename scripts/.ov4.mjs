import { chromium } from 'playwright'
const b = await chromium.launch()
for (const w of [393, 412]) {
  const p = await b.newPage({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2.6, isMobile: true, hasTouch: true })
  await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600)
  const base = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  // tap a word
  const box = await p.$('button.absolute.rounded-sm'); if (box) await box.click()
  await p.waitForTimeout(300)
  const withPopup = await p.evaluate(() => {
    const de = document.documentElement
    const wide = [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > de.clientWidth + 1).map(el => (el.tagName + ' ' + (el.className || '').toString()).slice(0, 60)).slice(0, 4)
    return { sw: de.scrollWidth, iw: window.innerWidth, wide }
  })
  console.log(w, 'base', JSON.stringify(base), 'popup', JSON.stringify(withPopup))
  await p.close()
}
await b.close()
