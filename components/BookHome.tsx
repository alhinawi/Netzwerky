import Link from 'next/link'
import { bookById } from '@/data/books'
import { pageNumbers, pagesOf } from '@/content/scan'

export default function BookHome({ bookId }: { bookId: string }) {
  const book = bookById(bookId)
  if (!book) return null
  const built = pagesOf(bookId)
  const groups: { n: string; first: number; last: number; count: number }[] = []
  for (const p of built) {
    const key = String(p.part ?? p.chapter)
    const g = groups.find((x) => x.n === key)
    if (g) { g.last = p.printed; g.count += 1 }
    else groups.push({ n: key, first: p.printed, last: p.printed, count: 1 })
  }
  const liveChapters = groups.map((g) => {
    const meta = book.chapters.find((c) => String(c.n) === g.n)
    return {
      n: g.n,
      title: meta?.title ?? `Kapitel ${g.n}`,
      ar: meta?.ar ?? '',
      grammar: meta?.grammar ?? '',
      pages: g.first === g.last ? String(g.first) : `${g.first}–${g.last}`,
      first: g.first,
    }
  })
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/library/" className="mb-4 inline-block text-sm text-neutral-500 hover:text-nw">← المكتبة</Link>
      <h1 className="text-2xl font-semibold">{book.title}</h1>
      <p className="mt-1 text-sm text-neutral-500">{book.ready ? (built.length > 0 ? `Reader · ${built.length} Seiten, nur Seiten zum Lesen – noch ohne Lösungen` : 'In Vorbereitung') : 'In Vorbereitung'}</p>
      <ul className="paper mt-6 divide-y divide-neutral-200 overflow-hidden rounded-lg bg-white">
        {(liveChapters.length > 0 ? liveChapters : book.chapters.map((c) => ({ ...c, first: undefined as number | undefined }))).map((c) => {
          const first = 'first' in c ? (c.first as number | undefined) : undefined
          const live = book.ready && !!first
          const body = (
            <>
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm font-bold ${live ? 'bg-nw text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                {c.n}
              </span>
              <span className="flex-1">
                <span className="block text-[15px] font-medium">{c.title}</span>
                <span className="ar block text-[12.5px] text-neutral-500">{c.ar}</span>
                <span className="mt-0.5 block text-[12px] text-neutral-400">{c.grammar}</span>
              </span>
              <span className="mt-1 text-[12px] text-neutral-400">{c.pages}</span>
            </>
          )
          return (
            <li key={String(c.n)}>
              {live ? (
                <Link href={`/read/${book.id}/${first}/`} className="flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-nw-soft/50">{body}</Link>
              ) : (
                <div className="flex w-full items-start gap-4 px-4 py-3 text-left opacity-60">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
