import { describe, expect, it, vi } from 'vitest'
import {
  clampFishCount,
  DEFAULT_SETTINGS,
  durationToSeconds,
  getSuccessRate,
  isEndlessDuration,
  serializeSessionStats,
  WakeLockController,
} from './session'
import type { SessionStats } from './types'

const baseStats: SessionStats = {
  age: 'adult',
  averageReactionTime: 1.2,
  catches: 2,
  duration: 42,
  favoriteFishType: 'sunny gold',
  fishCount: 1,
  personality: 'curious',
  quietIntervals: 1,
  touches: 4,
}

describe('session settings', () => {
  it('uses 3 minutes and one fish by default', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      age: 'adult',
      duration: 3,
      fishCount: 1,
      personality: 'curious',
    })
  })

  it('supports 3-minute and 5-minute timed sessions', () => {
    expect(durationToSeconds(3)).toBe(180)
    expect(durationToSeconds(5)).toBe(300)
  })

  it('treats endless sessions as untimed', () => {
    expect(durationToSeconds('endless')).toBeNull()
    expect(isEndlessDuration('endless')).toBe(true)
    expect(isEndlessDuration(3)).toBe(false)
  })

  it('constrains fish count to one or two fish', () => {
    expect(clampFishCount(0)).toBe(1)
    expect(clampFishCount(1)).toBe(1)
    expect(clampFishCount(2)).toBe(2)
    expect(clampFishCount(9)).toBe(2)
  })

  it('calculates neutral success rate without ranking the cat', () => {
    expect(getSuccessRate({ catches: 3, touches: 4 })).toBe(0.75)
    expect(getSuccessRate({ catches: 0, touches: 0 })).toBe(0)
  })

  it('serializes endless stats for periodic recovery', () => {
    const parsed = JSON.parse(serializeSessionStats(baseStats))
    expect(parsed).toMatchObject(baseStats)
    expect(typeof parsed.savedAt).toBe('string')
  })
})

describe('wake lock cleanup', () => {
  it('requests and releases a supported screen wake lock', async () => {
    const release = vi.fn().mockResolvedValue(undefined)
    const request = vi.fn().mockResolvedValue({
      addEventListener: vi.fn(),
      release,
    })
    const controller = new WakeLockController()

    await expect(
      controller.request({ wakeLock: { request } } as unknown as Navigator),
    ).resolves.toBe(true)
    expect(controller.isActive()).toBe(true)
    await expect(controller.release()).resolves.toBe(true)
    expect(release).toHaveBeenCalledOnce()
    expect(controller.isActive()).toBe(false)
  })

  it('handles wake-lock failure gracefully', async () => {
    const controller = new WakeLockController()
    const request = vi.fn().mockRejectedValue(new Error('not allowed'))

    await expect(
      controller.request({ wakeLock: { request } } as unknown as Navigator),
    ).resolves.toBe(false)
    expect(controller.isActive()).toBe(false)
    await expect(controller.release()).resolves.toBe(false)
  })
})
