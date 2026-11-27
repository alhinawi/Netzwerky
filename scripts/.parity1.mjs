import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a2-kb/28/', { waitUntil: 'networkidle' })
await p.waitForTimeout(700)
await p.screenshot({ path: '/tmp/shots/parity-word.png' })
await p.evaluate(() => { [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Word').click() })
await p.waitForTimeout(300)
const label = await p.evaluate(() => [...document.querySelectorAll('button')].map(x => x.textContent.trim()).filter(t => t === 'Word' || t === 'Sentence'))
await p.screenshot({ path: '/tmp/shots/parity-sentence.png' })
// tap a word box in sentence mode
const box = await p.$('button.absolute.rounded-sm')
if (box) { await box.click(); await p.waitForTimeout(400) }
await p.screenshot({ path: '/tmp/shots/parity-sentence-popup.png' })
console.log('labels', JSON.stringify(label))
await b.close()
