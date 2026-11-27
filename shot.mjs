import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 })
const shots = [
  ['/', '/tmp/shots/cover.png'],
  ['/library/', '/tmp/shots/library.png'],
  ['/read/a1-kb/11/', '/tmp/shots/p11.png'],
  ['/read/a1-kb/12/', '/tmp/shots/p12.png'],
]
for (const [url, path] of shots) {
  await p.goto('http://127.0.0.1:8099' + url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(300)
  await p.screenshot({ path, fullPage: true })
  console.log(url, 'ok')
}
await b.close()
