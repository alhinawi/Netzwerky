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
await p.goto('http://localhost:8099/read/a2-kb/97/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)
await p.screenshot({ path: '/downloads/p97fix-1.png' })
const barText1 = await p.locator('body').innerText()
console.log('p97 track label present:', barText1.includes('Track'), '| label:', JSON.stringify(barText1.split('\n').slice(0, 8)))
await p.locator('button[aria-label="Prüfen"]').click(); await p.waitForTimeout(600)
await p.screenshot({ path: '/downloads/p97fix-2.png' })
console.log('after empty Prüfen:', JSON.stringify((await p.locator('body').innerText()).split('\n').slice(0, 10)))
await p.locator('button[aria-label="10a 1 richtig"]').first().click(); await p.waitForTimeout(200)
await p.locator('button[aria-label="Prüfen"]').click(); await p.waitForTimeout(700)
await p.screenshot({ path: '/downloads/p97fix-3.png' })
console.log('after one answer:', JSON.stringify((await p.locator('body').innerText()).split('\n').slice(0, 10)))
// a page that does have audio
await p.goto('http://localhost:8099/read/a2-kb/11/', { waitUntil: 'networkidle' }); await p.waitForTimeout(900)
const t11 = await p.locator('body').innerText()
console.log('p11 has player:', t11.includes('1.3') || t11.includes('Track'), JSON.stringify(t11.split('\n').slice(0, 6)))
await p.screenshot({ path: '/downloads/p97fix-4.png' })
await b.close(); server.close()
