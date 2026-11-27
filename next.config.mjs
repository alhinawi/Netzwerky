// The page registry (content/scan/index.ts) is generated from the page files so
// that page work never edits a shared file. Regenerate on every dev/build.
import { execFileSync } from 'node:child_process'
try {
  execFileSync(process.execPath, ['scripts/build-registry.mjs'], { stdio: 'inherit' })
} catch (err) {
  console.error('build-registry failed', err)
  throw err
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
}
export default nextConfig
