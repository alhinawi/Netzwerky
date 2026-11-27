import type { BookPage } from '../types'

export const p11: BookPage = {
  id: 'a1-kb-p11',
  printed: 11,
  chapter: 1,
  title: 'Guten Tag! Auf Wiedersehen!',
  blocks: [
    { kind: 'band', chapter: 1, text: 'grüßen, sich und andere vorstellen, verabschieden' },
    { kind: 'title', text: 'Guten Tag! Auf Wiedersehen!', ar: 'صباح الخير! إلى اللقاء!' },
    {
      kind: 'exercise',
      id: 'p11-3a',
      label: '3a',
      audio: ['NWn_A1_KB_Audio_1-004.mp3', 'NWn_A1_KB_Audio_1-005.mp3', 'NWn_A1_KB_Audio_1-006.mp3'],
      instruction: 'Guten Tag. Wie heißen Sie? Hören Sie und lesen Sie. Wie heißen die Personen?',
      instructionAr: 'استمع واقرأ. إيه أسماء الأشخاص؟',
      body: [
        {
          kind: 'photos',
          items: [
            { src: '/img/a1/k1/p11-a.jpg', label: 'A' },
            { src: '/img/a1/k1/p11-b.jpg', label: 'B' },
            { src: '/img/a1/k1/p11-c.jpg', label: 'C' },
          ],
        },
        {
          kind: 'lines',
          lines: [
            { speaker: 'o', text: 'Guten Morgen. Mein Name ist Nina Weber.', ar: 'صباح الخير. اسمي نينا فيبر.' },
            { speaker: 'dot', text: 'Guten Morgen, Frau Weber! Ich heiße Oliver Hansen.', ar: 'صباح الخير يا مدام فيبر! أنا اسمي أوليفر هانزن.' },
            { speaker: 'o', text: 'Guten Tag, Frau Kowalski.', ar: 'نهارك سعيد يا مدام كوفالسكي.' },
            { speaker: 'tri', text: 'Guten Tag, Frau Weber. Wie geht es Ihnen?', ar: 'نهارك سعيد يا مدام فيبر. إزيك؟' },
            { speaker: 'o', text: 'Danke, gut. Und Ihnen?', ar: 'شكرًا، بخير. وانت؟' },
            { speaker: 'tri', text: 'Auch gut, danke.', ar: 'بخير كمان، شكرًا.' },
            { speaker: 'dot', text: 'Hallo Frau Weber.', ar: 'أهلًا يا مدام فيبر.' },
            { speaker: 'o', text: 'Hallo Herr Hansen. Das ist Frau Kowalski.', ar: 'أهلًا يا مستر هانزن. دي مدام كوفالسكي.' },
            { speaker: 'dot', text: 'Guten Tag, Frau Kowalski. Mein Name ist Oliver Hansen.', ar: 'نهارك سعيد يا مدام كوفالسكي. اسمي أوليفر هانزن.' },
            { speaker: 'tri', text: 'Guten Tag! Entschuldigung, wie heißen Sie?', ar: 'نهارك سعيد! لو سمحت، اسمك إيه؟' },
            { speaker: 'dot', text: 'Oliver Hansen.', ar: 'أوليفر هانزن.' },
            { speaker: 'tri', text: 'Auf Wiedersehen, Herr Hansen. Tschüs, Frau Weber.', ar: 'إلى اللقاء يا مستر هانزن. باي يا مدام فيبر.' },
            { speaker: 'dot', text: 'Auf Wiedersehen, Frau Kowalski.', ar: 'إلى اللقاء يا مدام كوفالسكي.' },
            { speaker: 'o', text: 'Auf Wiedersehen!', ar: 'إلى اللقاء!' },
          ],
        },
      ],
    },
    {
      kind: 'note',
      title: 'Guten Morgen · Guten Tag · Guten Abend · Gute Nacht',
      titleAr: 'تحيات اليوم',
      items: [
        { de: 'Guten Morgen!', ar: 'صباح الخير (الصبح بدري)' },
        { de: 'Guten Tag!', ar: 'نهارك سعيد (طول النهار)' },
        { de: 'Guten Abend!', ar: 'مساء الخير (بعد المغرب)' },
        { de: 'Gute Nacht!', ar: 'تصبح على خير (قبل النوم)' },
      ],
    },
    {
      kind: 'exercise',
      id: 'p11-3b',
      label: '3b',
      instruction: 'Guten Tag. Auf Wiedersehen. Spielen Sie die Situationen.',
      instructionAr: 'مثّل المواقف دي مع زميلك.',
      body: [
        {
          kind: 'lines',
          lines: [
            { text: 'Guten Tag! Mein Name ist … / Ich heiße … Wie heißen Sie?', ar: 'نهارك سعيد! اسمي … / أنا اسمي … اسمك إيه؟' },
            { text: 'Das ist Frau … / Herr …', ar: 'دي مدام … / ده مستر …' },
            { text: 'Wie geht es Ihnen? – Danke, gut! Und Ihnen? – Auch gut, danke.', ar: 'إزيك؟ – بخير، شكرًا! وانت؟ – بخير كمان، شكرًا.' },
            { text: 'Auf Wiedersehen!', ar: 'إلى اللقاء!' },
          ],
        },
      ],
    },
    {
      kind: 'grammar',
      title: 'Verben und Personalpronomen',
      titleAr: 'الأفعال والضمائر',
      head: ['', 'heißen', 'sein'],
      rows: [
        ['ich', 'heiße', 'bin'],
        ['du', 'heißt', 'bist'],
        ['Sie', 'heißen', 'sind'],
      ],
    },
    {
      kind: 'note',
      title: 'du und Sie',
      titleAr: 'الفرق بين du و Sie',
      items: [
        { de: 'informell: du + Vorname — Wie heißt du? Ich heiße Nina. Wer bist du? Ich bin Nina.', ar: 'غير رسمي: du مع الاسم الأول — اسمك إيه؟ أنا نينا. انت مين؟ أنا نينا.' },
        { de: 'formell: Sie + Vorname + Nachname — Wie heißen Sie? Mein Name ist Nina Weber. Wie ist Ihr Name? Ich heiße Nina Weber.', ar: 'رسمي: Sie مع الاسم الأول والعيلة — اسم حضرتك إيه؟ اسمي نينا فيبر.' },
      ],
    },
  ],
}

