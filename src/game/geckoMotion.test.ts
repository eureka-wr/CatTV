import { describe, expect, it } from 'vitest'
import {
  getGeckoCrawlFrameIndex,
  getGeckoTravelDuration,
} from './geckoMotion'

describe('realistic gecko motion', () => {
  it('advances animation from travelled distance instead of elapsed time', () => {
    expect(getGeckoCrawlFrameIndex(0, 40)).toBe(0)
    expect(getGeckoCrawlFrameIndex(8.7, 40)).toBe(0)
    expect(getGeckoCrawlFrameIndex(8.8, 40)).toBe(1)
  })

  it('loops through all eight slow-crawl frames', () => {
    const frameDistance = 40 * 0.22
    const frames = Array.from({ length: 8 }, (_, index) =>
      getGeckoCrawlFrameIndex(index * frameDistance + 0.01, 40),
    )

    expect(frames).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(getGeckoCrawlFrameIndex(frameDistance * 8, 40)).toBe(0)
  })

  it('keeps wall crawling deliberately slow without creating endless paths', () => {
    expect(getGeckoTravelDuration(100, 58)).toBe(7)
    expect(getGeckoTravelDuration(320, 58)).toBeCloseTo(10.03, 2)
    expect(getGeckoTravelDuration(900, 58)).toBe(14)
  })
})
