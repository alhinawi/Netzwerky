import ScanReader from '@/components/ScanReader'
import { pageOf, pageNumbers, pagesOf } from '@/content/scan'
import { books, bookById } from '@/data/books'

function library() {
  return books.map((b) => {
    const pages = pagesOf(b.id)
    const meta = bookById(b.id)?.chapters ?? []
    // Plattform pages share their chapter number with the chapter before them but
    // carry a part tag, so group on the part when there is one: they get their own
    // menu row (PT1..PT4) instead of stretching the chapter over them.
    const groups: { n: number | string; first: number; last: number; title: string }[] = []
    for (const p of pages) {
      const key = p.part ?? p.chapter
      const g = groups.find((x) => x.n === key)
      if (g) g.last = p.printed
      else groups.push({ n: key, first: p.printed, last: p.printed, title: '' })
    }
    groups.sort((a, b) => a.first - b.first)
    for (const g of groups) {
      const hit = meta.find((c) => String(c.n) === String(g.n))
      g.title = hit?.title ?? (typeof g.n === 'number' ? `Kapitel ${g.n}` : 'Plattform')
    }
    return {
      id: b.id,
      level: b.level,
      kind: b.kind,
      cover: pages[0]?.image.replace('.jpg', '-cover.webp') ?? bookById(b.id)?.cover ?? null,
      chapters: groups,
    }
  })
}

export function generateStaticParams() {
  return books.flatMap((b) =>
    pagesOf(b.id).map((p) => ({ book: b.id, page: String(p.printed) })),
  )
}

export default async function Page({ params }: { params: Promise<{ book: string; page: string }> }) {
  const { book, page } = await params
  const current = pageOf(book, Number(page))
  if (!current) {
    return <div className="p-10 text-center text-neutral-500">Diese Seite ist noch nicht gebaut.</div>
  }
  const numbers = pageNumbers(book)
  const chapters: { n: number; first: number }[] = []
  for (const p of pagesOf(book)) {
    if (!chapters.some((c) => c.n === p.chapter)) chapters.push({ n: p.chapter, first: p.printed })
  }
  chapters.sort((a, b) => a.n - b.n)
  const i = numbers.indexOf(current.printed)
  return (
    <ScanReader
      page={current}
      total={numbers.length}
      pages={numbers}
      chapters={chapters}
      pageChapters={pagesOf(book).map((p) => ({ printed: p.printed, chapter: p.chapter }))}
      prev={numbers[i - 1]}
      next={numbers[i + 1]}
      library={library()}
    />
  )
}
