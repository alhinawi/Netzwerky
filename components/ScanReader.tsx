'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScanPage } from '@/content/scan/types'
import { playCorrect, playWrong, playTap } from '@/lib/sound'

const norm = (s: string) =>
  s.normalize('NFC').toLowerCase().trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ')

const pct = (v: number, total: number) => `${(v / total) * 100}%`

type Answers = Record<string, string>
type Results = Record<string, boolean>

export default function ScanReader({
  page, total, prev, next, pages,
}: {
  page: ScanPage
  total: number
  prev?: number
  next?: number
  pages: number[]
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<Results>({})
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [flip, setFlip] = useState<'none' | 'next' | 'prev'>('none')
  const [shake, setShake] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [debug, setDebug] = useState(false)
  useEffect(() => {
    const on = () => setDebug(window.location.hash === '#boxes')
    on()
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const audio = useRef<HTMLAudioElement | null>(null)
  const queue = useRef<string[]>([])
  const storageKey = `netzwerky-${page.book}-${page.printed}`

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      setAnswers(raw ? JSON.parse(raw) : {})
    } catch {
      setAnswers({})
    }
    setResults({})
    setActiveWord(null)
    setFlip('none')
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers))
    } catch {}
  }, [answers, storageKey])

  const save = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }))

  const play = (src: string[]) => {
    queue.current = [...src]
    const first = queue.current.shift()
    if (!first) return
    setPlaying(first)
    requestAnimationFrame(() => {
      const el = audio.current
      if (!el) return
      el.src = `/audio/a1/kb/${first}`
      void el.play().catch(() => {})
    })
  }

  const onEnded = () => {
    const nxt = queue.current.shift()
    if (nxt && audio.current) {
      setPlaying(nxt)
      audio.current.src = `/audio/a1/kb/${nxt}`
      void audio.current.play().catch(() => {})
    } else setPlaying(null)
  }

  const graded = useMemo(() => {
    const ids: string[] = []
    for (const f of page.fields) ids.push(f.id)
    for (const m of page.matchings) m.left.forEach((_, i) => ids.push(`${m.id}-${i}`))
    return ids
  }, [page])

  const check = () => {
    const nextRes: Results = {}
    let allOk = true
    for (const f of page.fields) {
      const ok = f.answer.split('|').some((a) => norm(a) === norm(answers[f.id] || ''))
      nextRes[f.id] = ok
      if (!ok) allOk = false
    }
    for (const m of page.matchings) {
      m.left.forEach((_, i) => {
        const ok = answers[`${m.id}-${i}`] === m.answers[i]
        nextRes[`${m.id}-${i}`] = ok
        if (!ok) allOk = false
      })
    }
    setResults(nextRes)
    if (allOk) playCorrect()
    else {
      playWrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 430)
    }
  }

  const reset = () => {
    setAnswers({})
    setResults({})
    playTap()
  }

  const go = (target?: number) => {
    if (!target) return
    setFlip(target > page.printed ? 'next' : 'prev')
    router.push(`/read/${page.book}/${target}/`)
  }

  const W = page.width
  const H = page.height
  const boxStyle = (b: { x: number; y: number; w: number; h: number }) => ({
    left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H),
  })

  return (
    <div className="mx-auto max-w-[1180px] px-2 pb-24 pt-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button onClick={() => router.push(`/book/${page.book}/`)} className="text-neutral-500 hover:text-nw">← Kapitel</button>
        <span className="text-neutral-400">Netzwerk neu A1 · Kursbuch</span>
        <span className="text-neutral-400">S. {page.printed}</span>
      </div>

      <div className="overflow-auto rounded-lg bg-[#f0eeec] p-1 paper">
        <div
          className={`relative mx-auto select-none bg-white ${shake ? 'shake' : ''} ${flip === 'none' ? 'fade-in' : ''}`}
          style={{ width: `${zoom * 100}%`, aspectRatio: `${W} / ${H}` }}
          onClick={() => setActiveWord(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.image} alt={`Netzwerk neu A1, Seite ${page.printed}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />

          {(page.patches ?? []).map((b, i) => (
            <div key={`patch-${i}`} className="pointer-events-none absolute bg-white" style={boxStyle(b)} />
          ))}

          {debug && (
            <>
              {page.words.map((w) => (<div key={'dw'+w.id} className="absolute border border-rose-500" style={boxStyle(w)} />))}
              {page.audio.map((a) => (<div key={'da'+a.id} className="absolute border border-sky-500" style={boxStyle(a)} />))}
              {page.fields.map((f) => (<div key={'df'+f.id} className="absolute border border-emerald-500" style={boxStyle(f)} />))}
              {page.matchings.flatMap((m) => m.left.map((it,i)=>(<div key={'dl'+m.id+i} className="absolute border border-violet-500" style={boxStyle(it)} />)))}
            </>
          )}
          {page.words.map((w) => (
            <button
              key={w.id}
              onClick={(e) => { e.stopPropagation(); setActiveWord(activeWord === w.id ? null : w.id); playTap() }}
              className={`absolute rounded-sm transition ${activeWord === w.id ? 'bg-amber-200/60 ring-2 ring-amber-400' : 'hover:bg-amber-100/50'}`}
              style={boxStyle(w)}
              aria-label={`${w.text} — Bedeutung`}
            />
          ))}

          {page.words.map((w) =>
            activeWord === w.id ? (
              <div
                key={`tip-${w.id}`}
                className="absolute z-30 w-64 -translate-y-full rounded-lg bg-neutral-900/95 px-3 py-2 text-white shadow-xl"
                style={{ left: pct(w.x, W), top: pct(Math.max(w.y - 4, 40), H) }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-[13px] font-semibold">{w.text}</div>
                <div className="ar mt-1 text-[13px] text-amber-200">{w.ar}</div>
              </div>
            ) : null,
          )}

          {page.audio.map((a) => (
            <button
              key={a.id}
              onClick={(e) => { e.stopPropagation(); play(a.src) }}
              className={`absolute flex items-center justify-center rounded-full text-[11px] font-bold text-white transition ${playing ? 'bg-emerald-600' : 'bg-nw hover:bg-nw-dark'}`}
              style={boxStyle(a)}
              title={a.label}
              aria-label={a.label}
            >
              ▶
            </button>
          ))}

          {page.fields.map((f) => {
            const status = results[f.id]
            return (
              <input
                key={f.id}
                value={answers[f.id] || ''}
                onChange={(e) => save(f.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label={f.label || f.id}
                autoComplete="off"
                spellCheck={false}
                className={`absolute rounded-sm bg-white/85 px-1 text-center text-[clamp(9px,1.35vw,17px)] outline-none transition ${
                  status === undefined
                    ? 'border-b-2 border-dashed border-nw/60 focus:border-nw focus:bg-white'
                    : status
                      ? 'border-b-2 border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-b-2 border-rose-600 bg-rose-50 text-rose-800'
                }`}
                style={boxStyle(f)}
              />
            )
          })}

          {page.matchings.map((m) => (
            <MatchLayer
              key={m.id}
              matching={m}
              W={W}
              H={H}
              answers={answers}
              results={results}
              onPair={(i, value) => save(`${m.id}-${i}`, value)}
            />
          ))}
        </div>
      </div>

      {playing && (
        <div className="paper fixed inset-x-0 bottom-14 z-20 mx-auto flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-2 text-sm">
          <span className="flex-1 truncate text-neutral-600">▶ {playing.replace('NWn_A1_KB_Audio_', 'Aufgabe ').replace('.mp3', '')}</span>
          <button onClick={() => { audio.current?.pause(); queue.current = []; setPlaying(null) }} className="text-neutral-400 hover:text-nw">✕</button>
        </div>
      )}
      <audio ref={audio} onEnded={onEnded} className="hidden" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-1">
            <button onClick={() => go(prev)} disabled={!prev} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30">‹</button>
            <form
              onSubmit={(e) => { e.preventDefault(); const v = Number(new FormData(e.currentTarget).get('p')); if (pages.includes(v)) go(v) }}
              className="flex items-center gap-1 text-sm text-neutral-500"
            >
              <input name="p" defaultValue={page.printed} key={page.printed} className="w-12 rounded border border-neutral-300 px-1 py-1 text-center" aria-label="Seite" />
              <span>/ {pages[pages.length - 1]}</span>
            </form>
            <button onClick={() => go(next)} disabled={!next} className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30">›</button>
          </div>

          <div className="flex items-center gap-1 text-[13px]">
            <button onClick={() => setZoom(1)} className={`rounded px-2 py-1 ${zoom === 1 ? 'bg-nw text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Fit</button>
            <button onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.25).toFixed(2)))} className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">+</button>
            <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.25).toFixed(2)))} className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">−</button>
          </div>

          <div className="flex items-center gap-2">
            {graded.length > 0 && (
              <>
                <button onClick={reset} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-nw hover:text-nw">Zurücksetzen</button>
                <button onClick={check} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">✓ Prüfen</button>
              </>
            )}
          </div>
        </div>
      </div>
      <span className="hidden">{total}</span>
    </div>
  )
}

