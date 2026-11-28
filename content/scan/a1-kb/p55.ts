import type { ScanPage } from '../types'

export const p55: ScanPage = {
  book: 'a1-kb',
  printed: 55,
  chapter: 5,
  image: '/pages/a1-kb/055.jpg',
  width: 1241,
  height: 1753,
  words: [
    { id: 'lw', x: 981, y: 506, w: 154, h: 99, text: 'Lernen · Wissen', ar: 'تعلّم · معرفة' },
    { id: 't1b', x: 199, y: 1015, w: 498, h: 28, text: 'Arbeiten Sie zu zweit und sprechen Sie abwechselnd.', ar: 'اشتغلوا اتنين واتكلموا بالدور.' },
    { id: 'b1', x: 248, y: 1065, w: 312, h: 30, text: 'Am Sonntag schläft Kaan lange.', ar: 'يوم الحد كان بينام كتير.' },
    { id: 'b2', x: 757, y: 1065, w: 58, h: 30, text: 'Er …', ar: 'هو …' },
    { id: 't3a', x: 199, y: 1150, w: 770, h: 28, text: 'Und Ihr Tag? Erzählen Sie. Die anderen raten: Ist das am Wochenende oder nicht?', ar: 'ويومكم انتوا؟ احكوا. والباقي يخمّن: ده في الويك إند ولا لأ؟' },
    { id: 'b3a1', x: 242, y: 1198, w: 457, h: 72, text: 'Morgens trinke ich einen Kaffee und esse Müsli mit Obst. Dann gehe ich ins Büro …', ar: 'الصبح بشرب قهوة وبياكل ميوزلي بالفاكهة. بعدين بروح المكتب …' },
    { id: 'b3a2', x: 788, y: 1219, w: 292, h: 33, text: 'Das ist nicht am Wochenende!', ar: 'ده مش في الويك إند!' },
    { id: 't3b', x: 199, y: 1315, w: 938, h: 52, text: 'Montag, Dienstag, Mittwoch … Mein Tag. Machen Sie fünf Fotos zu einem Tag und schreiben Sie zu jedem Foto einen Satz. Präsentieren Sie in Gruppen.', ar: 'الاتنين والتلات والأربع … يومي. اعملوا خمس صور ليوم واحد واكتبوا جملة لكل صورة. قدّموها في جروبات.' },
    { id: 'b3b', x: 224, y: 1409, w: 413, h: 33, text: 'Mein Samstag ist super: Ich frühstücke und …', ar: 'يوم السبت بتاعي جميل: بفطر و …' },
  ],
  audio: [],
  fields: [
    { id: 'f1b-C', group: 'g1b', x: 330, y: 901, w: 33, h: 39, label: 'Foto C', kind: 'text' },
    { id: 'f1b-D', group: 'g1b', x: 759, y: 581, w: 33, h: 39, label: 'Foto D', kind: 'text' },
    { id: 'f1b-E', group: 'g1b', x: 860, y: 438, w: 33, h: 39, label: 'Foto E', kind: 'text' },
    { id: 'f1b-F', group: 'g1b', x: 764, y: 915, w: 33, h: 39, label: 'Foto F', kind: 'text' },
    { id: 'f1b-G', group: 'g1b', x: 860, y: 915, w: 33, h: 39, label: 'Foto G', kind: 'text' },
  ],
  matchings: [],
  groups: [{ id: 'g1b', label: '1b', ar: 'التمرين ١b' }],
  sentences: [
    { id: 's-b1', text: 'Am Sonntag schläft Kaan lange.', ar: 'يوم الحد كان بينام كتير.', words: ['b1'] },
    { id: 's-b3a1', text: 'Morgens trinke ich einen Kaffee und esse Müsli mit Obst. Dann gehe ich ins Büro …', ar: 'الصبح بشرب قهوة وبياكل ميوزلي بالفاكهة. بعدين بروح المكتب …', words: ['b3a1'] },
    { id: 's-b3b', text: 'Mein Samstag ist super: Ich frühstücke und …', ar: 'يوم السبت بتاعي جميل: بفطر و …', words: ['b3b'] },
  ],
}
