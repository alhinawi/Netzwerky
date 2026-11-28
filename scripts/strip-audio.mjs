// Audio is deployed to its own Cloudflare Pages project (netzwerky-audio) straight
// from disk, so the main deployment does not carry it. The files stay in the repo
// (public/audio) — only the exported output drops them. A build without out/audio
// keeps the main project far under the 20,000-file deployment limit.
import { rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const dir = new URL('../out/audio/', import.meta.url)
if (existsSync(dir)) {
  await rm(dir, { recursive: true, force: true })
  console.log('strip-audio: removed out/audio from the deployment output')
} else {
  console.log('strip-audio: no out/audio to remove')
}
