import type { GameId } from './games'

export type MovementBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

type Point = {
  x: number
  y: number
}

const verticalBands: Record<GameId, [number, number]> = {
  fish: [0.2, 0.8],
  mouse: [0.46, 0.76],
  dragonfly: [0.18, 0.64],
  butterfly: [0.2, 0.62],
  bird: [0.2, 0.56],
  cricket: [0.62, 0.82],
  frog: [0.46, 0.78],
  gecko: [0.24, 0.76],
  beetle: [0.62, 0.82],
  snake: [0.62, 0.8],
  squirrel: [0.22, 0.54],
  firefly: [0.18, 0.66],
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function getMovementBounds(
  width: number,
  height: number,
  gameId: GameId,
  targetSize: number,
): MovementBounds {
  const safeWidth = Math.max(1, width)
  const safeHeight = Math.max(1, height)
  const horizontalMargin = Math.min(
    safeWidth * 0.28,
    Math.max(34, targetSize * 2.3),
  )
  const verticalMargin = Math.min(
    safeHeight * 0.22,
    Math.max(24, targetSize * 1.15),
  )
  const [minRatio, maxRatio] = verticalBands[gameId]
  const minX = Math.min(safeWidth / 2, horizontalMargin)
  const maxX = Math.max(safeWidth / 2, safeWidth - horizontalMargin)
  const rawMinY = Math.max(verticalMargin, safeHeight * minRatio)
  const rawMaxY = Math.min(safeHeight - verticalMargin, safeHeight * maxRatio)
  const centerY = safeHeight * ((minRatio + maxRatio) / 2)

  return {
    minX,
    maxX,
    minY: Math.min(rawMinY, centerY),
    maxY: Math.max(rawMaxY, centerY),
  }
}

export function clampToMovementBounds(
  point: Point,
  bounds: MovementBounds,
): Point {
  return {
    x: clamp(point.x, bounds.minX, bounds.maxX),
    y: clamp(point.y, bounds.minY, bounds.maxY),
  }
}

export function pickNextInBoundsTarget(
  width: number,
  height: number,
  current: Point,
  gameId: GameId,
  targetSize: number,
  random: () => number = Math.random,
): Point {
  const bounds = getMovementBounds(width, height, gameId, targetSize)
  const safeCurrent = clampToMovementBounds(current, bounds)
  const midpointX = (bounds.minX + bounds.maxX) / 2
  const oppositeX = safeCurrent.x <= midpointX ? bounds.maxX : bounds.minX
  const randomY = () => bounds.minY + random() * (bounds.maxY - bounds.minY)
  let best = { x: oppositeX, y: randomY() }
  let bestDistance = Math.hypot(
    best.x - safeCurrent.x,
    best.y - safeCurrent.y,
  )

  for (let index = 0; index < 8; index += 1) {
    const candidate = {
      x: bounds.minX + random() * (bounds.maxX - bounds.minX),
      y: randomY(),
    }
    const distance = Math.hypot(
      candidate.x - safeCurrent.x,
      candidate.y - safeCurrent.y,
    )
    if (distance > bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }

  return best
}
