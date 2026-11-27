import type { ScanPage } from './types'
import { p8 } from './a1-kb/p8'
import { p9 } from './a1-kb/p9'
import { p10 } from './a1-kb/p10'
import { p11 } from './a1-kb/p11'
import { p12 } from './a1-kb/p12'
import { p13 } from './a1-kb/p13'
import { p14 } from './a1-kb/p14'
import { p15 } from './a1-kb/p15'
import { p16 } from './a1-kb/p16'
import { p17 } from './a1-kb/p17'
import { p18 } from './a1-kb/p18'
import { p19 } from './a1-kb/p19'
import { p20 } from './a1-kb/p20'

const registry: Record<string, ScanPage[]> = {
  'a1-kb': [p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20],
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
