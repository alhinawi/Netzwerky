import ScanReader from '@/components/ScanReader'
import { pageOf, pageNumbers, pagesOf } from '@/content/scan'
import { books } from '@/data/books'

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
    />
  )
}
