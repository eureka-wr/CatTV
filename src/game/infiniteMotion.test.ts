import { describe, expect, it } from 'vitest'
import { gameIds } from './games'
import {
  clampToMovementBounds,
  getMovementBounds,
  pickNextInBoundsTarget,
} from './infiniteMotion'

describe('infinite in-screen movement', () => {
  it('keeps every animal target inside its safe movement band', () => {
    for (const gameId of gameIds) {
      const bounds = getMovementBounds(1280, 800, gameId, 48)
      const target = pickNextInBoundsTarget(
        1280,
        800,
        { x: 640, y: 400 },
        gameId,
        48,
        () => 0.87,
      )

      expect(target.x).toBeGreaterThanOrEqual(bounds.minX)
      expect(target.x).toBeLessThanOrEqual(bounds.maxX)
      expect(target.y).toBeGreaterThanOrEqual(bounds.minY)
      expect(target.y).toBeLessThanOrEqual(bounds.maxY)
    }
  })

  it('starts with a far target on the opposite side of the screen', () => {
    const bounds = getMovementBounds(1000, 640, 'mouse', 40)
    const target = pickNextInBoundsTarget(
      1000,
      640,
      { x: bounds.minX, y: 390 },
      'mouse',
      40,
      () => 0.5,
    )

    expect(target.x).toBe(bounds.maxX)
  })

  it('clamps a held target back into the safe area after a resize', () => {
    const bounds = getMovementBounds(390, 844, 'mouse', 30)

    expect(clampToMovementBounds({ x: -50, y: 1000 }, bounds)).toEqual({
      x: bounds.minX,
      y: bounds.maxY,
    })
  })
})
