import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const shot = async (n) => p.screenshot({ path: `/tmp/shots/live-${n}.png` })
// A1 p9 plain
await p.goto('https://netzwerky.pages.dev/read/a1-kb/9/', { waitUntil: 'networkidle' })
await p.waitForTimeout(900); await shot('a1p9')
// A2 p28: sentence mode + tap
await p.goto('https://netzwerky.pages.dev/read/a2-kb/28/', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
const btn = await p.$('button[aria-label*="Wortmodus"]')
if (btn) await btn.click()
await p.waitForTimeout(250)
const box = await p.$('button.absolute.rounded-sm')
if (box) { await box.click(); await p.waitForTimeout(450) }
await shot('a2p28-sentence')
// check hamburger gone + labels
const info = await p.evaluate(() => ({
  hamburger: !!document.querySelector('button[aria-label="Bibliothek"]'),
  labels: [...document.querySelectorAll('button, a')].map(x => x.textContent.trim()).filter(t => /ملاءمة|الأصل|Fit|Original|Sentence|Word/.test(t)),
  sw: document.documentElement.scrollWidth,
}))
console.log(JSON.stringify(info))
await b.close()
