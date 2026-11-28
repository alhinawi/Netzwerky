import { chromium } from 'playwright'
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve('out')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp3': 'audio/mpeg', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' }
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0])
  let f = path.join(root, u)
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
const errs = []
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
p.on('requestfailed', r => errs.push('FAILED ' + r.url()))
await p.goto('http://localhost:8099/read/a2-kb/97/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
await p.screenshot({ path: '/downloads/p97-live-1.png' })
console.log('aria-pressed buttons:', await p.locator('button[aria-pressed]').count(), 'pressed:', await p.locator('button[aria-pressed="true"]').count())
const f1 = p.locator('button[aria-label="10a 1 richtig"]')
console.log('f1 count', await f1.count())
if (await f1.count()) { await f1.first().click(); await p.waitForTimeout(300) }
await p.screenshot({ path: '/downloads/p97-live-2.png' })
await p.locator('button[aria-label="Prüfen"]').click()
await p.waitForTimeout(900)
await p.screenshot({ path: '/downloads/p97-live-3.png' })
const t = await p.locator('body').innerText()
console.log('BODYTEXT:', JSON.stringify(t.slice(0, 300)))
console.log('errors:', JSON.stringify(errs.slice(0, 8)))
await b.close()
server.close()
