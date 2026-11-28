import { audioUrl } from './audio'

/** German pronunciation clips live on the audio project under /audio/de/, one mp3 per text.
 *  The filename is a slug of the text; scripts/gen_audio.py builds the files
 *  with exactly this rule, so the reader can find a clip without a manifest. */
export function slug(text: string): string {
  const s = text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
  return s || 'x'
}

export const pronounceUrl = (text: string) => audioUrl(`/audio/de/${slug(text)}.mp3`)
