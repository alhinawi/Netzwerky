let ctx: AudioContext | null = null
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext || (window as any).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, gain = 0.12, type: OscillatorType = 'sine') {
  const a = ac()
  if (!a) return
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.value = freq
  const t0 = a.currentTime + start
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.05)
}

export const playCorrect = () => { tone(660, 0, 0.12); tone(880, 0.09, 0.14); tone(1320, 0.2, 0.22) }
export const playWrong = () => { tone(220, 0, 0.18, 0.14, 'triangle'); tone(165, 0.12, 0.26, 0.12, 'triangle') }
export const playTap = () => tone(520, 0, 0.06, 0.06)
