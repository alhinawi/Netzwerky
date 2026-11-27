export type Line = { speaker?: 'o' | 'tri' | 'dot'; text: string; ar: string; audio?: string }

export type Body =
  | { kind: 'lines'; lines: Line[] }
  | { kind: 'photos'; items: { src: string; label?: string; caption?: string }[] }
  | { kind: 'match'; pairs: { left: string; right: string }[]; options: string[] }
  | { kind: 'gaps'; items: { before: string; answer: string; after: string; ar: string }[] }
  | { kind: 'plain'; de: string; ar?: string }
  | { kind: 'play'; label: string; audio: string }

export type Block =
  | { kind: 'band'; chapter: number; text: string }
  | { kind: 'title'; text: string; ar?: string }
  | {
      kind: 'exercise'
      id: string
      label: string
      audio?: string[]
      instruction: string
      instructionAr: string
      checkable?: boolean
      body: Body[]
    }
  | { kind: 'grammar'; title: string; titleAr: string; head: string[]; rows: string[][]; note?: string }
  | { kind: 'note'; title: string; titleAr: string; items: { de: string; ar: string }[] }

export type BookPage = {
  id: string
  printed: number
  chapter: number
  title: string
  blocks: Block[]
}
