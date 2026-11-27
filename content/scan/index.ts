import type { ScanPage } from './types'
import { p11 } from './a1-kb/p11'
import { p12 } from './a1-kb/p12'
import { p13 } from './a1-kb/p13'

const registry: Record<string, ScanPage[]> = {
  'a1-kb': [p11, p12, p13],
}

export function pagesOf(book: string): ScanPage[] {
  return registry[book] ?? []
}

export function pageOf(book: string, printed: number): ScanPage | undefined {
  return pagesOf(book).find((p) => p.printed === printed)
}

export function pageNumbers(book: string): number[] {
  return pagesOf(book).map((p) => p.printed)
}
