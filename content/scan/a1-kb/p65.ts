import type { ScanPage } from '../types'

export const p65: ScanPage = {
  book: 'a1-kb',
  printed: 65,
  chapter: 6,
  image: '/pages/a1-kb/065.jpg',
  width: 1241,
  height: 1753,
  words: [
    { id: 'goals', x: 69, y: 56, w: 980, h: 55, text: 'wichtige Informationen in Texten finden | Veranstaltungstipps im Radio verstehen | Strategie: beim Lesen und Hören wichtige Informationen verstehen', ar: 'تلاقي المعلومات المهمة في النصوص | تفهم نصايح الفعاليات في الراديو | طريقة: تفهم المعلومات المهمة أثناء القراية والسماع' },
    { id: 'p4', x: 36, y: 332, w: 347, h: 358, text: '4', ar: '٤ ريموت التليفزيون (einen Film sehen)' },
    { id: 'p5', x: 396, y: 98, w: 438, h: 443, text: '5', ar: '٥ نظارة شمس (feiern)' },
    { id: 'p6', x: 839, y: 332, w: 296, h: 300, text: '6', ar: '٦ جنط العجلة (Fahrrad fahren)' },
    { id: 'p10', x: 128, y: 749, w: 380, h: 385, text: '10', ar: '١٠ جزم رياضية (Sport/wandern)' },
    { id: 'p11', x: 499, y: 579, w: 297, h: 297, text: '11', ar: '١١ شواية (grillen)' },
    { id: 'p12', x: 806, y: 689, w: 424, h: 443, text: '12', ar: '١٢ نضارة تزلج (Ski fahren)' },
    { id: 'i1c', x: 201, y: 1212, w: 777, h: 55, text: 'Arbeiten Sie zu zweit. Wählen Sie drei Fotos. Notieren Sie zu den Fotos fünf Wörter. Das Wörterbuch hilft. Wer ist zuerst fertig?', ar: 'اشتغلوا اتنين. اختاروا تلات صور. اكتبوا لكل صورة خمس كلمات. القاموس هيساعد. مين هيخلّص الأول؟' },
    { id: 'exc', x: 187, y: 1281, w: 586, h: 33, text: 'einen Film sehen: zu Hause, allein, das Kino, Freunde …', ar: 'يشوف فيلم: في البيت، لوحده، السينما، أصحاب …' },
    { id: 'i2a', x: 201, y: 1350, w: 530, h: 30, text: 'Hören Sie. Um welche Freizeitaktivitäten geht es? Notieren Sie.', ar: 'اسمعوا. بيتكلموا عن أنهي أنشطة فاضي؟ اكتبوا.' },
    { id: 'i2b', x: 201, y: 1501, w: 894, h: 58, text: 'Welche Freizeitaktivitäten mögen Sie? Suchen Sie Fotos und machen Sie Ratebilder oder spielen Sie Pantomime. Die anderen raten.', ar: 'بتحبوا أنهي أنشطة فاضي؟ دوروا على صور واعملوا صور تخمين أو مثّلوا بالإشارة. والباقي يخمّن.' },
    { id: 'exg', x: 201, y: 1570, w: 217, h: 30, text: 'Hörst du gern Musik?', ar: 'بتحب تسمع مزيكا؟' },
    { id: 'exj', x: 633, y: 1570, w: 117, h: 30, text: 'Ja, genau!', ar: 'أيوه، بالظبط!' },
  ],
  audio: [
    { id: 'a2a', x: 73, y: 1350, w: 58, h: 55, src: ['/audio/a1/kb/NWn_A1_KB_Audio_1-086.mp3', '/audio/a1/kb/NWn_A1_KB_Audio_1-087.mp3', '/audio/a1/kb/NWn_A1_KB_Audio_1-088.mp3', '/audio/a1/kb/NWn_A1_KB_Audio_1-089.mp3'], label: '2a' },
  ],
  fields: [
    { id: 'f2a-1', group: 'g2a', x: 195, y: 1391, w: 341, h: 33, label: '1', kind: 'text' },
    { id: 'f2a-2', group: 'g2a', x: 195, y: 1437, w: 341, h: 33, label: '2', kind: 'text' },
    { id: 'f2a-3', group: 'g2a', x: 626, y: 1391, w: 341, h: 33, label: '3', kind: 'text' },
    { id: 'f2a-4', group: 'g2a', x: 626, y: 1437, w: 341, h: 33, label: '4', kind: 'text' },
  ],
  matchings: [],
  groups: [{ id: 'g2a', label: '2a', ar: 'التمرين ٢a' }],
  sentences: [
    { id: 's-exg', text: 'Hörst du gern Musik?', ar: 'بتحب تسمع مزيكا؟', words: ['exg'] },
    { id: 's-exj', text: 'Ja, genau!', ar: 'أيوه، بالظبط!', words: ['exj'] },
  ],
}
