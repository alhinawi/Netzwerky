import type { ScanPage } from '../types'

export const p13: ScanPage = {
  book: 'a1-kb',
  printed: 13,
  chapter: 1,
  image: '/pages/a1-kb/013.jpg',
  width: 1241,
  height: 1753,
  words: [
    { id: 't', x: 200, y: 176, w: 468, h: 50, text: 'Zahlen und Buchstaben', ar: 'الأرقام والحروف' },
    { id: 'n1', x: 124, y: 296, w: 1018, h: 261, text: 'Zahlen 0–20', ar: 'الأرقام من صفر لعشرين: null, eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn, elf, zwölf, dreizehn … zwanzig' },
    { id: 'h1', x: 867, y: 179, w: 358, h: 151, text: 'Zahlen lesen und sprechen', ar: 'قراءة الأرقام: 14 = vierzehn' },
    { id: 'p1', x: 205, y: 638, w: 130, h: 28, text: 'Herr Klein', ar: 'مستر كلاين — اكتب رقم موبايله من الصوت' },
    { id: 'p2', x: 676, y: 638, w: 130, h: 28, text: 'Frau Groß', ar: 'مدام جروس — اكتب رقم موبايلها من الصوت' },
    { id: 'a1', x: 200, y: 912, w: 945, h: 228, text: 'Das Alphabet', ar: 'الحروف الألمانية بأسمائها: a, be, tse, de, e, ef, ge, ha …' },
    { id: 'm1', x: 205, y: 1200, w: 560, h: 30, text: 'ruben-gonzalez@…', ar: 'اكتب الإيميل اللي بتسمعه' },
    { id: 'e1', x: 866, y: 1178, w: 360, h: 252, text: 'E-Mail-Adresse sagen', ar: '@ بتتقال "آت"، النقطة "بونكت"، الشرطة "مينوس"، الشرطة السفلية "أونترشتريش"' },
    { id: 'g1', x: 866, y: 1445, w: 360, h: 142, text: 'Gut gesagt: Wie bitte?', ar: 'لو مفهمتش: Entschuldigung, noch einmal bitte. / Das verstehe ich nicht. / Bitte ein bisschen langsamer.' },
    { id: 'd1', x: 205, y: 1286, w: 425, h: 218, text: 'Wie heißt du? · Und wie ist deine E-Mail-Adresse?', ar: 'اسمك إيه وإيميلك إيه؟ — Wie bitte? Kannst du das buchstabieren? (نعم؟ تقدر تهجّيها؟)' },
  ],
  audio: [
    { id: 'a6a', x: 66, y: 210, w: 44, h: 42, src: ['NWn_A1_KB_Audio_1-008.mp3'], label: 'Aufgabe 6a hören' },
    { id: 'a6b', x: 66, y: 598, w: 44, h: 42, src: ['NWn_A1_KB_Audio_1-009.mp3', 'NWn_A1_KB_Audio_1-010.mp3'], label: 'Aufgabe 6b hören' },
    { id: 'a7a', x: 66, y: 858, w: 44, h: 42, src: ['NWn_A1_KB_Audio_1-011.mp3'], label: 'Aufgabe 7a hören' },
    { id: 'a7b', x: 66, y: 1178, w: 44, h: 40, src: ['NWn_A1_KB_Audio_1-012.mp3'], label: 'Aufgabe 7b hören' },
    { id: 'a113', x: 826, y: 1492, w: 42, h: 40, src: ['NWn_A1_KB_Audio_1-013.mp3'], label: 'Aufgabe 1.13 hören' },
  ],
  fields: [],
  matchings: [],
  patches: [
    { x: 172, y: 1202, w: 268, h: 66 },
  ],
  groups: [],
  sentences: [
    { id: 's-g1', text: 'Gut gesagt: Wie bitte?', ar: 'لو مفهمتش: Entschuldigung, noch einmal bitte. / Das verstehe ich nicht. / Bitte ein bisschen langsamer.', words: ['g1'] },
    { id: 's-d1', text: 'Wie heißt du? · Und wie ist deine E-Mail-Adresse?', ar: 'اسمك إيه وإيميلك إيه؟ — Wie bitte? Kannst du das buchstabieren? (نعم؟ تقدر تهجّيها؟)', words: ['d1'] },
  ],
}
