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
  page, total, prev, next, pages, chapters, pageChapters,
}: {
  page: ScanPage
  total: number
  prev?: number
  next?: number
  pages: number[]
  chapters: { n: number; first: number }[]
  pageChapters: { printed: number; chapter: number }[]
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
  const [showWords, setShowWords] = useState(true)
  const [paused, setPaused] = useState(false)
  const [audioLabel, setAudioLabel] = useState<string | null>(null)
  const [sheetW, setSheetW] = useState(0)
  const [navOpen, setNavOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const currentPageRef = useRef<HTMLButtonElement | null>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const wrap = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (pagesOpen && currentPageRef.current) currentPageRef.current.scrollIntoView({ block: 'center' })
  }, [pagesOpen])

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

  const play = (src: string[], label?: string) => {
    queue.current = [...src]
    const first = queue.current.shift()
    if (!first) return
    setAudioLabel(label ?? null)
    setPaused(false)
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

  // Warm the next and previous page images once the current one is on screen,
  // so flipping a page does not wait for the download.
  useEffect(() => {
    const nbrs = [next, prev].filter((n) => n && n !== page.printed)
    if (nbrs.length === 0) return
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200)
    idle(() => {
      for (const n of nbrs) {
        const img = new Image()
        img.src = `/pages/${page.book}/${String(n).padStart(3, '0')}.webp`
      }
    })
  }, [page.printed, page.book, next, prev])

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
    <div className="pb-44">
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center gap-1 px-2 py-1.5">
          <button onClick={() => setNavOpen(true)} aria-label="Bibliothek" className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => router.push(`/book/${page.book}/`)} className="mr-1 shrink-0 text-[17px] font-extrabold tracking-tight text-neutral-900">
            Netzwerk<span className="text-nw">.</span>
          </button>
          <select
            value={page.chapter}
            onChange={(e) => { const c = chapters.find((x) => x.n === Number(e.target.value)); if (c) go(c.first) }}
            aria-label="Kapitel"
            className="shrink-0 rounded-md border border-neutral-300 bg-[#f7f3e8] px-1 py-1 text-[12px] font-medium text-neutral-700"
          >
            {chapters.map((c) => <option key={c.n} value={c.n}>A1 KB · K{c.n}</option>)}
          </select>
          <div className="ml-auto flex items-center gap-0.5 text-[13px]">
            <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.25).toFixed(2)))} aria-label="Verkleinern" className="rounded px-1.5 py-1 text-neutral-600">−</button>
            <span className="w-9 text-center tabular-nums text-neutral-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Vergrößern" className="rounded px-1.5 py-1 text-neutral-600">+</button>
            <button onClick={() => setZoom(1)} className={`ml-1 whitespace-nowrap rounded-md border px-2 py-1 ${zoom === 1 ? 'border-nw bg-nw text-white' : 'border-neutral-300 text-neutral-600'}`}>Fit</button>
            <a href={page.image} target="_blank" rel="noreferrer" className="ml-1 whitespace-nowrap rounded-md border border-neutral-300 px-2 py-1 text-neutral-600">Original ↗</a>
          </div>
        </div>
        <div className="mx-auto hidden max-w-[1180px] items-center gap-1 px-2 pb-1 sm:flex">
          <span className="text-[11px] text-neutral-400">Ansicht</span>
          {([1, 2, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => { setLayout(n); setZoom(1) }}
              aria-label={n === 1 ? 'Eine Seite' : n === 2 ? 'Zwei Seiten' : 'Vier Seiten'}
              className={`rounded px-2 py-0.5 ${layout === n ? 'bg-nw text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
            >
              <svg viewBox="0 0 20 16" className="h-3.5 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                {n === 1 && <rect x="4" y="1" width="12" height="14" rx="1" />}
                {n === 2 && (<><rect x="1" y="2" width="8" height="12" rx="1" /><rect x="11" y="2" width="8" height="12" rx="1" /></>)}
                {n === 4 && (<><rect x="1" y="1" width="8" height="6" rx="1" /><rect x="11" y="1" width="8" height="6" rx="1" /><rect x="1" y="9" width="8" height="6" rx="1" /><rect x="11" y="9" width="8" height="6" rx="1" /></>)}
              </svg>
            </button>
          ))}
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
              <img src={pageSrc(n)} alt={`Seite ${n}`} className="w-full" loading="lazy" decoding="async" />
              <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-xs text-neutral-600">{n}</span>
            </button>
          ))}
        </div>
      ) : (
      <div className="overflow-auto bg-[#f0eeec] paper" ref={wrap}>
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
          <picture>
            <source type="image/webp" srcSet={page.image.replace(/\.jpg$/, '.webp')} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={page.image}
              alt={`Netzwerk neu A1, Seite ${page.printed}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              width={page.width}
              height={page.height}
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />
          </picture>

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
          {showWords && page.words.map((w) => (
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

      <audio
        ref={audio}
        preload="none"
        onEnded={onEnded}
        onTimeUpdate={(e) => {
          const el = e.currentTarget
          setProgress(el.duration ? el.currentTime / el.duration : 0)
          setDuration(Number.isFinite(el.duration) ? el.duration : 0)
        }}
        className="hidden"
      />
      <audio ref={pron} preload="none" onEnded={() => setSpoken(null)} className="hidden" />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-[1180px] px-3 pt-2">
          <div className="flex items-center justify-between text-[12px] text-neutral-600">
            <span className="truncate">{audioLabel ?? page.audio[0]?.label ?? 'CD1 · Track —'}</span>
            <span className="shrink-0 tabular-nums text-neutral-400">
              {fmt(audio.current?.currentTime ?? 0)} / {duration ? fmt(duration) : '0:00'}
            </span>
          </div>
          <div className="flex items-center gap-3 pb-2 pt-1">
            <button
              onClick={() => {
                const el = audio.current
                if (!el || !playing) { const first = page.audio[0]; if (first) play(first.src, first.label); return }
                if (el.paused) { void el.play().catch(() => {}); setPaused(false) } else { el.pause(); setPaused(true) }
              }}
              aria-label={paused ? 'Abspielen' : 'Pause'}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-neutral-300 text-neutral-500"
            >
              {paused || !playing ? <span className="ml-0.5 block h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-neutral-500" /> : <span className="block h-3 w-3 bg-neutral-500" />}
            </button>
            <input
              type="range" min={0} max={1000} value={Math.round(progress * 1000)} aria-label="Fortschritt"
              onChange={(e) => { const el = audio.current; if (!el || !el.duration) return; el.currentTime = (Number(e.target.value) / 1000) * el.duration }}
              className="h-1.5 flex-1 accent-nw"
            />
          </div>
        </div>
        <div className="border-t border-neutral-200">
          <div className="mx-auto flex max-w-[1180px] items-center gap-1 px-2 py-1.5">
            <button onClick={() => router.push(`/book/${page.book}/`)} aria-label="Kapitel" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8.5" r="3.2" /><path d="M5.5 19c1.2-3.2 3.6-4.6 6.5-4.6s5.3 1.4 6.5 4.6" strokeLinecap="round" /></svg>
            </button>
            <button
              onClick={() => { const first = page.audio[0]; if (first) play(first.src, first.label) }}
              aria-label="Audio"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" /><path d="M15.5 9a4 4 0 0 1 0 6" strokeLinecap="round" /></svg>
            </button>
            <button onClick={() => go(prev)} disabled={!prev} aria-label="Vorherige Seite" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500 disabled:opacity-30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => setPagesOpen((v) => !v)}
              aria-label="Seite wählen"
              aria-expanded={pagesOpen}
              className="flex flex-1 items-center justify-center gap-1 rounded-md border border-neutral-300 py-1.5 text-[13px] text-neutral-700"
            >
              {page.printed}
              <span className={`text-[9px] text-neutral-400 transition-transform ${pagesOpen ? 'rotate-180' : ''}`}>▴</span>
            </button>
            <button onClick={() => go(next)} disabled={!next} aria-label="Nächste Seite" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500 disabled:opacity-30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={() => setShowWords((v) => !v)} aria-pressed={showWords}
              className={`h-9 shrink-0 rounded-md border px-2.5 text-[13px] ${showWords ? 'border-nw bg-nw text-white' : 'border-neutral-300 text-neutral-600'}`}>Word</button>
            <button onClick={() => setAskClear(true)} aria-label="Zurücksetzen" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10a8 8 0 1 1 2.3 6.3" strokeLinecap="round" /><path d="M4 5v5h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
      {navOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="Bibliothek">
          <div className="absolute inset-0 bg-black/30" onClick={() => setNavOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-[320px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
              <span className="text-[15px] font-bold text-neutral-900">Bibliothek</span>
              <button onClick={() => setNavOpen(false)} aria-label="Schließen" className="grid h-8 w-8 place-items-center rounded-md text-lg text-neutral-500">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <button onClick={() => router.push(`/book/${page.book}/`)} className="mb-3 w-full rounded-md border border-neutral-300 px-2 py-2 text-left text-[13px] text-neutral-700">
                Buchseite · {page.book.toUpperCase()}
              </button>
              {chapters.map((c) => {
                const list = pageChapters.filter((x) => x.chapter === c.n).map((x) => x.printed)
                if (list.length === 0) return null
                return (
                  <div key={c.n} className="mb-3">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Kapitel {c.n}</div>
                    <div className="grid grid-cols-5 gap-1">
                      {list.map((n) => (
                        <button
                          key={n}
                          onClick={() => { setNavOpen(false); if (n !== page.printed) go(n) }}
                          className={`rounded-md border py-1.5 text-[12px] ${n === page.printed ? 'border-nw bg-nw text-white' : 'border-neutral-200 text-neutral-600'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {pagesOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="Seite wählen">
          <div className="absolute inset-0 bg-black/20" onClick={() => setPagesOpen(false)} />
          <div className="absolute inset-x-0 bottom-[120px] mx-auto max-h-[55vh] w-[94%] max-w-[560px] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-neutral-700">Seite wählen</span>
              <button onClick={() => setPagesOpen(false)} aria-label="Schließen" className="text-lg text-neutral-500">×</button>
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {pages.map((n) => (
                <button
                  key={n}
                  ref={n === page.printed ? currentPageRef : undefined}
                  onClick={() => { setPagesOpen(false); if (n !== page.printed) go(n) }}
                  className={`rounded-md border py-2 text-[13px] ${n === page.printed ? 'border-nw bg-nw text-white' : 'border-neutral-200 text-neutral-600'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
