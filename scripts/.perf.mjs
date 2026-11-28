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
const cdp = await ctx.newCDPSession(p)
await cdp.send('Network.enable')
// throttled 4G: ~1.6 Mbit down, 150 ms RTT
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 100000, connectionType: 'cellular4g' })
await p.goto('http://localhost:8099/read/a2-kb/11/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
const times = []
for (let i = 0; i < 3; i++) {
  const t = await p.evaluate(async () => {
    const btn = document.querySelector('button[aria-label="Nächste Seite"]')
    const t0 = performance.now()
    btn.click()
    // wait until the visible page image has painted the new page
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const img = document.querySelector('img[alt^="Netzwerk neu"]')
    const src = img && img.currentSrc
    if (img && !img.complete) await new Promise((r) => { img.onload = r; img.onerror = r })
    return { ms: Math.round(performance.now() - t0), src: (src || '').split('/').pop() }
  })
  times.push(t)
  await p.waitForTimeout(2500)
}
console.log(JSON.stringify(times))
await b.close(); server.close()
