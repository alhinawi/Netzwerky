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
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
const p = await ctx.newPage()
for (const n of [12, 25, 33, 53]) {
  const r = await p.goto('http://localhost:8099/read/a1-kb/' + n + '/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  const img = await p.locator('img[alt^="Netzwerk neu"]').first().getAttribute('src').catch(() => null)
  const t = (await p.locator('body').innerText()).split('\n').filter(Boolean).slice(0, 4)
  console.log(n, 'status', r.status(), 'img', img, JSON.stringify(t))
  await p.screenshot({ path: `/downloads/a1fix-${n}.png` })
}
await b.close(); server.close()
