/** All audio (book tracks and German pronunciation clips) is served from its own
 *  Cloudflare Pages project, deployed straight from disk and never committed to git.
 *  Absolute URLs so the reader works from the main site and from any preview build. */
export const AUDIO_BASE = (process.env.NEXT_PUBLIC_AUDIO_BASE ?? 'https://netzwerky-audio.pages.dev').replace(/\/+$/, '')

/** Build the URL for an audio path as stored in page data.
 *  Accepts '/audio/a1/kb/x.mp3', 'a1/kb/x.mp3' or a bare 'x.mp3' (relative to `dir`). */
export function audioUrl(path: string, dir?: string): string {
  if (/^https?:\/\//.test(path)) return path
  if (path.startsWith('/audio/')) return AUDIO_BASE + path
  const base = dir ? (dir.startsWith('/audio/') ? dir : `/audio/${dir}`) : '/audio'
  return `${AUDIO_BASE}${base}/${path}`
}
