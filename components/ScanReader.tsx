'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScanPage } from '@/content/scan/types'
import { playCorrect, playWrong, playTap } from '@/lib/sound'
import { pronounceUrl } from '@/lib/pronounce'

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
  const [tab, setTab] = useState<'word' | 'sentence'>('word')
  const [zoom, setZoom] = useState(1)
  const [layout, setLayout] = useState<1 | 2 | 4>(1)
  const [flip, setFlip] = useState<'none' | 'next' | 'prev'>('none')
  const [shake, setShake] = useState(false)
  const [playing, setPlaying] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [spoken, setSpoken] = useState<string | null>(null)
  const [askClear, setAskClear] = useState(false)
  const [debug, setDebug] = useState(false)
  const [sheetW, setSheetW] = useState(0)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const wrap = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const on = () => setDebug(window.location.hash === '#boxes')
    on()
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  useEffect(() => {
    const measure = () => setSheetW(wrap.current?.clientWidth ?? 0)
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [zoom, layout])

  const audio = useRef<HTMLAudioElement | null>(null)
  const pron = useRef<HTMLAudioElement | null>(null)
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
    setAskClear(false)
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
    } else {
      setPlaying(null)
      setProgress(0)
    }
  }

  /** German pronunciation for a word or a whole sentence, pre-generated as mp3. */
  const speak = (text: string) => {
    const el = pron.current
    if (!el) return
    setSpoken(text)
    el.src = pronounceUrl(text)
    el.currentTime = 0
    void el.play().catch(() => setSpoken(null))
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
    setAskClear(false)
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

  const word = page.words.find((w) => w.id === activeWord)
  const sentence = word
    ? (page.sentences ?? []).find((s) => (s.words ?? []).includes(word.id)) ??
      (page.sentences ?? []).find((s) => s.text.includes(word.text))
    : undefined
  const showSentence = Boolean(sentence)
  const popupText = tab === 'sentence' && sentence ? sentence.text : word?.text ?? ''
  const popupAr = tab === 'sentence' && sentence ? sentence.ar : word?.ar ?? ''

  /** keep the popup inside the page: shift it left when the word sits near an edge */
  const popupStyle = (w: { x: number; y: number; w: number; h: number }) => {
    const cardW = Math.min(300, sheetW || 300)
    const centre = ((w.x + w.w / 2) / W) * (sheetW || 300)
    const left = Math.max(4, Math.min(centre - cardW / 2, (sheetW || cardW) - cardW - 4))
    return { left: `${left}px`, top: pct(Math.max(w.y - 6, 30), H), width: `${cardW}px` }
  }

  const pageSrc = (n: number) => `/pages/${page.book}/${String(n).padStart(3, '0')}.jpg?v=2`
  const gridPages = useMemo(() => {
    if (layout === 1) return []
    const start = pages.indexOf(page.printed)
    return pages.slice(Math.max(0, start), Math.max(0, start) + layout)
  }, [layout, pages, page.printed])

  return (
    <div className="mx-auto max-w-[1180px] px-2 pb-28 pt-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <button onClick={() => router.push(`/book/${page.book}/`)} className="text-neutral-500 hover:text-nw">← Kapitel</button>
        <span className="text-neutral-400">Netzwerk neu A1 · Kursbuch</span>
        <span className="text-neutral-400">S. {page.printed}</span>
      </div>

      {/* Werkzeugleiste: Zoom, Seitenlayout, Original */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[13px]">
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.25).toFixed(2)))} aria-label="Verkleinern" className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">−</button>
          <span className="w-11 text-center tabular-nums text-neutral-500">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Vergrößern" className="rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">+</button>
          <button onClick={() => setZoom(1)} className={`ml-1 rounded px-2 py-1 ${zoom === 1 ? 'bg-nw text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>Fit</button>
        </div>
        <div className="flex items-center gap-1">
          <span className="hidden text-neutral-400 sm:inline">Ansicht</span>
          {([1, 2, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => { setLayout(n); setZoom(1) }}
              aria-label={n === 1 ? 'Eine Seite' : n === 2 ? 'Zwei Seiten' : 'Vier Seiten'}
              className={`rounded px-2 py-1 ${layout === n ? 'bg-nw text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              <svg viewBox="0 0 20 16" className="h-4 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                {n === 1 && <rect x="4" y="1" width="12" height="14" rx="1" />}
                {n === 2 && (<><rect x="1" y="2" width="8" height="12" rx="1" /><rect x="11" y="2" width="8" height="12" rx="1" /></>)}
                {n === 4 && (<><rect x="1" y="1" width="8" height="6" rx="1" /><rect x="11" y="1" width="8" height="6" rx="1" /><rect x="1" y="9" width="8" height="6" rx="1" /><rect x="11" y="9" width="8" height="6" rx="1" /></>)}
              </svg>
            </button>
          ))}
          <a href={page.image} target="_blank" rel="noreferrer" className="ml-1 rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">Original ↗</a>
        </div>
      </div>

      {layout > 1 ? (
        <div className={`grid gap-2 ${layout === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2'}`}>
          {gridPages.map((n) => (
            <button
              key={n}
              onClick={() => { setLayout(1); if (n !== page.printed) go(n) }}
              className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pageSrc(n)} alt={`Seite ${n}`} className="w-full" />
              <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-xs text-neutral-600">{n}</span>
            </button>
          ))}
        </div>
      ) : (
      <div className="overflow-auto rounded-lg bg-[#f0eeec] p-1 paper" ref={wrap}>
        <div
          className={`relative mx-auto select-none bg-white ${shake ? 'shake' : ''} ${flip === 'none' ? 'fade-in' : ''}`}
          style={{ width: `${zoom * 100}%`, aspectRatio: `${W} / ${H}` }}
          onClick={() => setActiveWord(null)}
          onTouchStart={(e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY } }}
          onTouchEnd={(e) => {
            const start = touch.current
            touch.current = null
            if (!start || zoom !== 1) return
            const t = e.changedTouches[0]
            const dx = t.clientX - start.x
            const dy = t.clientY - start.y
            if (Math.abs(dx) < 70 || Math.abs(dy) > 60) return
            if (dx < 0) go(next)
            else go(prev)
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${page.image}?v=2`} alt={`Netzwerk neu A1, Seite ${page.printed}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />

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
              onClick={(e) => { e.stopPropagation(); setTab('word'); setActiveWord(activeWord === w.id ? null : w.id); playTap() }}
              className={`absolute rounded-sm transition ${activeWord === w.id ? 'bg-amber-200/60 ring-2 ring-amber-400' : 'hover:bg-amber-100/50'}`}
              style={boxStyle(w)}
              aria-label={`${w.text} — Bedeutung`}
            />
          ))}

          {word && (
            <div
              className="absolute z-30 rounded-lg bg-neutral-900/95 px-3 py-2 text-white shadow-xl"
              style={popupStyle(word)}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-1 flex items-center gap-1 text-[12px]">
                <button
                  onClick={() => setTab('word')}
                  className={`rounded px-2 py-0.5 ${tab === 'word' ? 'bg-white/20 font-semibold' : 'text-white/60'}`}
                >
                  كلمة
                </button>
                {showSentence && (
                  <button
                    onClick={() => setTab('sentence')}
                    className={`rounded px-2 py-0.5 ${tab === 'sentence' ? 'bg-white/20 font-semibold' : 'text-white/60'}`}
                  >
                    جملة
                  </button>
                )}
                <button onClick={() => setActiveWord(null)} aria-label="اقفل" className="ml-auto rounded px-1.5 text-white/60 hover:text-white">×</button>
              </div>
              <div className="text-[13px] font-semibold leading-snug">{popupText}</div>
              <div className="ar mt-1 text-[13px] leading-snug text-amber-200">{popupAr}</div>
              <button
                onClick={() => speak(popupText)}
                className={`mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold ${spoken === popupText ? 'bg-emerald-600' : 'bg-white/15 hover:bg-white/25'}`}
              >
                ♫ اسمع
              </button>
            </div>
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
      )}

      {playing && (
        <div className="paper fixed inset-x-0 bottom-14 z-20 mx-auto flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-2 text-sm shadow-lg">
          <span className="flex-1 truncate text-neutral-600">▶ {playing.replace('NWn_A1_KB_Audio_', 'Aufgabe ').replace('.mp3', '')}</span>
          <span className="tabular-nums text-xs text-neutral-400">{fmt(audio.current?.currentTime ?? 0)} / {fmt(duration)}</span>
          <button
            onClick={() => {
              const el = audio.current
              if (!el) return
              if (el.paused) void el.play().catch(() => {})
              else el.pause()
            }}
            aria-label="Pause"
            className="text-neutral-500 hover:text-nw"
          >Ⅱ</button>
          <button onClick={() => { audio.current?.pause(); queue.current = []; setPlaying(null); setProgress(0) }} aria-label="Stop" className="text-neutral-400 hover:text-nw">✕</button>
          <span className="absolute inset-x-4 bottom-1 h-0.5 overflow-hidden rounded bg-neutral-200">
            <span className="block h-full bg-nw transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        </div>
      )}
      <audio
        ref={audio}
        onEnded={onEnded}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          setProgress(el.duration ? el.currentTime / el.duration : 0)
          setDuration(Number.isFinite(el.duration) ? el.duration : 0)
        }}
        className="hidden"
      />
      <audio ref={pron} onEnded={() => setSpoken(null)} className="hidden" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-1">
            <button onClick={() => go(prev)} disabled={!prev} aria-label="Vorherige Seite" className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30">‹</button>
            <form
              onSubmit={(e) => { e.preventDefault(); const v = Number(new FormData(e.currentTarget).get('p')); if (pages.includes(v)) go(v) }}
              className="flex items-center gap-1 text-sm text-neutral-500"
            >
              <input name="p" defaultValue={page.printed} key={page.printed} className="w-12 rounded border border-neutral-300 px-1 py-1 text-center" aria-label="Seite" />
              <span>/ {pages[pages.length - 1]}</span>
            </form>
            <button onClick={() => go(next)} disabled={!next} aria-label="Nächste Seite" className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30">›</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Nach oben" className="ml-1 rounded-md px-2 py-2 text-sm text-neutral-400 hover:bg-neutral-100">▴</button>
          </div>

          <div className="flex items-center gap-2">
            {graded.length > 0 && (
              askClear ? (
                <>
                  <span className="text-xs text-neutral-500">Alles löschen?</span>
                  <button onClick={reset} className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700">Ja</button>
                  <button onClick={() => setAskClear(false)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600">Nein</button>
                </>
              ) : (
                <>
                  <button onClick={() => setAskClear(true)} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-nw hover:text-nw">Zurücksetzen</button>
                  <button onClick={check} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">✓ Prüfen</button>
                </>
              )
            )}
          </div>
        </div>
      </div>
      <span className="hidden">{total}</span>
    </div>
  )
}

const fmt = (s: number) => {
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${String(r).padStart(2, '0')}`
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
