const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const btns = [...document.querySelectorAll('button[aria-label$="Bedeutung"]')]
const step = Math.max(1, Math.ceil(btns.length / 10))
const picks = btns.filter((b, i) => i % step === 0).slice(0, 10)
const out = []
for (const btn of picks) {
  const label = (btn.getAttribute('aria-label') || '').replace(/ — Bedeutung$/, '')
  const r = btn.getBoundingClientRect()
  btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: r.left + r.width * 0.5, clientY: r.top + r.height / 2 }))
  await sleep(1300)
  const pop = document.querySelector('[class*="bg-neutral-900/95"]')
  if (!pop) { out.push({ label: label.slice(0, 28), mode: 'none' }); continue }
  const de = (pop.querySelector('div.font-semibold') || {}).textContent
  const ar = (pop.querySelector('div.ar') || {}).textContent
  const sentTab = [...pop.querySelectorAll('button')].find((b) => b.textContent.trim() === 'جملة')
  const sentActive = Boolean(sentTab && /font-semibold/.test(sentTab.className))
  out.push({ label: label.slice(0, 28), tok: de, ar, mode: sentActive ? 'sentence' : 'word', arLen: (ar || '').length })
  const x = [...pop.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'اقفل')
  if (x) { x.dispatchEvent(new MouseEvent('click', { bubbles: true })); await sleep(250) }
}
return out