export const p12: BookPage = {
  id: 'a1-kb-p12',
  printed: 12,
  chapter: 1,
  title: 'Woher kommen Sie?',
  blocks: [
    { kind: 'band', chapter: 1, text: 'über sich und andere sprechen' },
    { kind: 'title', text: 'Woher kommen Sie?', ar: 'انت منين؟' },
    {
      kind: 'exercise',
      id: 'p12-4a',
      label: '4a',
      audio: ['NWn_A1_KB_Audio_1-007.mp3'],
      instruction: 'Lesen Sie und hören Sie. Ordnen Sie die Antworten zu.',
      instructionAr: 'اقرأ واستمع. وصّل كل سؤال بالإجابة بتاعته.',
      checkable: true,
      body: [
        { kind: 'photos', items: [{ src: '/img/a1/k1/p12-selina.jpg', caption: 'Selina Lang · Reiseführerin · Ludwigstraße 39, 60327 Frankfurt · selina@langguide.de' }] },
        {
          kind: 'match',
          pairs: [
            { left: '1. Woher kommen Sie, Frau Lang?', right: 'B Ich komme aus Deutschland.' },
            { left: '2. Welche Sprachen sprechen Sie?', right: 'A Ich spreche Spanisch, Englisch und Deutsch.' },
            { left: '3. Wo wohnen Sie?', right: 'C Ich wohne in Frankfurt.' },
          ],
          options: [
            'A Ich spreche Spanisch, Englisch und Deutsch.',
            'B Ich komme aus Deutschland.',
            'C Ich wohne in Frankfurt.',
          ],
        },
      ],
    },
    {
      kind: 'exercise',
      id: 'p12-4b',
      label: '4b',
      instruction: 'Variieren Sie den Dialog.',
      instructionAr: 'غيّر في الحوار.',
      body: [
        {
          kind: 'lines',
          lines: [
            { speaker: 'o', text: 'Wie heißt du?', ar: 'اسمك إيه؟' },
            { speaker: 'dot', text: 'Ich heiße Jan.', ar: 'أنا اسمي يان.' },
            { speaker: 'o', text: 'Woher kommst du?', ar: 'انت منين؟' },
            { speaker: 'dot', text: 'Aus Frankfurt.', ar: 'من فرانكفورت.' },
            { speaker: 'o', text: 'Und wo wohnst du?', ar: 'وساكن فين؟' },
            { speaker: 'dot', text: 'In Zürich.', ar: 'في زيورخ.' },
          ],
        },
      ],
    },
    {
      kind: 'exercise',
      id: 'p12-4c',
      label: '4c',
      instruction: 'Lesen Sie und ergänzen Sie die Verben.',
      instructionAr: 'اقرأ وكمّل الأفعال.',
      checkable: true,
      body: [
        {
          kind: 'gaps',
          items: [
            { before: 'Das ist Frau Lang. Sie', answer: 'kommt', after: 'aus Deutschland.', ar: 'دي مدام لانج. هي جاية من ألمانيا.' },
            { before: 'Sie', answer: 'wohnt', after: 'in Frankfurt.', ar: 'هي ساكنة في فرانكفورت.' },
            { before: 'Jan', answer: 'kommt', after: 'aus Frankfurt.', ar: 'يان جاي من فرانكفورت.' },
            { before: 'Er', answer: 'wohnt', after: 'in Zürich.', ar: 'هو ساكن في زيورخ.' },
          ],
        },
      ],
    },
    {
      kind: 'grammar',
      title: 'W-Frage und Aussagesatz',
      titleAr: 'السؤال بأداة الاستفهام والجملة الخبرية',
      head: ['W-Frage', 'Aussagesatz'],
      rows: [
        ['Wie heißt du?', 'ich heiße Jan.'],
        ['Wo wohnst du?', 'ich wohne in Zürich.'],
        ['Woher kommst du?', 'Ich komme aus Frankfurt.'],
      ],
    },
    {
      kind: 'grammar',
      title: 'Verben und Personalpronomen',
      titleAr: 'الأفعال والضمائر',
      head: ['', 'wohnen', 'kommen', 'sein'],
      rows: [
        ['ich', 'wohne', 'komme', 'bin'],
        ['du', 'wohnst', 'kommst', 'bist'],
        ['er/sie', 'wohnt', 'kommt', 'ist'],
        ['Sie', 'wohnen', 'kommen', 'sind'],
      ],
    },
    {
      kind: 'exercise',
      id: 'p12-5a',
      label: '5a',
      audio: ['NWn_A1_KB_Audio_1-008.mp3'],
      instruction: 'Und Sie? Machen Sie zwei Interviews wie in 4b: formell und informell. Notieren Sie.',
      instructionAr: 'وانت؟ اعمل مقابلة رسمية وواحدة غير رسمية زي 4b، واكتب.',
      body: [
        { kind: 'plain', de: 'Name? — Woher? — Wo?', ar: 'الاسم؟ — منين؟ — ساكن فين؟' },
      ],
    },
    {
      kind: 'exercise',
      id: 'p12-5b',
      label: '5b',
      instruction: 'Wer ist das? Stellen Sie einen Partner / eine Partnerin vor. Die anderen raten den Namen.',
      instructionAr: 'مين ده؟ قدّم زميلك، والباقي يخمّن الاسم.',
      body: [
        { kind: 'plain', de: 'Sie kommt aus Valencia. Sie wohnt … — Das ist Ana Cristina.', ar: 'هي جاية من فالنسيا. ساكنة في … — دي آنا كريستينا.' },
      ],
    },
  ],
}

export const pages = [p11, p12]
