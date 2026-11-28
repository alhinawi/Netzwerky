import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve('out')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]); let f = path.join(root, u)
  if (u.endsWith('/')) f = path.join(f, 'index.html')
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f = f + '.html'
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html')
  if (!fs.existsSync(f)) { res.writeHead(404); res.end('nf'); return }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' })
  fs.createReadStream(f).pipe(res)
})
await new Promise(r => server.listen(8099, r))
const b = await chromium.launch()
for (const w of [390, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  await p.goto('http://localhost:8099/read/a2-kb/97/', { waitUntil: 'networkidle' })
  await p.evaluate(() => localStorage.clear())
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  const btns = await p.locator('button[aria-label$="prüfen"]').count()
  console.log(w, 'check buttons', btns, 'footer Prüfen present:', await p.locator('button[aria-label="Prüfen"]').count())
  await p.screenshot({ path: `/downloads/icons-${w}-a.png` })
  if (w === 390) {
    for (const l of ['10a 2 richtig', '10a 4 richtig']) { await p.locator(`button[aria-label="${l}"]`).first().click(); await p.waitForTimeout(120) }
    await p.locator('button[aria-label="Aufgabe 10a prüfen"]').first().click()
    await p.waitForTimeout(600)
    await p.screenshot({ path: '/downloads/icons-390-b.png' })
    const t = (await p.locator('body').innerText()).split('\n').filter(Boolean)
    console.log('after 10a check:', JSON.stringify(t.slice(0, 8)))
  }
  await ctx.close()
}
await b.close(); server.close()
