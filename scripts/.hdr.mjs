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

const prefix = process.env.PREFIX || 'hdr'
const b = await chromium.launch()
for (const w of [390, 360]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  await p.goto('http://localhost:8099/read/a2-ab/6/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  await p.screenshot({ path: `/downloads/${prefix}-${w}.png`, clip: { x: 0, y: 0, width: w, height: 64 } })
  const bar = { x: 0, y: 844 - 64, width: w, height: 64 }
  await p.screenshot({ path: `/downloads/${prefix}-bar-word-${w}.png`, clip: bar })
  await p.locator('button[aria-label="Wortmodus, tippen fuer Satz"]').click().catch(() => {})
  await p.waitForTimeout(400)
  await p.screenshot({ path: `/downloads/${prefix}-bar-sentence-${w}.png`, clip: bar })
  const lbl = await p.locator('button[aria-label="Satzmodus, tippen fuer Wort"]').innerText().catch(() => '?')
  console.log(w, 'after toggle label', JSON.stringify(lbl))
  const box = await p.locator('button[aria-label="Kapitel wählen"]').boundingBox()
  const logo = await p.locator('button[aria-label="Bibliothek"]').boundingBox()
  const orig = await p.locator('a[aria-label="Original"]').boundingBox()
  const label = await p.locator('button[aria-label="Kapitel wählen"] span').first().innerText()
  console.log(w, 'menu', JSON.stringify(logo), 'picker', JSON.stringify(box), 'orig', JSON.stringify(orig), 'label', JSON.stringify(label))
  await ctx.close()
}
await b.close(); server.close()
