'use client'
import { useState } from 'react'
import type { Block, Body, Line } from '../content/types'
import { playTap } from '../lib/sound'

const speakerDot = (s?: Line['speaker']) => {
  if (s === 'o') return '○'
  if (s === 'tri') return '△'
  if (s === 'dot') return '●'
  return '·'
}

export function Band({ chapter, text }: { chapter: number; text: string }) {
  return (
    <div className="relative mb-6">
      <div className="h-1.5 w-full bg-[#f0a24b]" />
      <div className="h-1 w-full bg-[#e8623c]" />
      <div className="mt-1 flex items-stretch bg-nw text-white">
        <div className="flex-1 px-4 py-2 text-[13px] tracking-wide">{text}</div>
        <div className="flex w-16 items-center justify-center bg-nw-dark text-2xl font-semibold">{chapter}</div>
      </div>
    </div>
  )
}

export function Title({ text, ar }: { text: string; ar?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-[26px] font-semibold leading-tight text-nw">{text}</h2>
      {ar && <p className="ar mt-1 text-[15px] text-neutral-500">{ar}</p>}
    </div>
  )
}

function Lines({ lines, onPlay }: { lines: Line[]; onPlay: (src?: string) => void }) {
  const [open, setOpen] = useState<Record<number, boolean>>({})
  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) => (
        <li key={i}>
          <button
            onClick={() => { setOpen((o) => ({ ...o, [i]: !o[i] })); playTap() }}
            className="flex w-full items-start gap-2 rounded-md px-1 py-1 text-left hover:bg-nw-soft/60"
          >
            <span className="mt-[2px] w-4 shrink-0 text-center text-[13px] text-neutral-500">{speakerDot(l.speaker)}</span>
            <span className="flex-1">
              <span className="text-[15.5px] leading-snug">{l.text}</span>
              {open[i] && <span className="ar mt-0.5 block text-[13.5px] text-neutral-500">{l.ar}</span>}
            </span>
            {l.audio && <span className="mt-[1px] text-[13px] text-nw">▶</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}

function Photos({ items }: { items: { src: string; label?: string; caption?: string }[] }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-3">
      {items.map((p, i) => (
        <figure key={i} className="relative overflow-hidden rounded-md bg-neutral-100">
          <img src={p.src} alt="" className="h-44 w-full object-cover" loading="lazy" />
          {p.label && (
            <span className="absolute bottom-1 left-1 rounded bg-white/85 px-1.5 py-0.5 text-[11px] font-semibold text-neutral-700">{p.label}</span>
          )}
          {p.caption && <figcaption className="ar p-2 text-[12px] text-neutral-600">{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  )
}

const pairColors = ['bg-rose-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-teal-500']

export function Match({
  pairs, options, value, onChange, checked,
}: {
  pairs: { left: string; right: string }[]
  options: string[]
  value: Record<number, string>
  onChange: (v: Record<number, string>) => void
  checked: boolean
}) {
  const [active, setActive] = useState<number | null>(null)
  const rightIndex = (opt: string) => pairs.findIndex((p) => p.right === opt)
  const chosenBy = (opt: string) => Object.entries(value).find(([, v]) => v === opt)?.[0]

  return (
    <div className="grid gap-4 sm:grid-cols-[1.15fr_1fr]">
      <ol className="space-y-2">
        {pairs.map((p, i) => {
          const ok = checked && value[i] === p.right
          const bad = checked && value[i] !== p.right
          return (
            <li key={i}>
              <button
                onClick={() => { setActive(i); playTap() }}
                className={`w-full rounded-md border px-3 py-2 text-left text-[15px] transition ${
                  active === i ? 'border-nw ring-2 ring-nw/30' : 'border-neutral-200 hover:border-nw/50'
                } ${ok ? 'border-emerald-500 bg-emerald-50' : ''} ${bad ? 'border-rose-500 bg-rose-50' : ''}`}
              >
                <span className="flex items-center gap-2">
                  {value[i] && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pairColors[i % pairColors.length]}`} />}
                  <span className="flex-1">{p.left}</span>
                  {ok && <span className="text-emerald-600">✓</span>}
                  {bad && <span className="text-rose-600">✕</span>}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <ul className="space-y-2">
        {options.map((o) => {
          const owner = chosenBy(o)
          const ok = checked && owner !== undefined && pairs[Number(owner)].right === o
          return (
            <li key={o}>
              <button
                onClick={() => {
                  if (active === null) return
                  const next: Record<number, string> = { ...value }
                  for (const k of Object.keys(next)) if (next[Number(k)] === o) delete next[Number(k)]
                  next[active] = o
                  onChange(next)
                  setActive(null)
                  playTap()
                }}
                className={`w-full rounded-md border px-3 py-2 text-left text-[14.5px] transition ${
                  owner !== undefined ? 'border-neutral-300 bg-neutral-50' : 'border-neutral-200 hover:border-nw/50'
                } ${ok ? 'border-emerald-500 bg-emerald-50' : ''}`}
              >
                <span className="flex items-center gap-2">
                  {owner !== undefined && <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${pairColors[Number(owner) % pairColors.length]}`} />}
                  <span className="flex-1">{o}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Gaps({
  items, values, onChange, checked,
}: {
  items: { before: string; answer: string; after: string; ar: string }[]
  values: Record<number, string>
  onChange: (v: Record<number, string>) => void
  checked: boolean
}) {
  const norm = (s: string) => s.trim().toLowerCase().replace(/[.!?]+$/, '')
  return (
    <ol className="space-y-3">
      {items.map((it, i) => {
        const v = values[i] ?? ''
        const ok = checked && norm(v) === norm(it.answer)
        const bad = checked && !ok
        return (
          <li key={i} className="text-[15.5px] leading-relaxed">
            <span>{it.before} </span>
            <input
              value={v}
              onChange={(e) => onChange({ ...values, [i]: e.target.value })}
              size={Math.max(8, it.answer.length + 2)}
              className={`mx-1 rounded border-b-2 bg-transparent px-1 text-center outline-none transition ${
                ok ? 'border-emerald-500 text-emerald-700' : bad ? 'border-rose-500 text-rose-700' : 'border-neutral-400 focus:border-nw'
              }`}
            />
            <span> {it.after}</span>
            {ok && <span className="ml-2 text-emerald-600">✓</span>}
            {bad && <span className="ml-2 text-rose-600">✕</span>}
            <div className="ar mt-0.5 text-[12.5px] text-neutral-500">{it.ar}</div>
          </li>
        )
      })}
    </ol>
  )
}


function Numbers({ items }: { items: { n: number; word: string }[] }) {
  const [active, setActive] = useState<number | null>(null)
  return (
    <div className="mb-4 grid grid-cols-5 gap-1.5 sm:grid-cols-7">
      {items.map((it) => (
        <button
          key={it.n}
          onClick={() => { setActive(active === it.n ? null : it.n); playTap() }}
          className={`rounded border px-1 py-2 text-center transition ${active === it.n ? 'border-nw bg-nw-soft' : 'border-neutral-200 hover:border-nw/60'}`}
        >
          <span className="block text-[19px] font-semibold leading-none text-nw">{it.n}</span>
          <span className="mt-1 block text-[11.5px] text-neutral-600">{it.word}</span>
        </button>
      ))}
    </div>
  )
}

function Alphabet({ items }: { items: { letter: string; name: string }[] }) {
  const [active, setActive] = useState<string | null>(null)
  return (
    <div className="mb-4 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
      {items.map((it) => (
        <button
          key={it.letter}
          onClick={() => { setActive(active === it.letter ? null : it.letter); playTap() }}
          className={`rounded border px-1 py-2 text-center transition ${active === it.letter ? 'border-nw bg-nw-soft' : 'border-neutral-200 hover:border-nw/60'}`}
        >
          <span className="block text-[15px] font-semibold leading-none text-nw">{it.letter}</span>
          <span className="mt-1 block text-[10.5px] uppercase tracking-wide text-neutral-500">{it.name}</span>
        </button>
      ))}
    </div>
  )
}

export function Exercise({
  block, state, setState, checked, onPlay,
}: {
  block: Extract<Block, { kind: 'exercise' }>
  state: any
  setState: (v: any) => void
  checked: boolean
  onPlay: (src?: string) => void
}) {
  return (
    <section className="mb-7">
      <div className="mb-2 flex items-start gap-2">
        <button
          onClick={() => onPlay(block.audio?.[0])}
          disabled={!block.audio?.length}
          className={`mt-0.5 flex h-7 items-center gap-1 rounded-md px-2 text-[13px] font-semibold ${
            block.audio?.length ? 'bg-nw text-white hover:bg-nw-dark' : 'cursor-default bg-neutral-100 text-neutral-400'
          }`}
          title={block.audio?.length ? 'Aufgabe anhören' : 'Kein Audio'}
        >
          ▶ <span>{block.label}</span>
        </button>
        <div className="flex-1">
          <p className="text-[15.5px] font-medium leading-snug">{block.instruction}</p>
          <p className="ar mt-0.5 text-[13px] text-neutral-500">{block.instructionAr}</p>
        </div>
      </div>
      <div className="pl-0 sm:pl-9">
        {block.body.map((b, i) => (
          <BodyView key={i} body={b} state={state} setState={setState} checked={checked} onPlay={onPlay} />
        ))}
      </div>
    </section>
  )
}

function BodyView({ body, state, setState, checked, onPlay }: { body: Body; state: any; setState: (v: any) => void; checked: boolean; onPlay: (src?: string) => void }) {
  switch (body.kind) {
    case 'lines':
      return <Lines lines={body.lines} onPlay={onPlay} />
    case 'photos':
      return <Photos items={body.items} />
    case 'plain':
      return (
        <div className="mb-3">
          <p className="text-[15px] italic text-neutral-700">{body.de}</p>
          {body.ar && <p className="ar text-[13px] text-neutral-500">{body.ar}</p>}
        </div>
      )
    case 'match':
      return <Match pairs={body.pairs} options={body.options} value={state ?? {}} onChange={setState} checked={checked} />
    case 'gaps':
      return <Gaps items={body.items} values={state ?? {}} onChange={setState} checked={checked} />
    case 'numbers':
      return <Numbers items={body.items} />
    case 'alphabet':
      return <Alphabet items={body.items} />
    case 'play':
      return (
        <button onClick={() => onPlay(body.audio)} className="mb-3 rounded-md bg-nw px-3 py-1.5 text-sm text-white">
          ▶ {body.label}
        </button>
      )
    default:
      return null
  }
}

export function Grammar({ block }: { block: Extract<Block, { kind: 'grammar' }> }) {
  return (
    <section className="mb-7 rounded-md border border-[#f0a24b] bg-[#fffaf3] p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="rounded bg-[#f0a24b] px-1.5 text-[12px] font-bold text-white">G</span>
        <h3 className="text-[15px] font-semibold text-[#a8621c]">{block.title}</h3>
        <span className="ar text-[12px] text-neutral-500">{block.titleAr}</span>
      </div>
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {block.head.map((h, i) => (
              <th key={i} className={`whitespace-nowrap px-2 py-1 text-left font-semibold ${i === 0 ? 'w-20 text-neutral-500' : 'text-[#a8621c]'}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r, i) => (
            <tr key={i} className="border-t border-[#f3e2c9]">
              {r.map((c, j) => (
                <td key={j} className={`px-2 py-1 align-top ${j === 0 ? 'w-20 text-neutral-500' : 'whitespace-nowrap'}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.note && <p className="ar mt-2 text-[12.5px] text-neutral-600">{block.note}</p>}
    </section>
  )
}

export function Note({ block }: { block: Extract<Block, { kind: 'note' }> }) {
  return (
    <section className="mb-7 rounded-md border border-neutral-200 bg-[#f4f7fb] p-3">
      <div className="mb-2 flex items-baseline gap-2">
        <span className="rounded bg-[#5a7fb5] px-1.5 text-[12px] font-bold text-white">!</span>
        <h3 className="text-[14.5px] font-semibold text-[#33507c]">{block.title}</h3>
        <span className="ar text-[12px] text-neutral-500">{block.titleAr}</span>
      </div>
      <ul className="space-y-1">
        {block.items.map((it, i) => (
          <li key={i} className="text-[14px]">
            <span className="font-medium">{it.de}</span>
            <span className="ar mr-2 block text-[12.5px] text-neutral-500">{it.ar}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
