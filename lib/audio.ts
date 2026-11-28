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

/** Cloudflare Pages serves these mp3s without Range support, so the browser marks
 *  the media unseekable and dragging the player's progress bar restarts the track.
 *  Fetching the file once and playing it from a blob: URL makes it fully seekable.
 *  Falls back to the plain URL when the fetch fails. */
const blobs = new Map<string, string>()
const MAX_BLOBS = 6

export async function seekableSrc(url: string): Promise<string> {
  const hit = blobs.get(url)
  if (hit) return hit
  try {
    const res = await fetch(url)
    if (!res.ok) return url
    const obj = URL.createObjectURL(await res.blob())
    blobs.set(url, obj)
    while (blobs.size > MAX_BLOBS) {
      const oldest = blobs.keys().next().value as string
      const old = blobs.get(oldest)
      blobs.delete(oldest)
      if (old) URL.revokeObjectURL(old)
    }
    return obj
  } catch {
    return url
  }
}
