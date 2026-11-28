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

const open = async () => {
  await p.goto('http://localhost:8099/read/a2-kb/97/', { waitUntil: 'networkidle' })
  await p.evaluate(() => localStorage.clear())
  await p.reload({ waitUntil: 'networkidle' })
  await p.waitForTimeout(700)
}
const tap = async (label) => { const el = p.locator(`button[aria-label="${label}"]`); await el.first().click(); await p.waitForTimeout(120) }
const check = async () => { await p.locator('button[aria-label="Prüfen"]').click(); await p.waitForTimeout(700) }
const msg = async () => (await p.locator('body').innerText()).split('\n').find(l => /richtig|offen|eingetragen/.test(l)) ?? '(keine Meldung)'

// A: tick the "richtig" box of all four statements (statements 1 and 3 are falsch)
await open()
for (const n of [1, 2, 3, 4]) await tap(`10a ${n} richtig`)
await check()
console.log('A four richtig ticks ->', await msg())
await p.screenshot({ path: '/downloads/p97-pairs-A.png' })

// B: the key: 1 falsch, 2 richtig, 3 falsch, 4 richtig
await open()
for (const n of [1, 3]) await tap(`10a ${n} falsch`)
for (const n of [2, 4]) await tap(`10a ${n} richtig`)
await check()
console.log('B correct ticks ->', await msg())
await p.screenshot({ path: '/downloads/p97-pairs-B.png' })

await b.close(); server.close()
