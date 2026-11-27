export type Chapter = { n: number | string; title: string; pages: string; grammar: string; ar: string }
export type Book = {
  id: string
  level: 'A1' | 'A2' | 'B1'
  kind: 'Kursbuch' | 'Arbeitsbuch'
  title: string
  chapters: Chapter[]
  ready: boolean
  note?: string
  /** thumbnail for the book picker when the book has no scanned page yet */
  cover?: string
}

const a1kb: Chapter[] = [
  { n: 1, title: 'Guten Tag!', pages: '8–17', grammar: 'W-Frage · Aussagesatz · Verben und Personalpronomen', ar: 'التحيات والتعريف بالنفس' },
  { n: 2, title: 'Freunde, Kollegen und ich', pages: '18–27', grammar: 'unregelmäßige Verben · Artikel: der, das, die · haben und sein', ar: 'الأصدقاء والزملاء' },
  { n: 3, title: 'In Hamburg', pages: '28–37', grammar: 'unbestimmter Artikel · kein, keine · Imperativ mit Sie', ar: 'في هامبورج' },
  { n: 'P1', title: 'Plattform 1', pages: '38–43', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 4, title: 'Guten Appetit!', pages: '44–53', grammar: 'Akkusativ · Verben mit Akkusativ · mögen und möchten', ar: 'بالهنا والشفا' },
  { n: 5, title: 'Alltag und Familie', pages: '54–63', grammar: 'Possessivartikel · Modalverben · Satzklammer', ar: 'اليوميات والعيلة' },
  { n: 6, title: 'Zeit mit Freunden', pages: '64–73', grammar: 'Temporalangaben · trennbare Verben · Personalpronomen im Akkusativ', ar: 'وقت مع الأصحاب' },
  { n: 'P2', title: 'Plattform 2', pages: '74–79', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 7, title: 'Arbeitsalltag', pages: '80–89', grammar: 'Sätze verbinden · Artikel im Dativ · Präposition mit Dativ', ar: 'يوم العمل' },
  { n: 8, title: 'Fit und gesund', pages: '90–99', grammar: 'Imperativ mit du, ihr und Sie · Modalverben sollen, müssen, dürfen', ar: 'الصحة والرشاقة' },
  { n: 9, title: 'Meine Wohnung', pages: '100–109', grammar: 'sein + Adjektiv · Präposition in + Akkusativ · Wechselpräpositionen mit Dativ', ar: 'شقتي' },
  { n: 'P3', title: 'Plattform 3', pages: '110–115', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 10, title: 'Studium und Beruf', pages: '116–125', grammar: 'Perfekt: Satzklammer · Partizip II · Perfekt mit haben und sein', ar: 'الدراسة والشغل' },
  { n: 11, title: 'Die Jacke gefällt mir!', pages: '126–135', grammar: 'Welcher? Welches? Welche? · Personalpronomen im Dativ', ar: 'الجاكيت عاجبني' },
  { n: 12, title: 'Ab in den Urlaub!', pages: '136–145', grammar: 'Pronomen man · Sätze verbinden: denn · Präpositionen mit Dativ', ar: 'يلا في إجازة' },
  { n: 'P4', title: 'Plattform 4', pages: '146–151', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
]

const empty = (level: string): Chapter[] => [
  { n: 1, title: 'Kapitel 1', pages: '—', grammar: 'in Vorbereitung', ar: 'قيد التجهيز' },
]

export const books: Book[] = [
  { id: 'a1-kb', level: 'A1', kind: 'Kursbuch', title: 'Netzwerk neu A1 · Kursbuch', chapters: a1kb, ready: true, note: 'Kapitel 1 ist live — der Rest folgt Kapitel für Kapitel.' },
  { id: 'a1-ab', level: 'A1', kind: 'Arbeitsbuch', title: 'Netzwerk neu A1 · Arbeitsbuch', chapters: empty('A1'), ready: false },
  { id: 'a2-kb', level: 'A2', kind: 'Kursbuch', title: 'Netzwerk neu A2 · Kursbuch', chapters: empty('A2'), ready: true, note: 'Kapitel 6-8 zuerst, der Rest folgt.' },
  { id: 'a2-ab', level: 'A2', kind: 'Arbeitsbuch', title: 'Netzwerk neu A2 · Arbeitsbuch', chapters: empty('A2'), ready: false, cover: '/covers/a2-ab.webp' },
  { id: 'b1-kb', level: 'B1', kind: 'Kursbuch', title: 'Netzwerk neu B1 · Kursbuch', chapters: empty('B1'), ready: false },
  { id: 'b1-ab', level: 'B1', kind: 'Arbeitsbuch', title: 'Netzwerk neu B1 · Arbeitsbuch', chapters: empty('B1'), ready: false, cover: '/covers/b1-ab.webp' },
]

export const bookById = (id: string) => books.find((b) => b.id === id)
