export class SoundManager {
  private context?: AudioContext
  private gains = new Set<GainNode>()

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
    this.gains.add(gain)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(context.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.24)
    window.setTimeout(() => {
      this.gains.delete(gain)
      oscillator.disconnect()
      filter.disconnect()
      gain.disconnect()
    }, 320)
  }

  fadeOut() {
    if (!this.context) {
      return
    }

    const now = this.context.currentTime
    this.gains.forEach((gain) => {
      gain.gain.cancelScheduledValues(now)
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
    })
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
