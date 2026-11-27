# Netzwerky

Das interaktive **Netzwerk neu** Kursbuch (A1 · A2 · B1) — Buchseiten als lebendige, prüfbare Seiten mit Audio, Übersetzung und Fortschritt.

- **Live:** https://netzwerky.pages.dev
- **Stack:** Next.js (App Router, statischer Export) + Tailwind CSS 4, Hono-API in Cloudflare Pages Functions, D1 für Konten und Fortschritt.
- **Vorbild:** dieselben Funktionen wie Menscheny (Reader, Prüfen mit Feedback, Audio-Player, Konten, Rangliste, Lehrer-Dashboard), aber in der Optik des Netzwerk-Buchs (Karminrot `#D7344F`, weiße Buchseiten, orange Linien).

## Stand

| Teil | Status |
| --- | --- |
| Gerüst (Cover, Bibliothek, Kapitelliste, Reader) | live |
| A1 Kursbuch Kapitel 1, Seiten 11–12 | gebaut, prüfbar |
| A1 Kapitel 2–12, Arbeitsbuch A1, A2, B1 | in Arbeit, Kapitel für Kapitel |

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # statischer Export nach out/
```

Deploy: Cloudflare Pages, Build-Befehl `npm run build`, Ausgabe `out`, Functions aus `functions/`.

## Rechte

Alle Rechte am Original liegen beim **Klett Sprachen Verlag**. Diese Seite ist für den eigenen Unterricht gedacht.
