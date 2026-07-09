export class SoundManager {
  private context?: AudioContext

  playSplash(intensity: number) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) {
      return
    }

    this.context ??= new AudioContextClass()
    const context = this.context
    const now = context.currentTime
    const gain = context.createGain()
    const oscillator = context.createOscillator()
    const filter = context.createBiquadFilter()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(240, now)
    oscillator.frequency.exponentialRampToValueAtTime(90, now + 0.16)
    filter.type = 'lowpass'
    filter.frequency.value = 900
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08 * intensity, now + 0.018)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.24)
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