function MatchLayer({
  matching, W, H, answers, results, onPair,
}: {
  matching: ScanPage['matchings'][number]
  W: number
  H: number
  answers: Answers
  results: Results
  onPair: (i: number, value: string) => void
}) {
  const [active, setActive] = useState<number | null>(null)
  const colors = ['#e11d48', '#0284c7', '#059669', '#d97706', '#7c3aed', '#0d9488']
  const lineFor = (i: number) => {
    const target = answers[`${matching.id}-${i}`]
    if (target === undefined) return null
    const r = matching.right.findIndex((x) => x.text === target)
    if (r < 0) return null
    const L = matching.left[i]
    const R = matching.right[r]
    const ok = results[`${matching.id}-${i}`]
    return {
      x1: L.x + L.w, y1: L.y + L.h / 2, x2: R.x, y2: R.y + R.h / 2,
      color: ok === undefined ? colors[i % colors.length] : ok ? '#059669' : '#e11d48',
    }
  }
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {matching.left.map((_, i) => {
          const l = lineFor(i)
          return l ? <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={l.color} strokeWidth={3} strokeLinecap="round" /> : null
        })}
      </svg>
      {matching.left.map((it, i) => (
        <button
          key={`l-${i}`}
          onClick={(e) => { e.stopPropagation(); setActive(i); playTap() }}
          className={`absolute rounded ${active === i ? 'bg-sky-200/50 ring-2 ring-sky-400' : 'hover:bg-sky-100/50'}`}
          style={{ left: pct(it.x, W), top: pct(it.y, H), width: pct(it.w, W), height: pct(it.h, H) }}
          aria-label={`Frage ${it.text}`}
        />
      ))}
      {matching.right.map((it, r) => (
        <button
          key={`r-${r}`}
          onClick={(e) => { e.stopPropagation(); if (active !== null) { onPair(active, it.text); setActive(null) } }}
          className="absolute rounded hover:bg-sky-100/50"
          style={{ left: pct(it.x, W), top: pct(it.y, H), width: pct(it.w, W), height: pct(it.h, H) }}
          aria-label={`Antwort ${it.text}`}
        />
      ))}
    </>
  )
}
