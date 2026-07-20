import { describe, expect, it } from 'vitest'
import {
  getMouseDirection,
  getMousePerspectiveScale,
  getMouseResumeProgress,
  getMouseRunFrameIndex,
  getMouseSpriteKind,
  getMouseSpriteRotation,
  getMouseTravelProgress,
  isMouseTravelPaused,
  mouseDirections,
  pickNextMouseTarget,
} from './mouseMotion'

describe('mouse motion', () => {
  it('keeps travel still during the mid-run sniff pause', () => {
    expect(getMouseTravelProgress(0.36)).toBeCloseTo(0.34)
    expect(getMouseTravelProgress(0.4)).toBeCloseTo(0.34)
    expect(getMouseTravelProgress(0.44)).toBeCloseTo(0.34)
    expect(isMouseTravelPaused(0.4)).toBe(true)
    expect(isMouseTravelPaused(0.5)).toBe(false)
  })

  it('still reaches the edge at the end of the round', () => {
    expect(getMouseTravelProgress(0)).toBe(0)
    expect(getMouseTravelProgress(1)).toBe(1)
  })

  it('resumes immediately if the cat releases during the sniff pause', () => {
    expect(getMouseResumeProgress(0.4)).toBe(0.44)
    expect(getMouseResumeProgress(0.62)).toBe(0.62)
  })

  it('advances running frames from distance and loops by stride', () => {
    expect(getMouseRunFrameIndex(0, 40)).toBe(0)
    expect(getMouseRunFrameIndex(40 * 1.55, 40)).toBe(0)
    expect(getMouseRunFrameIndex((40 * 1.55) / 2, 40)).toBe(4)
  })

  it('classifies horizontal, vertical, and diagonal routes', () => {
    expect(getMouseDirection(10, 0)).toBe('right')
    expect(getMouseDirection(10, 10)).toBe('down-right')
    expect(getMouseDirection(0, 10)).toBe('down')
    expect(getMouseDirection(-10, 10)).toBe('down-left')
    expect(getMouseDirection(-10, 0)).toBe('left')
    expect(getMouseDirection(-10, -10)).toBe('up-left')
    expect(getMouseDirection(0, -10)).toBe('up')
    expect(getMouseDirection(10, -10)).toBe('up-right')
  })

  it('uses viewpoint-specific sheets and diagonal rotations', () => {
    expect(getMouseSpriteKind('right')).toBe('side')
    expect(getMouseSpriteKind('up')).toBe('away')
    expect(getMouseSpriteKind('down-left')).toBe('toward')
    expect(getMouseSpriteRotation('up-right')).toBeCloseTo(Math.PI / 4)
    expect(getMouseSpriteRotation('down-left')).toBeCloseTo(Math.PI / 4)
    expect(getMouseSpriteRotation('right')).toBe(0)
  })

  it('appears larger when it moves closer to the bottom of the meadow', () => {
    expect(getMousePerspectiveScale(300, 300, 600)).toBeCloseTo(0.8)
    expect(getMousePerspectiveScale(600, 300, 600)).toBeCloseTo(1.12)
  })

  it('selects in-bounds routes and varies the viewing direction', () => {
    const bounds = { minX: 100, maxX: 900, minY: 300, maxY: 600 }
    const current = { x: 500, y: 450 }
    const first = pickNextMouseTarget(bounds, current, null, () => 0)
    const next = pickNextMouseTarget(bounds, current, first.direction, () => 0)

    expect(first.direction).toBe('right')
    expect(getMouseSpriteKind(next.direction)).not.toBe(
      getMouseSpriteKind(first.direction),
    )
    expect(next.target.x).toBeGreaterThanOrEqual(bounds.minX)
    expect(next.target.x).toBeLessThanOrEqual(bounds.maxX)
    expect(next.target.y).toBeGreaterThanOrEqual(bounds.minY)
    expect(next.target.y).toBeLessThanOrEqual(bounds.maxY)
  })

  it('can deliberately select every one of the eight directions', () => {
    const bounds = { minX: 100, maxX: 900, minY: 300, maxY: 600 }
    const current = { x: 500, y: 450 }

    mouseDirections.forEach((expectedDirection, directionIndex) => {
      let randomCall = 0
      const route = pickNextMouseTarget(bounds, current, null, () => {
        randomCall += 1
        return randomCall <= mouseDirections.length
          ? 0.5
          : (directionIndex + 0.01) / mouseDirections.length
      })

      expect(route.direction).toBe(expectedDirection)
    })
  })
})
