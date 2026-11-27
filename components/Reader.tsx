'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BookPage } from '../content/types'
import { pages as a1kbPages } from '@/content/a1-kb/kap1'
import { Band, Exercise, Grammar, Note, Title } from './blocks'
import { playCorrect, playWrong, playTap } from '@/lib/sound'

const registry: Record<string, BookPage[]> = { 'a1-kb': a1kbPages }

const norm = (s: string) => s.trim().toLowerCase().replace(/[.!?]+$/, '')

function exerciseOk(page: BookPage, id: string, state: any): boolean {
  const ex = page.blocks.find((b) => b.kind === 'exercise' && b.id === id)
  if (!ex || ex.kind !== 'exercise') return true
  for (const body of ex.body) {
    if (body.kind === 'gaps') {
      const vals = state ?? {}
      if (!body.items.every((it, i) => norm(vals[i] ?? '') === norm(it.answer))) return false
    }
    if (body.kind === 'match') {
      const vals = state ?? {}
      if (!body.pairs.every((p, i) => vals[i] === p.right)) return false
    }
  }
  return true
}

export default function Reader({ bookId, pageNo }: { bookId: string; pageNo: number }) {
  const router = useRouter()
  const onNavigate = (p: number) => router.push(`/read/${bookId}/${p}/`)
  const onBack = () => router.push(`/book/${bookId}/`)
  const pages = registry[bookId] ?? []
  const index = pages.findIndex((p) => p.printed === pageNo)
  const page = pages[index]
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [shake, setShake] = useState(false)
  const [track, setTrack] = useState<string | null>(null)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setAnswers({})
    setChecked({})
    setTrack(null)
  }, [bookId, pageNo])

  const checkableIds = useMemo(
    () => (page ? page.blocks.filter((b) => b.kind === 'exercise' && b.checkable).map((b) => (b as any).id as string) : []),
    [page],
  )

  if (!page) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center text-neutral-500">
        Diese Seite ist noch nicht gebaut.
        <button onClick={onBack} className="mt-4 block w-full text-sm text-nw">← zurück</button>
      </div>
    )
  }

  const play = (src?: string) => {
    if (!src) return
    setTrack(src)
    requestAnimationFrame(() => {
      const el = audio.current
      if (!el) return
      el.src = `/audio/a1/kb/${src}`
      void el.play().catch(() => {})
    })
  }

  const doCheck = () => {
    const next: Record<string, boolean> = {}
    let allOk = true
    for (const id of checkableIds) {
      const ok = exerciseOk(page, id, answers[id])
      next[id] = ok
      if (!ok) allOk = false
    }
    setChecked(next)
    if (allOk) playCorrect()
    else {
      playWrong()
      setShake(true)
      window.setTimeout(() => setShake(false), 420)
    }
  }

  const reset = () => {
    setAnswers({})
    setChecked({})
    playTap()
  }

  const prev = pages[index - 1]
  const next = pages[index + 1]

  return (
    <div className="mx-auto max-w-4xl px-3 pb-28 pt-4 sm:px-5">
      <div className="mb-3 flex items-center justify-between text-sm">
        <button onClick={onBack} className="text-neutral-500 hover:text-nw">← Kapitel</button>
        <span className="text-neutral-400">Netzwerk neu A1 · Kursbuch</span>
        <span className="text-neutral-400">S. {page.printed}</span>
      </div>

      <article className={`paper rounded-lg bg-white px-5 py-6 sm:px-10 sm:py-8 ${shake ? 'shake' : 'fade-in'}`}>
        {page.blocks.map((b, i) => {
          switch (b.kind) {
            case 'band':
              return <Band key={i} chapter={b.chapter} text={b.text} />
            case 'title':
              return <Title key={i} text={b.text} ar={b.ar} />
            case 'exercise':
              return (
                <Exercise
                  key={i}
                  block={b}
                  state={answers[b.id]}
                  setState={(v) => setAnswers((a) => ({ ...a, [b.id]: v }))}
                  checked={!!checked[b.id]}
                  onPlay={play}
                />
              )
            case 'grammar':
              return <Grammar key={i} block={b} />
            case 'note':
              return <Note key={i} block={b} />
            default:
              return null
          }
        })}
        <div className="mt-8 border-t border-neutral-200 pt-3 text-right text-[12px] text-neutral-400">{page.printed}</div>
      </article>

      {track && (
        <div className="paper fixed inset-x-0 bottom-16 mx-auto flex max-w-md items-center gap-3 rounded-full bg-white px-4 py-2 text-sm">
          <span className="flex-1 truncate text-neutral-600">▶ {track.replace('NWn_A1_KB_Audio_', 'Aufgabe ').replace('.mp3', '')}</span>
          <button onClick={() => { audio.current?.pause(); setTrack(null) }} className="text-neutral-400 hover:text-nw">✕</button>
        </div>
      )}
      <audio ref={audio} onEnded={() => setTrack(null)} className="hidden" />

      <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3 py-2">
          <button
            onClick={() => prev && onNavigate(prev.printed)}
            disabled={!prev}
            className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
          >
            ‹ Zurück
          </button>
          <div className="flex items-center gap-2">
            {checkableIds.length > 0 && (
              <>
                <button onClick={reset} className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 hover:border-nw hover:text-nw">
                  Zurücksetzen
                </button>
                <button onClick={doCheck} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
                  ✓ Prüfen
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => next && onNavigate(next.printed)}
            disabled={!next}
            className="rounded-md px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
          >
            Weiter ›
          </button>
        </div>
      </div>
    </div>
  )
}
