'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { books, bookById } from '@/data/books'
import CoverSocials from './CoverSocials'
import './premium-cover.css'

const STORE_KEY = 'nw-book'

export default function PremiumCover() {
  const router = useRouter()
  const [bookId, setBookId] = useState('a1-kb')
  const [libOpen, setLibOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORE_KEY)
      if (saved && bookById(saved)) setBookId(saved)
    } catch {}
  }, [])

  const book = bookById(bookId) ?? books[0]
  const pick = (id: string) => {
    const b = bookById(id)
    if (!b || !b.ready) return
    setBookId(id)
    setLoaded(false)
    try { localStorage.setItem(STORE_KEY, id) } catch {}
    setLibOpen(false)
  }
  const open = () => {
    try { localStorage.setItem(STORE_KEY, book.id) } catch {}
    router.push(`/read/${book.id}/1/`)
  }

  return (
    <div className="coverScreen">
      <section className="premiumCover" aria-label={`${book.kind} ${book.level} cover`}>
        <div className="premiumCoverMasthead">
          <button type="button" className="coverLibrary" onClick={() => setLibOpen(true)}>☰ المكتبة</button>
          <span className="premiumCoverLevel">{book.level}</span>
        </div>
        <figure className="premiumCoverArt">
          {book.cover ? (
            <img
              className={`coverArtwork${loaded ? ' isLoaded' : ''}`}
              src={book.cover}
              alt={`${book.title} — الغلاف`}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onLoad={() => setLoaded(true)}
              ref={(img) => { if (img?.complete && img.naturalWidth) setLoaded(true) }}
            />
          ) : (
            <span className="coverArtPlaceholder">{book.level} · {book.kind}</span>
          )}
        </figure>
        <div className="premiumCoverEdition" lang="de"><span>{book.kind}</span></div>
        <div className="coverOwner">
          <div className="coverByline">
            <span className="coverSmall">By</span>
            <h1>Hinawi</h1>
          </div>
          <div className="coverSocials" aria-label="Contact and social links"><CoverSocials /></div>
        </div>
        {book.ready ? (
          <button type="button" className="coverOpen" onClick={open}>افتح الكتاب ←</button>
        ) : (
          <button type="button" className="coverOpen" disabled>قريبًا</button>
        )}
        <div className="coverCopy">
          نسخة تفاعلية من الكتاب الأصلي © Klett Sprachen Verlag<br />
          كل الحقوق لأصحابها الأصليين.
        </div>
      </section>

      {libOpen && (
        <div className="coverLibOverlay" onClick={() => setLibOpen(false)}>
          <div className="coverLibSheet" onClick={(e) => e.stopPropagation()}>
            <div className="coverLibHead">
              <span className="coverLibTitle">المكتبة · Bibliothek</span>
              <button type="button" className="coverLibClose" onClick={() => setLibOpen(false)}>اقفل ✕</button>
            </div>
            <div className="coverLibGrid">
              {books.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className={`coverLibCard${b.id === book.id ? ' cur' : ''}`}
                  disabled={!b.ready}
                  onClick={() => pick(b.id)}
                >
                  <span className="coverLibThumb">
                    {b.cover ? <img src={b.cover} alt="" loading="lazy" /> : <span className="coverLibNoArt">{b.level}</span>}
                  </span>
                  <span className="coverLibMeta">
                    <span className="knd">{b.kind}</span><br />
                    <span className="lvl">{b.level}</span>
                    <span className="stt">{b.ready ? (b.id === book.id ? 'الكتاب الحالي' : 'جاهز') : 'قريبًا'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
