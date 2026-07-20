const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function getGeckoCrawlFrameIndex(
  travelledDistance: number,
  geckoSize: number,
  frameCount = 8,
) {
  const safeFrameCount = Math.max(1, Math.floor(frameCount))
  const frameDistance = Math.max(1, geckoSize * 0.22)

  return Math.floor(Math.max(0, travelledDistance) / frameDistance) % safeFrameCount
}

export function getGeckoTravelDuration(distance: number, speed: number) {
  const crawlSpeed = Math.max(24, speed * 0.55)

  return clamp(distance / crawlSpeed, 7, 14)
}
