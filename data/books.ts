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
  { n: 0, title: 'Umschlag & Inhalt', pages: '1–7', grammar: 'Umschlag, Impressum, Inhaltsverzeichnis', ar: 'الغلاف والمحتوى' },
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
  { n: 14, title: 'Anhang', pages: '152–175', grammar: 'Grammatikübersicht · unregelmäßige Verben · alphabetische Wortliste · Quellenverzeichnis', ar: 'الملحق' },
]

const a2kb: Chapter[] = [
  { n: 1, title: 'Und was machst du?', pages: '8–17', grammar: 'Genitiv: Name + s · Wiederholung: Perfekt · Nebensatz mit weil', ar: 'إيه اللي بتعمله؟' },
  { n: 2, title: 'Nach der Schulzeit', pages: '18–27', grammar: 'Modalverben im Präteritum · Wiederholung: Artikel · Possessivartikel im Dativ', ar: 'بعد المدرسة' },
  { n: 3, title: 'Immer online?', pages: '28–37', grammar: 'Adjektive: Komparativ und Superlativ · Vergleiche mit als und wie · Nebensatz mit dass', ar: 'دايمًا أونلاين؟' },
  { n: 'P1', title: 'Plattform 1', pages: '38–43', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 4, title: 'Große und kleine Gefühle', pages: '44–53', grammar: 'Nebensatz mit wenn · reflexive Verben', ar: 'مشاعر كبيرة وصغيرة' },
  { n: 5, title: 'Leben in der Stadt', pages: '54–63', grammar: 'Adjektive nach dem bestimmten Artikel · Präpositionen ohne + Akkusativ und mit + Dativ · Konjunktiv II: könnte', ar: 'الحياة في المدينة' },
  { n: 6, title: 'Arbeitswelten', pages: '64–73', grammar: 'Adjektive nach dem unbestimmten Artikel · werden', ar: 'عوالم الشغل' },
  { n: 'P2', title: 'Plattform 2', pages: '74–79', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 7, title: 'Ganz schön mobil', pages: '80–89', grammar: 'indirekte Fragesätze: W-Fragen und Ja/Nein-Fragen mit ob · Ortsangaben: Präpositionen', ar: 'موبايل خالص' },
  { n: 8, title: 'Gelernt ist gelernt!', pages: '90–99', grammar: 'Konjunktiv II: sollte (Ratschläge) · Interrogativartikel Was für ein(e)?', ar: 'اللي اتعلمته اتعلمته' },
  { n: 9, title: 'Sportlich, sportlich', pages: '100–109', grammar: 'Sätze verbinden: deshalb, trotzdem · Verben mit Dativ und Akkusativ', ar: 'رياضة رياضة' },
  { n: 'P3', title: 'Plattform 3', pages: '110–115', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 10, title: 'Zusammen leben', pages: '116–125', grammar: 'Wechselpräpositionen · Positions- und Richtungsverben · Nebensatz mit als und wenn', ar: 'عيشة سوا' },
  { n: 11, title: 'Wie die Zeit vergeht!', pages: '126–135', grammar: 'Konjunktiv II · Verben mit Präposition · W-Fragen mit Präposition', ar: 'الوقت بيمر بسرعة' },
  { n: 12, title: 'Gute Unterhaltung!', pages: '136–145', grammar: 'Indefinitpronomen · Relativsätze im Nominativ und Akkusativ', ar: 'تسلية حلوة' },
  { n: 'P4', title: 'Plattform 4', pages: '146–151', grammar: 'wiederholen und trainieren', ar: 'مراجعة' },
  { n: 13, title: 'Anhang', pages: '152–178', grammar: 'Grammatikübersicht · unregelmäßige Verben · alphabetische Wortliste · Quellenverzeichnis', ar: 'الملحق' },
]

