'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ScanPage } from '@/content/scan/types'
import { audioUrl, seekableSrc } from '@/lib/audio'
import { playCorrect, playWrong, playTap, soundState, setSound, setFeedback } from '@/lib/sound'
import { pronounceUrl } from '@/lib/pronounce'

type LibBook = {
  id: string
  level: string
  kind: string
  cover: string | null
  chapters: { n: number | string; first: number; last: number; title: string }[]
}

const norm = (s: string) =>
  s.normalize('NFC').toLowerCase().trim().replace(/[.!?]+$/, '').replace(/\s+/g, ' ')

const pct = (v: number, total: number) => `${(v / total) * 100}%`

type Answers = Record<string, string>
type Results = Record<string, boolean>

export default function ScanReader({
  page, total, prev, next, pages, chapters, pageChapters, library,
}: {
  page: ScanPage
  total: number
  prev?: number
  next?: number
  pages: number[]
  chapters: { n: number | string; first: number }[]
  pageChapters: { printed: number; chapter: number | string }[]
  library: LibBook[]
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<Results>({})
  /** one line of plain feedback under the page */
  const [msg, setMsg] = useState<{ text: string; ar: string; ok: boolean } | null>(null)
  /** per exercise: how many answers were right, shown next to its check button */
  const [scores, setScores] = useState<Record<string, { ok: number; answered: number; open: number }>>({})
  const [activeWord, setActiveWord] = useState<string | null>(null)
  const [tab, setTab] = useState<'word' | 'sentence'>('word')
  const [zoom, setZoom] = useState(1)
  const [layout, setLayout] = useState<1 | 2 | 4>(1)
  const [flip, setFlip] = useState<'none' | 'next' | 'prev'>(() => {
    if (typeof window === 'undefined') return 'none'
    try {
      const d = sessionStorage.getItem('nw-flip')
      if (d === 'next' || d === 'prev') { sessionStorage.removeItem('nw-flip'); return d }
    } catch {}
    return 'none'
  })
  const [under, setUnder] = useState<{ image: string; printed: number } | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const d = sessionStorage.getItem('nw-under')
      if (d) { sessionStorage.removeItem('nw-under'); const [img, pr] = d.split('|'); return { image: img, printed: Number(pr) } }
    } catch {}
    return null
  })
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
  const [chapterMenu, setChapterMenu] = useState(false)
  const [gloss, setGloss] = useState<Record<string, string> | null>(null)
  const [wordHit, setWordHit] = useState<{ text: string; ar: string } | null>(null)
  // per-popup sentence fallback: shows the box's sentence view without flipping
  // the user's global كلمة/جملة mode (setTab would poison every later tap)
  const [forceSent, setForceSent] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sound, setSoundOn] = useState(true)
  const [fb, setFb] = useState(true)
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
    setMsg(null)
    setScores({})
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
      void seekableSrc(audioUrl(first, audioBase)).then((src) => {
        if (audio.current !== el) return
        el.src = src
        void el.play().catch(() => {})
      })
    })
  }

  const onEnded = () => {
    const nxt = queue.current.shift()
    if (nxt && audio.current) {
      setPlaying(nxt)
      const el = audio.current
      void seekableSrc(audioUrl(nxt, audioBase)).then((src) => {
        if (audio.current !== el) return
        el.src = src
        void el.play().catch(() => {})
      })
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

  /** grade one set of fields and matchings: the same rules for the whole page and for a single exercise */
  const grade = (fields: typeof page.fields, matchings: typeof page.matchings) => {
    const res: Results = {}
    let ok = 0
    let answered = 0
    let open = 0
    // richtig/falsch toggles come in pairs and the key marks the box that has to
    // be ticked, so the pair is graded as one answer, not each box on its own
    const pairs = new Map<string, typeof page.fields>()
    for (const f of fields) {
      if (f.kind !== 'check') continue
      const key = (f.label || f.id).replace(/\s*(richtig|falsch)\s*$/i, '')
      pairs.set(key, [...(pairs.get(key) ?? []), f])
    }
    for (const members of pairs.values()) {
      const keyed = members.find((m) => m.answer === 'x')
      const ticked = members.filter((m) => (answers[m.id] || '') === 'x')
      if (ticked.length === 0) { open++; continue }
      if (keyed && ticked.length === 1 && ticked[0].id === keyed.id) {
        res[keyed.id] = true
        ok++
        answered++
      } else {
        for (const t of ticked) res[t.id] = false
        answered++
      }
    }
    for (const f of fields) {
      if (f.kind === 'check') continue
      if (!f.answer) continue
      const given = answers[f.id] || ''
      if (!given) { open++; continue }
      // a key like "2, 7, 9, 11" is a set: order, spacing and separators do not matter
      const asSet = (v: string) => v.split(/[,;/\s-]+/).filter(Boolean).map((x) => x.toLowerCase()).sort().join(',')
      const good = f.answer.split('|').some((a) => (a.includes(',') ? asSet(a) === asSet(given) : norm(a) === norm(given)))
      res[f.id] = good
      answered++
      if (good) ok++
    }
    for (const m of matchings) {
      m.left.forEach((_, i) => {
        const given = answers[`${m.id}-${i}`] || ''
        if (!given) { open++; return }
        const good = given === m.answers[i]
        res[`${m.id}-${i}`] = good
        answered++
        if (good) ok++
      })
    }
    return { res, ok, answered, open }
  }

  /** 3 -> ٣, so the Arabic half of a message reads naturally */
  const arNum = (n: number) => String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])

  const checkGroup = (key: string, fields: typeof page.fields, matchings: typeof page.matchings) => {
    const { res, ok, answered, open } = grade(fields, matchings)
    setResults((prev) => ({ ...prev, ...res }))
    setScores((prev) => ({ ...prev, [key]: { ok, answered, open } }))
    if (answered === 0) {
      setMsg({ text: 'Noch nichts eingetragen', ar: 'لسه مكتبتش حاجة', ok: false })
      return
    }
    const good = ok === answered
    setMsg({ text: `${ok} von ${answered} richtig`, ar: `${arNum(ok)} من ${arNum(answered)} صح`, ok: good })
    if (good) playCorrect()
    else playWrong()
  }

  const reset = () => {
    setAnswers({})
    setResults({})
    setMsg(null)
    setAskClear(false)
    playTap()
  }

  // the small German-Arabic glossary built from the books, loaded on first word tap
  const glossReq = useRef<Promise<Record<string, string>> | null>(null)
  const ensureGloss = () => {
    if (gloss) return Promise.resolve(gloss)
    try {
      const cached = localStorage.getItem('nw-gloss-v20')
      if (cached) { const g = JSON.parse(cached); setGloss(g); return Promise.resolve(g) }
    } catch {}
    if (!glossReq.current) {
      glossReq.current = fetch('/glossary.json').then((r) => r.json()).then((g) => {
        setGloss(g)
        try { localStorage.setItem('nw-gloss-v20', JSON.stringify(g)) } catch {}
        return g as Record<string, string>
      }).catch(() => ({}))
    }
    return glossReq.current
  }

  const bareKey = (tok: string) => tok.toLowerCase().replace(/[^a-zäöüß0-9-]/g, '')
  /** exact glossary entry for a tapped token, tolerating a leading article */
  const glossExact = (g: Record<string, string> | null, tok: string) => {
    if (!g) return null
    const bare = bareKey(tok)
    const noArt = bare.replace(/^(der|die|das)/, '')
    for (const k of [bare, noArt]) if (k && g[k]) return g[k]
    return null
  }
  /** last resort: the token minus a plural/verb ending */
  const glossStem = (g: Record<string, string> | null, tok: string) => {
    if (!g) return null
    const bare = bareKey(tok)
    const noArt = bare.replace(/^(der|die|das)/, '')
    for (const k of [bare, noArt].map((k) => k.replace(/(en|er|es|e|s|n)$/, ''))) if (k && g[k]) return g[k]
    return null
  }

  /** pronounce a tapped word: the book's own word audio first, then German TTS */
  const speakWord = (text: string, boxText: string) => {
    if (!sound) return
    const slug = (w: string) => w.toLowerCase().replace(/[^a-zäöüß0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const urls = [audioUrl(`/audio/de/${slug(text)}.mp3`), audioUrl(`/audio/de/${slug(boxText)}.mp3`)]
    const say = () => {
      try {
        const u = new SpeechSynthesisUtterance(text.replace(/[^A-Za-zÄÖÜäöüßß -]/g, ''))
        u.lang = 'de-DE'; u.rate = 0.9
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(u)
      } catch {}
    }
    const tryAt = (i: number) => {
      if (i >= urls.length) return say()
      const a = new Audio(urls[i])
      a.play().catch(() => tryAt(i + 1))
    }
    tryAt(0)
  }

  /** which word of a line box a tap landed on, proportional to character count */
  const tokenAt = (text: string, frac: number) => {
    const tokens = text.split(/\s+/).filter(Boolean)
    if (tokens.length < 2) return null
    const weights = tokens.map((t) => t.length + 1)
    const total = weights.reduce((a, b) => a + b, 0)
    let acc = 0
    for (let i = 0; i < tokens.length; i++) {
      acc += weights[i]
      if (frac <= acc / total) return { tok: tokens[i], idx: i, tokens }
    }
    const last = tokens.length - 1
    return { tok: tokens[last], idx: last, tokens }
  }

  useEffect(() => {
    const st = soundState()
    setSoundOn(st.master)
    setFb(st.feedback)
  }, [])

  // Clear the turn class once the animation has played.
  useEffect(() => {
    if (flip === 'none') return
    const t = window.setTimeout(() => { setFlip('none'); setUnder(null) }, 700)
    return () => window.clearTimeout(t)
  }, [flip])

  const go = (target?: number) => {
    if (!target) return
    const dir = target > page.printed ? 'next' : 'prev'
    setUnder({ image: page.image, printed: page.printed })
    try { sessionStorage.setItem('nw-under', `${page.image}|${page.printed}`) } catch {}
    try { sessionStorage.setItem('nw-flip', dir) } catch {}
    router.push(`/read/${page.book}/${target}/`)
  }

  // Warm the next and previous page images once the current one is on screen,
  // so flipping a page does not wait for the download.
  useEffect(() => {
    const nbrs = [next, next ? next + 1 : null, prev].filter((n) => n && n !== page.printed)
    if (nbrs.length === 0) return
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window ? (window as any).requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 1200)
    idle(() => {
      for (const n of nbrs) {
        const small = new Image()
        small.src = `/pages/${page.book}/${String(n).padStart(3, '0')}-900.webp`
        small.decode?.().then(() => {
          const full = new Image()
          full.src = `/pages/${page.book}/${String(n).padStart(3, '0')}.webp`
        }).catch(() => {})
      }
    })
  }, [page.printed, page.book, next, prev])

  // book audio lives under /audio/<level>/kb/ for every Kursbuch (a1-kb -> a1)
  const level = (page.book.split('-')[0] || 'a1').toUpperCase()
  // Plattform pages carry a half chapter (6.5 = Plattform 2, 9.5 = Plattform 3)
  const chapterLabel = (n: number | string) => {
    if (typeof n === 'string' && /^P\d$/.test(n)) return `PT${n.slice(1)}`
    const plat: Record<string, string> = { 'a2-kb:6.5': 'Plattform 2', 'a2-kb:9.5': 'Plattform 3', 'a2-kb:12.5': 'Plattform 4', 'a2-kb:13': 'Anhang', 'a1-kb:0': 'Umschlag & Inhalt', 'a1-kb:13': 'Anhang', 'a2-kb:3.5': 'Plattform 1', 'a2-ab:0': 'Titel & Inhalt' }
    return plat[`${page.book}:${n}`] ?? `K${n}`
  }
  const audioBase = `/audio/${level.toLowerCase()}/kb`
  // spots whose track file is not deployed yet stay in the data but render no button
  const audioSpots = page.audio.filter((a) => !a.disabled)

  /** one check button per exercise, positioned at that exercise's first field */
  const exerciseGroups = useMemo(() => {
    const map = new Map<string, { key: string; fields: typeof page.fields; matchings: typeof page.matchings; x: number; y: number }>()
    const touch = (key: string, box: { x: number; y: number }) => {
      const g = map.get(key)
      if (!g) map.set(key, { key, fields: [], matchings: [], x: box.x, y: box.y })
      else { g.x = Math.min(g.x, box.x); g.y = Math.min(g.y, box.y) }
      return map.get(key)!
    }
    for (const f of page.fields) touch(f.group || f.id, f).fields.push(f)
    for (const m of page.matchings) touch(m.group || m.id, m.left[0] ?? { x: 0, y: 0 }).matchings.push(m)
    return [...map.values()]
  }, [page])

  const W = page.width
  const H = page.height
  // phone-sized webp variant (900px wide) next to the full-size scan
  const webBase = page.image.replace(/\.jpg$/, '')
  const boxStyle = (b: { x: number; y: number; w: number; h: number }) => ({
    left: pct(b.x, W), top: pct(b.y, H), width: pct(b.w, W), height: pct(b.h, H),
  })

  const word = page.words.find((w) => w.id === activeWord)
  const boxWordCount = word ? word.text.trim().split(/\s+/).length : 0
  const sentence = word
    ? (page.sentences ?? []).find((s) => (s.words ?? []).includes(word.id)) ??
      (page.sentences ?? []).find((s) => s.text.includes(word.text)) ??
      // a line box whose ar is a sentence translation is itself the sentence view:
      // the tap falls back here, never into the word popup (reviewer rule).
      // That is any box longer than two words with a real ar, whatever its length,
      // and any box whose ar runs past ~25 chars (K4 reviewer: short sentence
      // translations like "متآسف" must not surface as word glosses either)
      (word.ar && !/^[ـ\-—–\s]+$/.test(word.ar.trim()) && word.ar.trim().toLowerCase() !== word.text.trim().toLowerCase() && (word.ar.trim().length > 25 || boxWordCount > 2)
        ? { id: `box-${word.id}`, text: word.text, ar: word.ar, words: [word.id] }
        : undefined)
    : undefined
  const showSentence = Boolean(sentence)
  /** a box whose text is a whole sentence (Redemittel block) is a sentence, not a word */
  const boxIsSentence = Boolean(sentence && word && norm(sentence.text) === norm(word.text))
  const effectiveTab: 'word' | 'sentence' =
    forceSent && sentence ? 'sentence' : tab === 'sentence' && !sentence ? 'word' : tab === 'word' && !wordHit && sentence ? 'sentence' : tab
  const popupText = effectiveTab === 'sentence' && sentence
    ? sentence.text
    : (wordHit?.text ?? word?.text ?? '')
  // the word tab shows word-level glosses only; a sentence-length box ar is
  // never a word gloss (it belongs to the sentence tab)
  const popupAr = effectiveTab === 'sentence' && sentence
    ? sentence.ar
    : (wordHit?.ar ?? (word && word.ar.trim().length <= 25 && boxWordCount <= 2 ? word.ar : '') ?? '')

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
    <div className="overflow-x-hidden pb-44">
      <div className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center gap-2 px-3 py-2">
          <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => setNavOpen(true)} aria-label="المكتبة" className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-600">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => router.push(`/book/${page.book}/`)} className="flex shrink-0 items-baseline gap-1 text-[15px] font-extrabold tracking-tight text-neutral-900">
            Netzwerk<span aria-hidden className="inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-nw" />
          </button>
          </div>
          <div className="relative min-w-0 flex-1">
            <button
              onClick={() => setChapterMenu((v) => !v)}
              aria-label="اختيار الفصل"
              aria-expanded={chapterMenu}
              className="flex w-full items-center justify-between gap-1.5 rounded-md border border-neutral-300 bg-[#f7f3e8] px-2.5 py-1.5 text-[12px] font-medium text-neutral-700"
            >
              <span className="truncate">{(library.find((b) => b.id === page.book)?.kind ?? 'Kursbuch')} · {chapterLabel(page.part ?? page.chapter)}</span>
              <span className={`shrink-0 text-[9px] text-neutral-400 transition-transform ${chapterMenu ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {chapterMenu && (
              <div className="absolute left-0 top-full z-40 mt-1 max-h-[60vh] w-44 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl">
                {chapters.map((c) => (
                  <button
                    key={c.n}
                    onClick={() => { setChapterMenu(false); go(c.first) }}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] ${String(c.n) === String(page.part ?? page.chapter) ? 'bg-nw/10 font-semibold text-nw' : 'text-neutral-700'}`}
                  >
                    <span>{chapterLabel(c.n)}</span>
                    <span className="text-[11px] text-neutral-400">{c.first}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex shrink-0 items-center">
            <a href={page.image} target="_blank" rel="noreferrer" aria-label="Original" className="whitespace-nowrap rounded-md border border-neutral-300 px-2 py-1.5 text-[12px] text-neutral-600">
              الأصل ↗
            </a>
          </div>
        </div>
        <div className="mx-auto hidden max-w-[1180px] items-center gap-1 px-2 pb-1 sm:flex">
          <span className="text-[11px] text-neutral-400">عرض</span>
          {([1, 2, 4] as const).map((n) => (
            <button
              key={n}
              onClick={() => { setLayout(n); setZoom(1) }}
              aria-label={n === 1 ? 'صفحة واحدة' : n === 2 ? 'صفحتان' : 'أربع صفحات'}
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
          className={`relative mx-auto select-none overflow-hidden bg-white ${shake ? 'shake' : ''} ${flip === 'next' ? 'turn-next' : flip === 'prev' ? 'turn-prev' : 'fade-in'}`}
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
          {under && under.printed !== page.printed && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={under.image} alt="" aria-hidden className="turn-under pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${webBase}-tiny.webp`} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-cover blur-[2px] scale-[1.02] opacity-90" draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
              src={zoom > 1 ? `${webBase}.webp` : `${webBase}-900.webp`}
              alt={`Netzwerk neu ${page.book.split('-')[0].toUpperCase()}, Seite ${page.printed}`}
              className="pointer-events-none absolute inset-0 h-full w-full"
              width={page.width}
              height={page.height}
              decoding="async"
              fetchPriority="high"
              draggable={false}
            />

          {/* one check per exercise, in the right margin beside its first field */}
          {exerciseGroups.map((g) => {
            const sc = scores[g.key]
            const done = sc && sc.answered > 0
            const good = done && sc.ok === sc.answered
            return (
              <button
                key={'chk-' + g.key}
                onClick={(e) => { e.stopPropagation(); checkGroup(g.key, g.fields, g.matchings) }}
                aria-label={`Aufgabe ${g.key} prüfen`}
                className={`absolute z-20 grid place-items-center rounded-full border-2 ${done ? (good ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-nw bg-nw text-white') : 'border-nw bg-white/95 text-nw'}`}
                style={{ left: pct(W - 72, W), top: pct(g.y - 6, H), width: pct(64, W), height: pct(64, W) }}
              >
                <svg viewBox="0 0 24 24" className="h-[64%] w-[64%]" fill="none" stroke="currentColor" strokeWidth="3.4"><path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            )
          })}
          {exerciseGroups.map((g) => {
            const sc = scores[g.key]
            if (!sc || sc.answered === 0) return null
            const good = sc.ok === sc.answered
            return (
              <span
                key={'sc-' + g.key}
                className={`pointer-events-none absolute z-20 rounded px-1 font-bold ${good ? 'bg-emerald-600 text-white' : 'bg-nw text-white'}`}
                style={{ left: pct(W - 140, W), top: pct(g.y + 12, H), fontSize: pct(30, W), lineHeight: 1.1 }}
              >
                {sc.ok}/{sc.answered}
              </span>
            )
          })}

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
              onClick={(e) => {
                e.stopPropagation()
                // boxes holding only separators (a bare hyphen, pipe, dashes) open nothing in any mode
                if (!/[a-zäöüßA-ZÄÖÜ0-9]/.test(w.text)) { setWordHit(null); return }
                if (tab !== 'word') {
                  setWordHit(null)
                  if (activeWord === w.id) setForceSent(false)
                  setActiveWord(activeWord === w.id ? null : w.id)
                  playTap()
                  return
                }
                const rect = e.currentTarget.getBoundingClientRect()
                const frac = rect.width ? (e.clientX - rect.left) / rect.width : 0.5
                const res = tokenAt(w.text, frac)
                // an article in front of a noun is not a tap target: use the noun after it
                let tok = res?.tok ?? w.text
                // taps on separator tokens (|, /, dashes, bullets) open nothing
                if (res && !/[a-zäöüßA-ZÄÖÜ0-9]/.test(res.tok)) { setWordHit(null); return }
                // a suffix token of a noun entry ("Festspiel, das, -e") opens no popup at all
                if (res && /^[-–—]/.test(res.tok)) { setWordHit(null); return }
                if (res && /^(der|die|das)$/i.test(res.tok) && res.idx < res.tokens.length - 1) tok = res.tokens[res.idx + 1]
                speakWord(tok, w.text)
                const hasSentence = (page.sentences ?? []).some((s) => (s.words ?? []).includes(w.id) || s.text.includes(w.text))
                const open = (gg: Record<string, string> | null) => {
                  // the clicked word's own entry first, then the box meaning, then a stemmed guess
                  const boxAr = w.ar && !/^[ـ\-—–\s]+$/.test(w.ar.trim()) && w.ar.trim().toLowerCase() !== w.text.trim().toLowerCase() ? w.ar.trim() : ''
                  // the box meaning counts as a word gloss only when it is short
                  // (about 25 chars or less); longer ones are sentence translations
                  // ...and only from a short box (one or two words); a longer
                  // box's ar is a sentence translation, never a word gloss
                  const shortBox = boxAr && boxAr.length <= 25 && w.text.trim().split(/\s+/).length <= 2 ? boxAr : ''
                  // a list marker like "6." maps to the number itself, never to a word gloss.
                  // Track numbers ("1.33") and phone fragments ("0551-893") are not list
                  // markers: inside a box with a composite number they open nothing
                  // (reviewer: numbers show as written or not at all).
                  // Parenthesized optional words like "(Es)" are no word tap target either.
                  const bareTok = bareKey(tok)
                  const compositeNum = /[0-9][.,–—-][0-9]/.test(w.text)
                  // suffix tokens of noun entries ("Festspiel, das, -e") open nothing
                  const suffixTok = /^[-–—]/.test(tok)
                  // a separable prefix sitting alone at the end of a box
                  // ("ein|laden ... ein") is part of the verb, no word gloss
                  const sepPrefix = !!res && res.tokens.length > 1 && res.idx === res.tokens.length - 1 && /^(ein|an|auf|aus|mit|zu|vor|zurück|weg|daher|her)$/i.test(bareTok)
                  // "ist" as a perfect-tense auxiliary ("ist gefahren") is not هو / ده
                  const istAux = bareTok === 'ist' && !!res && !!res.tokens[res.idx + 1] && /^ge/i.test(bareKey(res.tokens[res.idx + 1]))
                  const isPrefix = /^(ein|an|auf|aus|mit|zu|vor|zurück|weg|daher|her)$/i.test(bareTok)
                  // a separable prefix inside a conjugation list ("ein|laden, er lädt ein, hat eingeladen")
                  // gets the verb's gloss from the piped headword, else no word gloss
                  const listVerb = isPrefix && /[|｜]/.test(w.text) ? (w.text.split(/\s+/).find((t) => /[|｜]/.test(t)) || '').replace(/[^a-zäöüßA-ZÄÖÜ]/g, '') : ''
                  const skipWord = /^[([]/.test(tok) || suffixTok || sepPrefix || istAux || (/[0-9]/.test(tok) && (!/^[0-9]+[.,]?$/.test(tok) || compositeNum))
                  const arRaw = skipWord
                    ? ''
                    : /^[0-9]+[.,]?$/.test(tok)
                    ? arNum(Number(tok.replace(/[^0-9]/g, '')))
                    : listVerb
                    ? glossExact(gg, listVerb) || glossStem(gg, listVerb) || ''
                    : glossExact(gg, tok) || glossStem(gg, tok) || shortBox || ''
                  // "es" alone is هو / ده; only "es gibt" means فيه
                  const arCtx = !skipWord && bareTok === 'es' ? (/es gibt|gibt es/i.test(w.text) ? 'فيه' : 'هو / ده') : arRaw
                  // stray list separators from the scan never leak into a gloss
                  const ar = arCtx.replace(/^[\s|｜]+/, '').replace(/[\s|｜]+$/, '')
                  if (!ar) {
                    // no word-level gloss: open the box as a labeled sentence, never the word popup
                    setWordHit(null)
                    if (boxAr || hasSentence) { setForceSent(true); return true } // labeled sentence view, global mode untouched
                    return false // no gloss and no sentence: show nothing
                  }
                  setWordHit({ text: tok, ar })
                  setForceSent(false)
                  return true
                }
                const toggle = () => setActiveWord((prev) => (prev === w.id ? null : w.id))
                if (activeWord === w.id) setForceSent(false) // this tap closes the popup
                if (gloss) { if (open(gloss)) toggle() }
                else ensureGloss().then((gg) => { if (open(gg)) toggle() })
                playTap()
              }}
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
                {wordHit && (
                  <button
                    onClick={() => setTab('word')}
                    className={`rounded px-2 py-0.5 ${effectiveTab === 'word' ? 'bg-white/20 font-semibold' : 'text-white/60'}`}
                  >
                    كلمة
                  </button>
                )}
                {showSentence && (
                  <button
                    onClick={() => setTab('sentence')}
                    className={`rounded px-2 py-0.5 ${effectiveTab === 'sentence' ? 'bg-white/20 font-semibold' : 'text-white/60'}`}
                  >
                    جملة
                  </button>
                )}
                <button onClick={() => { setActiveWord(null); setForceSent(false) }} aria-label="اقفل" className="ml-auto rounded px-1.5 text-white/60 hover:text-white">×</button>
              </div>
              <div className="text-[13px] font-semibold leading-snug">{popupText}</div>
              <div className="ar mt-1 text-[13px] leading-snug text-amber-200">{popupAr || '—'}</div>
              <button
                onClick={() => speak(popupText)}
                aria-label="اسمع"
                title="اسمع"
                className={`mt-2 grid h-9 w-9 place-items-center rounded-full ${spoken === popupText ? 'bg-emerald-600 text-white' : 'bg-white/15 text-white hover:bg-white/25'}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
                  <path d="M15.5 9a4 4 0 0 1 0 6" strokeLinecap="round" />
                  <path d="M18 6.5a7.5 7.5 0 0 1 0 11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {audioSpots.map((a) => (
            <button
              key={a.id}
              onClick={(e) => { e.stopPropagation(); play(a.src) }}
              className={`absolute flex items-center justify-center rounded-full text-[11px] font-bold text-white transition ${playing ? 'bg-emerald-600' : 'bg-nw hover:bg-nw-dark'}`}
              style={boxStyle(a)}
              title={a.label}
              aria-label={a.label}
            >
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>
            </button>
          ))}

          {page.fields.map((f) => {
            const status = results[f.id]
            if (f.kind === 'check') {
              const on = (answers[f.id] || '') === 'x'
              return (
                <button
                  key={f.id}
                  onClick={(e) => { e.stopPropagation(); save(f.id, on ? '' : 'x') }}
                  aria-label={f.label || f.id}
                  aria-pressed={on}
                  className={`absolute grid place-items-center rounded-sm border-2 ${
                    status === undefined
                      ? 'border-neutral-400 bg-white/70'
                      : status
                        ? 'border-emerald-600 bg-emerald-100 text-emerald-700'
                        : 'border-rose-600 bg-rose-100 text-rose-700'
                  }`}
                  style={boxStyle(f)}
                >
                  {on && <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </button>
              )
            }
            if (f.kind === 'select' && f.options?.length) {
              return (
                <select
                  key={f.id}
                  value={answers[f.id] || ''}
                  onChange={(e) => save(f.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={f.label || f.id}
                  className={`absolute rounded-sm bg-white/90 px-0.5 text-center text-[clamp(9px,1.35vw,17px)] outline-none focus:z-20 ${
                    status === undefined
                      ? 'border-b-2 border-dashed border-nw/60'
                      : status
                        ? 'border-b-2 border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-b-2 border-rose-600 bg-rose-50 text-rose-800'
                  }`}
                  style={{ ...boxStyle(f), minHeight: 22 }}
                >
                  <option value="">—</option>
                  {f.options.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              )
            }
            return (
              <input
                key={f.id}
                value={answers[f.id] || ''}
                onChange={(e) => save(f.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                aria-label={f.label || f.id}
                autoComplete="off"
                spellCheck={false}
                className={`absolute rounded-sm bg-white/85 px-1 text-center text-[clamp(9px,1.35vw,17px)] outline-none transition focus:z-20 focus:min-w-[7.5rem] focus:bg-white ${
                  status === undefined
                    ? 'border-b-2 border-dashed border-nw/60 focus:border-nw focus:bg-white'
                    : status
                      ? 'border-b-2 border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-b-2 border-rose-600 bg-rose-50 text-rose-800'
                }`}
                style={{ ...boxStyle(f), minHeight: 22 }}
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
        {msg && (
          <div className={`flex items-center justify-center gap-1.5 border-b px-3 py-1.5 text-[12px] font-semibold ${msg.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-nw/20 bg-nw-soft text-nw-dark'}`}>
            {msg.ok ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4.5 12.5l5 5 10-11" strokeLinecap="round" strokeLinejoin="round" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.6"><circle cx="12" cy="12" r="9" /><path d="M12 7.5v6" strokeLinecap="round" /><path d="M12 16.5h.01" strokeLinecap="round" /></svg>
            )}
            <span>{msg.text}</span>
            <span className="ar text-[12px] opacity-80">{msg.ar}</span>
          </div>
        )}
        <div className={`mx-auto max-w-[1180px] px-3 pt-2 ${audioSpots.length ? '' : 'hidden'}`}>
          <div className="flex items-center justify-between text-[12px] text-neutral-600">
            <span className="truncate">{audioLabel ?? audioSpots[0]?.label ?? 'CD1 · Track —'}</span>
            <span className="shrink-0 tabular-nums text-neutral-400">
              {fmt(audio.current?.currentTime ?? 0)} / {duration ? fmt(duration) : '0:00'}
            </span>
          </div>
          <div className="flex items-center gap-3 pb-2 pt-1">
            <button
              onClick={() => {
                const el = audio.current
                if (!el || !playing) { const first = audioSpots[0]; if (first) play(first.src, first.label); return }
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
          <div className="mx-auto flex max-w-[1180px] flex-nowrap items-center justify-between gap-1 px-1.5 py-1.5 sm:px-2">
            <button onClick={() => setProfileOpen(true)} aria-label="Profil" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-300 text-neutral-500 sm:h-10 sm:w-10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8.5" r="3.2" /><path d="M5.5 19c1.2-3.2 3.6-4.6 6.5-4.6s5.3 1.4 6.5 4.6" strokeLinecap="round" /></svg>
            </button>
            <button
              onClick={() => { const on = !sound; setSound(on); setSoundOn(on) }}
              aria-label={sound ? 'Ton aus' : 'Ton an'}
              aria-pressed={sound}
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border ${sound ? 'border-nw text-nw' : 'border-neutral-300 text-neutral-400'}`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" strokeLinejoin="round" />
                {sound ? <><path d="M15.5 9a4 4 0 0 1 0 6" strokeLinecap="round" /><path d="M18 6.5a7.5 7.5 0 0 1 0 11" strokeLinecap="round" /></> : <path d="M16 9l5 6M21 9l-5 6" strokeLinecap="round" />}
              </svg>
            </button>
            <button onClick={() => go(prev)} disabled={!prev} aria-label="Vorherige Seite" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500 disabled:opacity-30">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button
              onClick={() => setPagesOpen((v) => !v)}
              aria-label="اختيار الصفحة"
              aria-expanded={pagesOpen}
              className="flex w-[3.25rem] shrink-0 items-center justify-center gap-0.5 rounded-md border border-neutral-300 py-1.5 text-[12.5px] text-neutral-700 sm:w-[3.75rem] sm:text-[13px]"
            >
              {page.printed}
              <span className={`text-[9px] text-neutral-400 transition-transform ${pagesOpen ? 'rotate-180' : ''}`}>▴</span>
            </button>
            <button onClick={() => go(next)} disabled={!next} aria-label="الصفحة التالية" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500 disabled:opacity-30 sm:h-10 sm:w-10">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button onClick={() => { setShowWords(true); setTab(tab === 'word' ? 'sentence' : 'word'); setActiveWord(null) }}
              aria-pressed={tab === 'sentence'} aria-label={tab === 'word' ? 'وضع الكلمة، اضغط للجملة' : 'وضع الجملة، اضغط للكلمة'}
              className={`h-9 min-w-0 flex-1 rounded-md border text-[13px] font-semibold ${tab === 'word' ? 'border-nw bg-nw text-white' : 'border-neutral-300 bg-white text-neutral-700'}`}>{tab === 'word' ? 'كلمة' : 'جملة'}</button>
            <button onClick={() => { setAnswers({}); setResults({}); setAskClear(false) }} aria-label="Zurücksetzen" className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-neutral-300 text-neutral-500">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 10a8 8 0 1 1 2.3 6.3" strokeLinecap="round" /><path d="M4 5v5h5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>
      {navOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="المكتبة">
          <div className="absolute inset-0 bg-black/30" onClick={() => setNavOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[86%] max-w-[320px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="text-[19px] font-black tracking-tight text-neutral-900">Netzwerk<span className="text-nw">.</span></span>
              <button onClick={() => setNavOpen(false)} aria-label="Schließen" className="grid h-9 w-9 place-items-center rounded-full border border-neutral-300 text-lg text-neutral-600">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="mb-2 text-[12px] font-semibold text-neutral-400">اختيار كتابك</div>
              <div className="grid grid-cols-2 gap-2">
                {library.map((b) => {
                  const active = b.id === page.book
                  return (
                    <button
                      key={b.id}
                      onClick={() => { const first = b.chapters[0]?.first; if (first && !active) { setNavOpen(false); router.push(`/read/${b.id}/${first}/`) } }}
                      className={`flex items-center gap-2 rounded-xl border px-2 py-2 text-left ${active ? 'border-nw bg-nw/5' : b.chapters.length ? 'border-neutral-200' : 'border-neutral-200 opacity-50'}`}
                    >
                      {b.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.cover} alt="" width={160} height={226} loading="lazy" decoding="async" className="h-9 w-7 rounded border border-neutral-200 object-cover" />
                      ) : (
                        <span className="h-9 w-7 rounded border border-dashed border-neutral-300" />
                      )}
                      <span className="min-w-0">
                        <span className="block truncate text-[12px] font-semibold text-neutral-800">{b.kind}</span>
                        <span className="block text-[11px] text-neutral-500">{b.level}</span>
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="my-3 border-t border-neutral-200 pt-3 text-[12px] font-semibold text-neutral-400">الغلاف</div>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                {library.find((b) => b.id === page.book)?.kind ?? 'Kursbuch'} · {level}
              </div>
              <div className="space-y-1">
                {chapters.map((c) => {
                  const list = pageChapters.filter((x) => x.chapter === c.n).map((x) => x.printed)
                  if (list.length === 0) return null
                  const meta = library.find((b) => b.id === page.book)?.chapters.find((x) => x.n === c.n)
                  const current = (page.part ?? page.chapter) === c.n
                  return (
                    <button
                      key={c.n}
                      onClick={() => { setNavOpen(false); if (c.first !== page.printed) go(c.first) }}
                      className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${current ? 'bg-nw/10' : ''}`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[12px] font-bold ${current ? 'border-nw bg-nw text-white' : 'border-neutral-300 text-neutral-600'}`}>
                        {c.n === 0 ? '–' : Number.isInteger(c.n) ? c.n : '★'}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-neutral-800">
                          {c.n === 0 ? (meta?.title ?? '') : Number.isInteger(c.n) ? `الدرس ${c.n}` : 'بلاتفورم'} {c.n !== 0 && meta?.title ? `· ${meta.title}` : ''}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-neutral-500">{list[0]}–{list[list.length - 1]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="Profil">
          <div className="absolute inset-0 bg-black/30" onClick={() => setProfileOpen(false)} />
          <div className="absolute bottom-[92px] left-1/2 max-h-[72vh] w-[94vw] max-w-[520px] -translate-x-1/2 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-neutral-800">الملف</span>
              <button onClick={() => setProfileOpen(false)} aria-label="Schließen" className="text-lg text-neutral-500">×</button>
            </div>
            <div className="mb-3 flex flex-col items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-[18px] font-bold text-neutral-500">MA</span>
              <span className="mt-2 text-[15px] font-semibold text-neutral-800">Mohamed Alhinawi</span>
              <span className="text-[12px] text-neutral-500">alhinaawi@gmail.com</span>
              <span className="mt-1 flex items-center gap-1 text-[12px] text-neutral-500">
                محفوظ على هذا الجهاز <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              </span>
            </div>
            <div className="mb-3 border-t border-neutral-200 pt-2">
              <div className="mb-1 text-[12px] font-semibold text-neutral-400">الإعدادات</div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-neutral-700">الصوت</span>
                <button
                  onClick={() => { const on = !sound; setSound(on); setSoundOn(on) }}
                  aria-label="Ton"
                  aria-pressed={sound}
                  className={`relative h-6 w-11 rounded-full transition-colors ${sound ? 'bg-nw' : 'bg-neutral-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${sound ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-neutral-700">تعليقات صوتية عند الحل</span>
                <button
                  onClick={() => { const on = !fb; setFeedback(on); setFb(on) }}
                  aria-label="Rückmeldung"
                  aria-pressed={fb}
                  className={`relative h-6 w-11 rounded-full transition-colors ${fb ? 'bg-nw' : 'bg-neutral-300'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${fb ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="py-2">
                <div className="mb-1 text-[12px] font-semibold text-neutral-400">اللغة</div>
                <div className="flex gap-2">
                  <span className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-center text-[12px] text-neutral-600">Deutsch</span>
                  <span className="flex-1 rounded-lg border border-neutral-300 py-1.5 text-center text-[12px] text-neutral-600">English</span>
                  <span className="flex-1 rounded-lg border border-nw bg-nw/5 py-1.5 text-center text-[12px] font-semibold text-nw">العربية</span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400">Die Oberfläche ist derzeit deutsch; die Sprachumschaltung kommt mit dem nächsten Schritt.</div>
              </div>
            </div>
            <div className="space-y-1 border-t border-neutral-200 pt-2">
              <button onClick={() => { setProfileOpen(false); router.push('/') }} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[13px] text-neutral-700">
                <span>اختيار الكتاب</span><span className="text-neutral-400">›</span>
              </button>
              <button onClick={() => { setProfileOpen(false); router.push('/hilfe/') }} className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-[13px] text-neutral-700">
                <span>دليل الاستخدام</span><span className="text-neutral-400">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {pagesOpen && (
        <div className="fixed inset-0 z-40" role="dialog" aria-label="Seite wählen">
          <div className="absolute inset-0 bg-black/20" onClick={() => setPagesOpen(false)} />
          <div className="absolute bottom-[120px] left-1/2 max-h-[55vh] w-[94vw] max-w-[560px] -translate-x-1/2 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl">
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
