import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[560px] flex-col items-center justify-center gap-4 px-5 text-center">
      <div className="text-[15px] font-extrabold tracking-tight text-neutral-900">
        Netzwerk<span className="text-nw">.</span>
      </div>
      <div className="text-[15px] font-semibold text-neutral-800">Diese Seite gibt es noch nicht</div>
      <p className="ar text-[14px] leading-relaxed text-neutral-600">
        الصفحة دي لسه مش موجودة. اختار كتاب من المكتبة أو ارجع لآخر صفحة كنت فيها.
      </p>
      <div className="mt-2 flex gap-2">
        <Link href="/" className="rounded-lg bg-nw px-4 py-2 text-[14px] font-semibold text-white">المكتبة</Link>
      </div>
    </main>
  )
}
