import ScanReader from '@/components/ScanReader'
import { pageOf, pageNumbers, pagesOf } from '@/content/scan'

export function generateStaticParams() {
  return pagesOf('a1-kb').map((p) => ({ book: 'a1-kb', page: String(p.printed) }))
}

export default async function Page({ params }: { params: Promise<{ book: string; page: string }> }) {
  const { book, page } = await params
  const current = pageOf(book, Number(page))
  if (!current) {
    return <div className="p-10 text-center text-neutral-500">Diese Seite ist noch nicht gebaut.</div>
  }
  const numbers = pageNumbers(book)
  const i = numbers.indexOf(current.printed)
  return (
    <ScanReader
      page={current}
      total={numbers.length}
      pages={numbers}
      prev={numbers[i - 1]}
      next={numbers[i + 1]}
    />
  )
}
