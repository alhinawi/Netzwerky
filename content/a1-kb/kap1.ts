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


export const p13: BookPage = {
  id: 'a1-kb-p13',
  printed: 13,
  chapter: 1,
  title: 'Zahlen und Buchstaben',
  blocks: [
    { kind: 'band', chapter: 1, text: 'Zahlen bis 20, Telefonnummer und Mail-Adresse nennen, buchstabieren' },
    { kind: 'title', text: 'Zahlen und Buchstaben', ar: 'الأرقام والحروف' },
    {
      kind: 'exercise',
      id: 'p13-6a',
      label: '6a',
      audio: ['NWn_A1_KB_Audio_1-008.mp3'],
      instruction: 'Die Zahlen. Hören Sie die Zahlen und sprechen Sie dann laut mit.',
      instructionAr: 'الأرقام. اسمع الأرقام وبعدين قولها بصوت عالي.',
      body: [
        {
          kind: 'numbers',
          items: [
            { n: 0, word: 'null' }, { n: 1, word: 'eins' }, { n: 2, word: 'zwei' }, { n: 3, word: 'drei' },
            { n: 4, word: 'vier' }, { n: 5, word: 'fünf' }, { n: 6, word: 'sechs' }, { n: 7, word: 'sieben' },
            { n: 8, word: 'acht' }, { n: 9, word: 'neun' }, { n: 10, word: 'zehn' }, { n: 11, word: 'elf' },
            { n: 12, word: 'zwölf' }, { n: 13, word: 'dreizehn' }, { n: 14, word: 'vierzehn' }, { n: 15, word: 'fünfzehn' },
            { n: 16, word: 'sechzehn' }, { n: 17, word: 'siebzehn' }, { n: 18, word: 'achtzehn' }, { n: 19, word: 'neunzehn' },
            { n: 20, word: 'zwanzig' },
          ],
        },
      ],
    },
    {
      kind: 'note',
      title: 'Zahlen lesen und sprechen',
      titleAr: 'قراءة الأرقام',
      items: [{ de: '14 → vierzehn', ar: 'أربعتاشر: من 13 لـ 19 بنضيف zehn على الرقم' }],
    },
    {
      kind: 'exercise',
      id: 'p13-6b',
      label: '6b',
      audio: ['NWn_A1_KB_Audio_1-009.mp3', 'NWn_A1_KB_Audio_1-010.mp3'],
      instruction: 'Hören Sie. Notieren Sie die Handynummern.',
      instructionAr: 'استمع واكتب أرقام الموبايل.',
      body: [{ kind: 'plain', de: 'Herr Klein: ____________   Frau Groß: ____________', ar: 'مستر كلاين: ... — مدام جروس: ...' }],
    },
    {
      kind: 'exercise',
      id: 'p13-6c',
      label: '6c',
      instruction: 'Fragen Sie Ihren Partner / Ihre Partnerin nach der Telefonnummer. Notieren Sie.',
      instructionAr: 'اسأل زميلك عن رقم تليفونه واكتبه.',
      body: [{ kind: 'plain', de: 'Wie ist deine Telefonnummer? — Null acht … — Wie ist deine Handynummer?', ar: 'رقم تليفونك إيه؟ — صفر تمانية … — رقم موبايلك إيه؟' }],
    },
    {
      kind: 'exercise',
      id: 'p13-7a',
      label: '7a',
      audio: ['NWn_A1_KB_Audio_1-011.mp3'],
      instruction: 'Das Alphabet. Hören Sie zuerst und lesen Sie dann laut mit.',
      instructionAr: 'الحروف الأبجدية. اسمع الأول وبعدين اقرأ بصوت عالي.',
      body: [
        {
          kind: 'alphabet',
          items: [
            { letter: 'Aa', name: 'a' }, { letter: 'Bb', name: 'be' }, { letter: 'Cc', name: 'tse' }, { letter: 'Dd', name: 'de' },
            { letter: 'Ee', name: 'e' }, { letter: 'Ff', name: 'ef' }, { letter: 'Gg', name: 'ge' }, { letter: 'Hh', name: 'ha' },
            { letter: 'Ii', name: 'i' }, { letter: 'Jj', name: 'jot' }, { letter: 'Kk', name: 'ka' }, { letter: 'Ll', name: 'el' },
            { letter: 'Mm', name: 'em' }, { letter: 'Nn', name: 'en' }, { letter: 'Oo', name: 'o' }, { letter: 'Pp', name: 'pe' },
            { letter: 'Qq', name: 'ku' }, { letter: 'Rr', name: 'er' }, { letter: 'Ss', name: 'es' }, { letter: 'Tt', name: 'te' },
            { letter: 'Uu', name: 'u' }, { letter: 'Vv', name: 'fau' }, { letter: 'Ww', name: 'we' }, { letter: 'Xx', name: 'iks' },
            { letter: 'Yy', name: 'ypsilon' }, { letter: 'Zz', name: 'tset' }, { letter: 'Ää', name: 'ä' }, { letter: 'Öö', name: 'ö' },
            { letter: 'Üü', name: 'ü' }, { letter: 'ß', name: 'eszett' },
          ],
        },
      ],
    },
    {
      kind: 'exercise',
      id: 'p13-7b',
      label: '7b',
      audio: ['NWn_A1_KB_Audio_1-012.mp3'],
      instruction: 'Hören Sie das Gespräch. Notieren Sie die E-Mail-Adressen.',
      instructionAr: 'استمع للمحادثة واكتب الإيميلات.',
      body: [{ kind: 'plain', de: 'ruben-gonzalez@…', ar: 'اكتب الإيميل اللي بتسمعه' }],
    },
    {
      kind: 'exercise',
      id: 'p13-7c',
      label: '7c',
      instruction: 'Variieren Sie den Dialog.',
      instructionAr: 'غيّر في الحوار.',
      body: [
        {
          kind: 'lines',
          lines: [
            { speaker: 'o', text: 'Wie heißt du?', ar: 'اسمك إيه؟' },
            { speaker: 'dot', text: 'Alexis Barbos.', ar: 'ألكسيس باربوس.' },
            { speaker: 'o', text: 'Und wie ist deine E-Mail-Adresse?', ar: 'وإيميلك إيه؟' },
            { speaker: 'dot', text: 'alexis_barbos@quinnet.com.', ar: 'alexis_barbos@quinnet.com' },
            { speaker: 'o', text: 'Wie bitte? Kannst du das buchstabieren?', ar: 'نعم؟ تقدر تهجّيها؟' },
            { speaker: 'dot', text: 'A L E …', ar: 'A L E …' },
          ],
        },
      ],
    },
    {
      kind: 'note',
      title: 'E-Mail-Adresse sagen',
      titleAr: 'إزاي تنطق الإيميل',
      items: [
        { de: 'Man schreibt @ — Man sagt ä', ar: '@ بتتقال "آت"' },
        { de: '. Punkt', ar: 'النقطة "بونكت"' },
        { de: '- minus', ar: 'الشرطة "مينوس"' },
        { de: '_ Unterstrich', ar: 'الشرطة السفلية "أونترشتريش"' },
      ],
    },
    {
      kind: 'note',
      title: 'Gut gesagt: Wie bitte?',
      titleAr: 'إزاي تقول: نعم؟ (مفهمتش)',
      items: [
        { de: 'Entschuldigung, noch einmal bitte.', ar: 'لو سمحت، تاني من فضلك.' },
        { de: 'Das verstehe ich nicht.', ar: 'أنا مش فاهم ده.' },
        { de: 'Bitte ein bisschen langsamer.', ar: 'شوية على مهلك من فضلك.' },
      ],
    },
  ],
}

export const pages = [p11, p12, p13]