const a2ab: Chapter[] = [
  { n: 0, title: 'Titel & Inhalt', pages: '1–5', grammar: 'Umschlag, Inhaltsverzeichnis', ar: 'الغلاف والمحتوى' },
  { n: 1, title: 'Und was machst du?', pages: '6–17', grammar: 'Vorstellen · über Vergangenes berichten · sich verabreden', ar: 'إيه اللي بتعمله؟' },
  { n: 2, title: 'Nach der Schulzeit', pages: '18–29', grammar: 'über die Schulzeit sprechen · Meinung sagen · eine Mail schreiben', ar: 'بعد المدرسة' },
  { n: 3, title: 'Immer online?', pages: '30–41', grammar: 'über Medien sprechen · Vergleiche · Kommentare verstehen', ar: 'دايمًا أونلاين؟' },
  { n: 'P1', title: 'Prüfungstraining 1', pages: '42–45', grammar: 'prüfen und trainieren', ar: 'تدريب على الامتحان' },
  { n: 4, title: 'Große und kleine Gefühle', pages: '46–57', grammar: 'über Gefühle sprechen · Glückwünsche · auf Einladungen reagieren', ar: 'مشاعر كبيرة وصغيرة' },
  { n: 5, title: 'Leben in der Stadt', pages: '58–69', grammar: 'Bilder beschreiben · Stellenanzeigen · höflich bitten', ar: 'الحياة في المدينة' },
  { n: 6, title: 'Arbeitswelten', pages: '70–81', grammar: 'über Arbeit und Freizeit sprechen · Durchsagen verstehen', ar: 'عوالم الشغل' },
  { n: 'P2', title: 'Prüfungstraining 2', pages: '82–85', grammar: 'prüfen und trainieren', ar: 'تدريب على الامتحان' },
  { n: 7, title: 'Ganz schön mobil', pages: '86–97', grammar: 'Gespräche über Verkehrsmittel verstehen', ar: 'تنقّل على طول' },
  { n: 8, title: 'Gelernt ist gelernt!', pages: '98–109', grammar: 'einen Chat über Lernen verstehen', ar: 'اللي اتعلمته اتعلمته' },
  { n: 9, title: 'Sportlich, sportlich', pages: '110–121', grammar: 'über Sportarten sprechen', ar: 'رياضة رياضة' },
  { n: 'P3', title: 'Prüfungstraining 3', pages: '122–125', grammar: 'prüfen und trainieren', ar: 'تدريب على الامتحان' },
  { n: 10, title: 'Zusammen leben', pages: '126–137', grammar: 'Informationen zur Wohnsituation verstehen und geben', ar: 'نعيش مع بعض' },
  { n: 11, title: 'Wie die Zeit vergeht!', pages: '138–149', grammar: 'über Lebensphasen und Aktivitäten sprechen', ar: 'الوقت بيجري!' },
  { n: 12, title: 'Gute Unterhaltung!', pages: '150–161', grammar: 'ein Partnerinterview machen', ar: 'كلام يسلّي' },
  { n: 'P4', title: 'Prüfungstraining 4', pages: '162–165', grammar: 'prüfen und trainieren', ar: 'تدريب على الامتحان' },
]

const empty = (level: string): Chapter[] => [
  { n: 1, title: 'Kapitel 1', pages: '—', grammar: 'in Vorbereitung', ar: 'قيد التجهيز' },
]

export const books: Book[] = [
  { id: 'a1-kb', level: 'A1', kind: 'Kursbuch', title: 'Netzwerk neu A1 · Kursbuch', chapters: a1kb, ready: true, note: 'Interaktive Seiten folgen Kapitel für Kapitel — mit Wort-Taps, Lösungen und Audio.', cover: '/pages/a1-kb/001.jpg' },
  { id: 'a1-ab', level: 'A1', kind: 'Arbeitsbuch', title: 'Netzwerk neu A1 · Arbeitsbuch', chapters: empty('A1'), ready: false },
  { id: 'a2-kb', level: 'A2', kind: 'Kursbuch', title: 'Netzwerk neu A2 · Kursbuch', chapters: a2kb, ready: true, note: 'Interaktive Seiten folgen Kapitel für Kapitel — mit Wort-Taps, Lösungen und Audio.', cover: '/pages/a2-kb/008.jpg' },
  { id: 'a2-ab', level: 'A2', kind: 'Arbeitsbuch', title: 'Netzwerk neu A2 · Arbeitsbuch', chapters: a2ab, ready: true, note: 'Reader – nur Seiten: Kapitel 1–12 und Prüfungstraining 1–4 sind lesbar, Lösungen, Wort-Taps und Audio fehlen noch.', cover: '/covers/a2-ab.webp' },
  { id: 'b1-kb', level: 'B1', kind: 'Kursbuch', title: 'Netzwerk neu B1 · Kursbuch', chapters: empty('B1'), ready: false },
  { id: 'b1-ab', level: 'B1', kind: 'Arbeitsbuch', title: 'Netzwerk neu B1 · Arbeitsbuch', chapters: empty('B1'), ready: false, cover: '/covers/b1-ab.webp' },
]

export const bookById = (id: string) => books.find((b) => b.id === id)
