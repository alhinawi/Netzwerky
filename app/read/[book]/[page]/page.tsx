import Reader from '@/components/Reader'
import { pages as a1kbPages } from '@/content/a1-kb/kap1'

const registry: Record<string, { printed: number }[]> = { 'a1-kb': a1kbPages }

export function generateStaticParams() {
  return Object.entries(registry).flatMap(([book, pages]) =>
    pages.map((p) => ({ book, page: String(p.printed) })),
  )
}

export default async function Page({ params }: { params: Promise<{ book: string; page: string }> }) {
  const { book, page } = await params
  return <Reader bookId={book} pageNo={Number(page)} />
}
