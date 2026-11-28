'use client'

import { useEffect } from 'react'

export default function GoHome() {
  useEffect(() => { window.location.replace('/') }, [])
  return (
    <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#4c2632', color: '#f5eedf', fontFamily: 'Arial, sans-serif' }}>
      <meta httpEquiv="refresh" content="0; url=/" />
      <a href="/" style={{ color: '#f5eedf' }}>المكتبة ←</a>
    </main>
  )
}
