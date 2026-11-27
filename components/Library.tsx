import Link from 'next/link'
import { books } from '@/data/books'

const spine: Record<string, string> = { A1: 'bg-[#d7344f]', A2: 'bg-[#c2691f]', B1: 'bg-[#2f6f6a]' }

export default function Library() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-neutral-500 hover:text-nw">← Start</Link>
        <h1 className="text-lg font-semibold">المكتبة · Bibliothek</h1>
        <span className="w-12" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((b) => (
          <Link key={b.id} href={`/book/${b.id}/`} className="group overflow-hidden rounded-lg bg-white text-left paper transition hover:-translate-y-0.5">
            <div className={`flex h-24 items-end justify-between px-4 py-3 text-white ${spine[b.level]}`}>
              <span className="text-2xl font-bold">{b.level}</span>
              <span className="text-[12px] uppercase tracking-widest text-white/80">{b.kind}</span>
            </div>
            <div className="p-4">
              <h2 className="text-[15px] font-semibold leading-snug">{b.title}</h2>
              <p className="mt-1 text-[12.5px] text-neutral-500">{b.ready ? `${b.chapters.length} Kapitel` : 'kommt bald'}</p>
              {b.note && <p className="mt-2 text-[12px] text-neutral-400">{b.note}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
