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
      <div className="flex items-start gap-5">
        {book.cover && (
          <img src={book.cover} alt={`غلاف ${book.title}`} className="w-28 shrink-0 rounded-md border border-neutral-200 shadow-sm sm:w-36" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{book.title}</h1>
          <p className="mt-1 text-sm text-neutral-500">{book.ready ? (built.length > 0 ? `Reader · ${built.length} Seiten` : 'In Vorbereitung') : 'In Vorbereitung'}</p>
        </div>
      </div>
      <div className="paper mt-6 rounded-lg bg-white px-5 py-4">
        <h2 className="ar text-[16px] font-bold text-nw">تعليمات استخدام الكتاب</h2>
        <ul className="ar mt-2 list-disc space-y-1.5 pr-5 text-[14px] leading-relaxed text-neutral-700" dir="rtl">
          <li>اضغط على أي كلمة أو عنوان في الصفحة يطلعلك المعنى بالمصري. زرار «كلمة / جملة» اللي تحت بيبدّل بين ترجمة الكلمة لوحدها والجملة كاملة.</li>
          <li>شريط الصوت اللي تحت بيشغّل تسجيل التمرين اللي قدامه علامة سماعة في الصفحة، وتقدر تقدّم وترجّع فيه براحتك.</li>
          <li>من «عرض» فوق تختار صفحة واحدة أو صفحتين جنب بعض، و«الأصل» بيفتح الصفحة بحجمها الحقيقي عشان تزوّم في أي حتة.</li>
          <li>اكتب إجابتك في مربعات التمارين الفاضية، وعلامة الصح بتصحّحلك من إجابات Klett الرسمية. اللي ملوش إجابة رسمية بيتساب من غير تقييم.</li>
          <li>رقم الصفحة اللي في النص بيوصّلك لأي صفحة، وقايمة الفصول اللي فوق بتنقلك لأي Kapitel على طول.</li>
        </ul>
      </div>
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
