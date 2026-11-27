export type Box = { x: number; y: number; w: number; h: number }

export type ScanWord = Box & { id: string; text: string; ar: string }
export type ScanAudio = Box & { id: string; src: string[]; label: string }
export type ScanField = Box & {
  id: string
  group: string
  answer: string
  label?: string
  kind?: 'text' | 'select'
  options?: string[]
}
export type ScanMatchItem = Box & { text: string }
export type ScanMatching = {
  id: string
  group: string
  left: ScanMatchItem[]
  right: ScanMatchItem[]
  answers: string[]
}
export type ScanGroup = { id: string; label: string; ar: string }

export type ScanPage = {
  book: string
  printed: number
  chapter: number
  image: string
  width: number
  height: number
  words: ScanWord[]
  audio: ScanAudio[]
  fields: ScanField[]
  matchings: ScanMatching[]
  groups: ScanGroup[]
}
