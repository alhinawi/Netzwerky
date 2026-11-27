import { chromium } from 'playwright'
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await p.goto('http://localhost:8099/read/a1-kb/21/', { waitUntil: 'networkidle' })
await p.waitForTimeout(300)
const w = await p.$$('button[aria-label*="Bedeutung"]')
for (const bt of w) { const al = await bt.getAttribute('aria-label'); if (al && al.includes('Gehen wir ins Kino?')) { await bt.click(); break } }
await p.waitForTimeout(300)
const tabs = await p.$$eval('button', bs=>bs.map(b=>b.innerText.trim()).filter(t=>t==='كلمة'||t==='جملة'))
for (const t of await p.$$('button')) { if ((await t.innerText()).includes('اسمع')) { await t.click(); break } }
await p.waitForTimeout(1500)
const a = await p.evaluate(()=>[...document.querySelectorAll('audio')].map(x=>({src:x.currentSrc.split('/').pop(),t:+x.currentTime.toFixed(2),dur:x.duration})))
console.log('tabs', JSON.stringify(tabs), 'audio', JSON.stringify(a))
await p.screenshot({ path: '/tmp/shots/a21.png' })
await b.close()
