#!/usr/bin/env node
// Generates content/scan/index.ts from the page files on disk.
//
// Every page lives in its own file (content/scan/<book>/p<printed>.ts), so page
// work never needs to edit a shared file: this registry is generated, and it is
// gitignored. It runs automatically before dev/build/typecheck (see
// next.config.mjs and the pre* npm scripts).
import { readdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const scanDir = join(root, 'content', 'scan')
const outFile = join(scanDir, 'index.ts')

const books = readdirSync(scanDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()

const imports = []
const registry = []

for (const book of books) {
  const pages = readdirSync(join(scanDir, book))
    .map((f) => /^p(\d+)\.ts$/.exec(f))
    .filter(Boolean)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b)
  if (pages.length === 0) continue
  const prefix = book.replace(/[^a-zA-Z0-9]/g, '_')
  for (const printed of pages) {
    imports.push(`import { p${printed} as ${prefix}_${printed} } from './${book}/p${printed}'`)
  }
  registry.push(`  '${book}': [${pages.map((p) => `${prefix}_${p}`).join(', ')}],`)
}

const source = `// GENERATED FILE - do not edit, do not commit. Run: node scripts/build-registry.mjs
import type { ScanPage } from './types'
${imports.join('\n')}

const registry: Record<string, ScanPage[]> = {
${registry.join('\n')}
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

export function books(): string[] {
  return Object.keys(registry)
}
`

const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : ''
if (current !== source) {
  writeFileSync(outFile, source)
  console.log(`build-registry: wrote ${outFile} (${registry.length} book(s))`)
} else {
  console.log('build-registry: up to date')
}
