import type {
  FishCount,
  SessionDuration,
  SessionSettings,
  SessionStats,
} from './types'

export const DEFAULT_SETTINGS: SessionSettings = {
  age: 'adult',
  duration: 3,
  fishCount: 1,
  personality: 'curious',
}

export const ENDLESS_STATS_KEY = 'cat-tv:fishing-pond:endless-stats'

export const clampFishCount = (fishCount: number): FishCount =>
  fishCount > 1 ? 2 : 1

export const durationToSeconds = (duration: SessionDuration): number | null =>
  duration === 'endless' ? null : duration * 60

export const isEndlessDuration = (duration: SessionDuration) =>
  duration === 'endless'

export const getSuccessRate = (stats: Pick<SessionStats, 'catches' | 'touches'>) =>
  stats.touches > 0 ? stats.catches / stats.touches : 0

export const serializeSessionStats = (stats: SessionStats) =>
  JSON.stringify({
    ...stats,
    savedAt: new Date().toISOString(),
  })

type WakeLockLike = {
  release: () => Promise<void>
  addEventListener?: (type: 'release', listener: () => void) => void
}

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockLike>
  }
}

export class WakeLockController {
  private lock: WakeLockLike | null = null

  async request(navigatorRef: NavigatorWithWakeLock = navigator) {
    const wakeLock = navigatorRef.wakeLock
    if (!wakeLock || this.lock) {
      return false
    }

    try {
      this.lock = await wakeLock.request('screen')
      this.lock.addEventListener?.('release', () => {
        this.lock = null
      })
      return true
    } catch {
      this.lock = null
      return false
    }
  }

  async release() {
    const currentLock = this.lock
    this.lock = null
    if (!currentLock) {
      return false
    }

    try {
      await currentLock.release()
      return true
    } catch {
      return false
    }
  }

  isActive() {
    return this.lock !== null
  }
}
