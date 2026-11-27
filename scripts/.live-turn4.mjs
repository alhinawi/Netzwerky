import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/66/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.evaluate(() => {
  window.__freeze = () => {
    const el = document.querySelector('.turn-next, .turn-prev')
    if (!el) return 'no-el'
    const anims = el.getAnimations()
    anims.forEach(a => a.pause())
    return anims.map(a => a.animationName).join(',')
  }
  const btn = document.querySelector('button[aria-label="Nächste Seite"]')
  btn.click()
})
await p.waitForTimeout(40)
const names = await p.evaluate(() => window.__freeze())
console.log('frozen:', names)
for (const t of [60, 150, 300]) {
  await p.evaluate((tt) => { document.querySelectorAll('.turn-next, .turn-prev').forEach(el => el.getAnimations().forEach(a => { a.pause(); a.currentTime = tt })) }, t)
  await p.waitForTimeout(80)
  await p.screenshot({ path: `/tmp/shots/liveturn-${t}.png` })
  const st = await p.evaluate(() => { const el = document.querySelector('.turn-next, .turn-prev'); if (!el) return 'gone'; const a = el.getAnimations()[0]; const cs = getComputedStyle(el); return { t: a && a.currentTime, tr: cs.transform.slice(0, 60), op: cs.opacity } })
  console.log(t, JSON.stringify(st))
}
await b.close()
