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
for (const w of [360, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const p = await ctx.newPage()
  await p.goto('http://localhost:8099/read/a2-kb/11/', { waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
  const r = await p.evaluate(() => {
    const de = document.documentElement
    const bar = document.querySelector('.fixed.inset-x-0.bottom-0')
    const row = bar.querySelectorAll(':scope > div')[1]
    const kids = [...row.children].map(k => { const b2 = k.getBoundingClientRect(); return { a: k.getAttribute('aria-label') || k.tagName, l: Math.round(b2.left), r: Math.round(b2.right) } })
    return { scrollW: de.scrollWidth, innerW: window.innerWidth, rowRight: Math.round(row.getBoundingClientRect().right), kids }
  })
  console.log(w, 'scrollW', r.scrollW, 'innerW', r.innerW)
  for (const k of r.kids) console.log('   ', k.a, k.l, '->', k.r, k.r > w ? 'OVERFLOW' : 'ok')
  await p.screenshot({ path: `/downloads/bar-${w}.png`, clip: { x: 0, y: 844 - 56, width: w, height: 56 } })
  await ctx.close()
}
await b.close(); server.close()
