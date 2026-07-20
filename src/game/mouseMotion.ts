import type { MovementBounds } from './infiniteMotion'

const PAUSE_START = 0.36
const PAUSE_END = 0.44
const PAUSE_TRAVEL = 0.34

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const mouseDirections = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
] as const

export type MouseDirection = (typeof mouseDirections)[number]
export type MouseSpriteKind = 'side' | 'away' | 'toward'

type Point = {
  x: number
  y: number
}

const directionGroup = (direction: MouseDirection) => {
  if (direction === 'left' || direction === 'right') {
    return 'side'
  }
  return direction.startsWith('up') ? 'away' : 'toward'
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function getMouseDirection(dx: number, dy: number): MouseDirection {
  const angle = Math.atan2(dy, dx)
  const sector = Math.round(angle / (Math.PI / 4))
  const normalizedSector = (sector + 8) % 8

  return mouseDirections[normalizedSector]
}

export function getMouseSpriteKind(
  direction: MouseDirection,
): MouseSpriteKind {
  return directionGroup(direction)
}

export function getMouseSpriteRotation(direction: MouseDirection) {
  if (direction === 'up-right') return Math.PI / 4
  if (direction === 'up-left') return -Math.PI / 4
  if (direction === 'down-right') return -Math.PI / 4
  if (direction === 'down-left') return Math.PI / 4
  return 0
}

export function getMousePerspectiveScale(
  y: number,
  minY: number,
  maxY: number,
) {
  const range = Math.max(1, maxY - minY)
  const progress = clamp01((y - minY) / range)
  return 0.8 + progress * 0.32
}

export function pickNextMouseTarget(
  bounds: MovementBounds,
  current: Point,
  previousDirection: MouseDirection | null,
  random: () => number = Math.random,
) {
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  const safeCurrent = {
    x: clamp(current.x, bounds.minX, bounds.maxX),
    y: clamp(current.y, bounds.minY, bounds.maxY),
  }
  const diagonal = Math.SQRT1_2
  const vectors: Record<MouseDirection, Point> = {
    right: { x: 1, y: 0 },
    'down-right': { x: diagonal, y: diagonal },
    down: { x: 0, y: 1 },
    'down-left': { x: -diagonal, y: diagonal },
    left: { x: -1, y: 0 },
    'up-left': { x: -diagonal, y: -diagonal },
    up: { x: 0, y: -1 },
    'up-right': { x: diagonal, y: -diagonal },
  }
  const candidates = mouseDirections.map((direction) => {
    const vector = vectors[direction]
    const distances: number[] = []

    if (vector.x > 0) {
      distances.push((bounds.maxX - safeCurrent.x) / vector.x)
    } else if (vector.x < 0) {
      distances.push((bounds.minX - safeCurrent.x) / vector.x)
    }
    if (vector.y > 0) {
      distances.push((bounds.maxY - safeCurrent.y) / vector.y)
    } else if (vector.y < 0) {
      distances.push((bounds.minY - safeCurrent.y) / vector.y)
    }

    const maximumDistance = Math.min(...distances)
    const distance = Math.max(0, maximumDistance) * (0.72 + random() * 0.24)

    return {
      direction,
      distance,
      target: {
        x: clamp(
          safeCurrent.x + vector.x * distance,
          bounds.minX,
          bounds.maxX,
        ),
        y: clamp(
          safeCurrent.y + vector.y * distance,
          bounds.minY,
          bounds.maxY,
        ),
      },
    }
  })
  const minimumDistance = Math.max(42, Math.min(width, height) * 0.32)
  const viable = candidates.filter(({ distance }) => distance > 1)
  const longRoutes = viable.filter(({ distance }) => distance >= minimumDistance)
  const routePool = longRoutes.length ? longRoutes : viable
  const previousGroup = previousDirection
    ? directionGroup(previousDirection)
    : null
  const varied = previousGroup
    ? routePool.filter(
        ({ direction }) => directionGroup(direction) !== previousGroup,
      )
    : routePool
  const choices = varied.length ? varied : routePool.length ? routePool : candidates
  const selected =
    choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))] ??
    candidates[0]

  return {
    direction: getMouseDirection(
      selected.target.x - current.x,
      selected.target.y - current.y,
    ),
    target: selected.target,
  }
}

export function isMouseTravelPaused(progress: number) {
  const clamped = clamp01(progress)
  return clamped >= PAUSE_START && clamped < PAUSE_END
}

export function getMouseTravelProgress(progress: number) {
  const clamped = clamp01(progress)

  if (clamped < PAUSE_START) {
    return (clamped / PAUSE_START) * PAUSE_TRAVEL
  }

  if (clamped < PAUSE_END) {
    return PAUSE_TRAVEL
  }

  return (
    PAUSE_TRAVEL +
    ((clamped - PAUSE_END) / (1 - PAUSE_END)) * (1 - PAUSE_TRAVEL)
  )
}

export function getMouseResumeProgress(progress: number) {
  return isMouseTravelPaused(progress) ? PAUSE_END : clamp01(progress)
}

export function getMouseRunFrameIndex(
  distanceMoved: number,
  mouseSize: number,
  frameCount = 8,
) {
  const strideLength = Math.max(1, mouseSize * 1.55)
  const phase = (Math.max(0, distanceMoved) % strideLength) / strideLength
  return Math.floor(phase * frameCount) % frameCount
}
