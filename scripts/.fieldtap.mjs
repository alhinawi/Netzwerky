import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('https://netzwerky.pages.dev/read/a2-kb/83/', { waitUntil: 'networkidle' })
await p.waitForTimeout(900)
const inputs = await p.$$('input[aria-label]')
console.log('fields', inputs.length)
const bb = await inputs[0].boundingBox()
console.log('box', JSON.stringify(bb))
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2)
await p.waitForTimeout(300)
const st = await p.evaluate(() => ({
  active: document.activeElement?.tagName,
  activeLabel: document.activeElement?.getAttribute?.('aria-label'),
  popup: !!document.querySelector('.bg-neutral-900\\/95'),
}))
console.log(JSON.stringify(st))
await p.keyboard.type('5')
await p.waitForTimeout(200)
console.log('value', await p.evaluate(() => document.activeElement?.value))
await p.screenshot({ path: '/tmp/shots/field-tap.png' })
await b.close()
