import { chromium } from 'playwright'
const b = await chromium.launch()
for (const [w, mobile] of [[390,true],[390,false]]) {
  const p = await b.newPage({ viewport: { width: w, height: 844 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 2 })
  await p.goto('http://localhost:8099/read/a2-kb/66/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(300)
  console.log(JSON.stringify({ w, mobile, innerW: await p.evaluate(() => window.innerWidth), docW: await p.evaluate(() => document.documentElement.scrollWidth) }))
  await p.close()
}
await b.close()
