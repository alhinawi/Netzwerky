import Link from 'next/link'

export default function Cover() {
  return (
    <div className="min-h-screen bg-[#f6f4f2]">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-10">
        <div className="paper overflow-hidden rounded-xl bg-white">
          <div className="h-1.5 bg-[#f0a24b]" />
          <div className="h-1 bg-[#e8623c]" />
          <div className="bg-nw px-7 py-10 text-white sm:px-12 sm:py-14">
            <p className="text-[13px] uppercase tracking-[0.25em] text-white/80">Netzwerk neu · Deutsch als Fremdsprache</p>
            <h1 className="mt-3 text-5xl font-bold tracking-tight sm:text-6xl">Netzwerky</h1>
            <p className="mt-4 text-lg text-white/90">Das interaktive Kursbuch — A1 · A2 · B1</p>
          </div>
          <div className="px-7 py-8 sm:px-12">
            <p className="ar text-[15px] leading-relaxed text-neutral-600">
              الكتاب زي الأصل بالظبط، بس حي: كل كلمة وجملة ليها ترجمة وصوت، والتمارين بتتصحّح لوحدها.
              اختار المستوى وابدأ من أول Kapitel.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/read/a1-kb/11/" className="rounded-lg bg-nw px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-nw-dark">
                افتح الكتاب
              </Link>
              <Link href="/library/" className="rounded-lg border border-neutral-300 px-6 py-3 text-[15px] font-semibold text-neutral-700 transition hover:border-nw hover:text-nw">
                المكتبة
              </Link>
            </div>
            <p className="mt-8 text-[12.5px] text-neutral-400">
              مع هناوي · Alle Rechte am Original liegen beim Klett Sprachen Verlag.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
