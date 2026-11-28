import { redirect } from 'next/navigation'
import { books } from '@/data/books'

export function generateStaticParams() {
  return books.map((b) => ({ id: b.id }))
}

export default function Page() {
  redirect('/')
}
