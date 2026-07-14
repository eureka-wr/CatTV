import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { getDifficultyConfig } from '../game/difficultyConfig'
import { SoundManager } from '../game/SoundManager'
import {
  durationToSeconds,
  ENDLESS_STATS_KEY,
  isEndlessDuration,
  serializeSessionStats,
  WakeLockController,
} from '../game/session'
import { copy } from '../i18n'
import type { DifficultyConfig, Language, SessionSettings, SessionStats } from '../game/types'
import type { GameId } from '../game/games'

type Props = {
  gameId: GameId
  settings: SessionSettings
  language: Language
  onLanguageChange: (language: Language) => void
  paused: boolean
  onPauseToggle: () => void
  onPreviousGame: () => void
  onNextGame: () => void
  onStop: (stats: SessionStats) => void
}

type PondDecoration = {
  x: number
  y: number
  scale: number
  kind: 'plant' | 'rock' | 'lily'
}

type RoundPhase = 'cue' | 'target' | 'reward' | 'miss'

type Round = {
  id: number
  phase: RoundPhase
  phaseStartedAt: number
  spawnX: number
  spawnY: number
  targetX: number
  targetY: number
  controlX: number
  controlY: number
  fishX: number
  fishY: number
  fishSize: number
  fishType: string
  gameId: GameId
  color: string
  accent: string
  bubbleDuration: number
  swimDuration: number
  rewardUntil: number
  missUntil: number
  bornAt: number
}

type SimpleRipple = {
  id: number
  x: number
  y: number
  age: number
  maxAge: number
  kind: 'tap' | 'catch' | 'bubble' | 'reward'
}

const fishTypes = [
  { type: 'sunny gold', color: '#ffd54d', accent: '#fff2a6' },
  { type: 'moon blue', color: '#6fe3ff', accent: '#f4fdff' },
  { type: 'white flash', color: '#fff9d8', accent: '#ffe66b' },
  { type: 'deep teal', color: '#57d8ca', accent: '#f7ff9b' },
]

const targetStyles: Record<GameId, { type: string; color: string; accent: string }> = {
  fish: fishTypes[0],
  mouse: { type: 'field mouse', color: '#b9c7d0', accent: '#f7fbfd' },
  dragonfly: { type: 'blue dragonfly', color: '#3ecfb5', accent: '#d6faff' },
  butterfly: { type: 'painted butterfly', color: '#ff9bd1', accent: '#ffe36f' },
  bird: { type: 'small bird', color: '#79c9ff', accent: '#fff6a8' },
  cricket: { type: 'green cricket', color: '#72d25d', accent: '#fff0a5' },
  frog: { type: 'pond frog', color: '#72c85c', accent: '#eaff8f' },
  gecko: { type: 'wall gecko', color: '#8fd6a6', accent: '#fff2a6' },
  beetle: { type: 'leaf beetle', color: '#4f8c56', accent: '#f2d15f' },
  snake: { type: 'grass snake', color: '#77b35a', accent: '#fff0a5' },
  squirrel: { type: 'tree squirrel', color: '#c98a4f', accent: '#ffe7a7' },
  firefly: { type: 'firefly', color: '#d7ff55', accent: '#ffffff' },
}

type GameProfile = {
  scene: 'pond' | 'meadow' | 'air' | 'flowers' | 'branch' | 'night' | 'wall' | 'leaves' | 'sand'
  movement: 'swim' | 'run' | 'flutter' | 'dash' | 'hop' | 'crawl' | 'skitter' | 'slither' | 'blink'
  pace: number
  size: number
  cueDuration: [number, number]
}

const gameProfiles: Record<GameId, GameProfile> = {
  fish: { scene: 'pond', movement: 'swim', pace: 0.78, size: 1.34, cueDuration: [1.45, 2.35] },
  mouse: { scene: 'meadow', movement: 'run', pace: 0.7, size: 1.34, cueDuration: [1.35, 2.15] },
  dragonfly: { scene: 'air', movement: 'flutter', pace: 0.66, size: 1.12, cueDuration: [1.25, 2.05] },
  butterfly: { scene: 'flowers', movement: 'flutter', pace: 0.64, size: 1.22, cueDuration: [1.25, 2] },
  bird: { scene: 'branch', movement: 'dash', pace: 0.6, size: 1.18, cueDuration: [1.15, 1.9] },
  cricket: { scene: 'meadow', movement: 'hop', pace: 0.56, size: 1.08, cueDuration: [1.05, 1.85] },
  frog: { scene: 'pond', movement: 'hop', pace: 0.54, size: 1.18, cueDuration: [1.05, 1.75] },
  gecko: { scene: 'wall', movement: 'crawl', pace: 0.5, size: 1.02, cueDuration: [0.95, 1.7] },
  beetle: { scene: 'leaves', movement: 'skitter', pace: 0.48, size: 0.96, cueDuration: [0.9, 1.6] },
  snake: { scene: 'sand', movement: 'slither', pace: 0.44, size: 1.05, cueDuration: [0.85, 1.5] },
  squirrel: { scene: 'branch', movement: 'dash', pace: 0.42, size: 1.04, cueDuration: [0.8, 1.45] },
  firefly: { scene: 'night', movement: 'blink', pace: 0.4, size: 0.86, cueDuration: [0.75, 1.35] },
}

const getProfile = (gameId: GameId) => gameProfiles[gameId]

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3)
const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

function createDecorations(): PondDecoration[] {
  return [
    { kind: 'plant', x: 0.12, y: 0.76, scale: 1.05 },
    { kind: 'plant', x: 0.86, y: 0.72, scale: 1.18 },
    { kind: 'rock', x: 0.22, y: 0.85, scale: 1 },
    { kind: 'rock', x: 0.7, y: 0.8, scale: 1.12 },
    { kind: 'lily', x: 0.36, y: 0.25, scale: 0.94 },
    { kind: 'lily', x: 0.72, y: 0.34, scale: 0.82 },
  ]
}

function pickSpawn(width: number, height: number, gameId: GameId) {
  const profile = getProfile(gameId)

  if (profile.scene === 'meadow' || profile.scene === 'leaves' || profile.scene === 'sand') {
    return {
      x: rand(width * 0.24, width * 0.76),
      y: rand(height * 0.62, height * 0.82),
    }
  }

  if (profile.scene === 'air' || profile.scene === 'flowers' || profile.scene === 'night') {
    return {
      x: rand(width * 0.24, width * 0.76),
      y: rand(height * 0.2, height * 0.62),
    }
  }

  if (profile.scene === 'branch') {
    return {
      x: rand(width * 0.18, width * 0.82),
      y: rand(height * 0.2, height * 0.52),
    }
  }

  if (profile.scene === 'wall') {
    return {
      x: rand(width * 0.18, width * 0.82),
      y: rand(height * 0.22, height * 0.78),
    }
  }

  return {
    x: rand(width * 0.28, width * 0.72),
    y: rand(height * 0.26, height * 0.74),
  }
}

function pickTarget(width: number, height: number, x: number, y: number, gameId: GameId) {
  const profile = getProfile(gameId)
  const groundY = profile.scene === 'meadow' || profile.scene === 'leaves' || profile.scene === 'sand'
  const upperY = profile.scene === 'air' || profile.scene === 'flowers' || profile.scene === 'branch' || profile.scene === 'night'
  const exits = [
    {
      x: -80,
      y: groundY ? rand(height * 0.64, height * 0.84) : upperY ? rand(height * 0.16, height * 0.62) : rand(height * 0.2, height * 0.82),
      distance: x,
    },
    {
      x: width + 80,
      y: groundY ? rand(height * 0.64, height * 0.84) : upperY ? rand(height * 0.16, height * 0.62) : rand(height * 0.2, height * 0.82),
      distance: width - x,
    },
    { x: rand(width * 0.16, width * 0.84), y: -70, distance: upperY ? y : y * 0.5 },
    {
      x: rand(width * 0.16, width * 0.84),
      y: height + 70,
      distance: upperY ? height - y : (height - y) * 0.35,
    },
  ]

  return exits.sort((a, b) => b.distance - a.distance)[0]
}

function createControlPoint(
  width: number,
  height: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const midpointX = (startX + endX) / 2
  const midpointY = (startY + endY) / 2
  const dx = endX - startX
  const dy = endY - startY
  const distance = Math.max(1, Math.hypot(dx, dy))
  const curveAmount = rand(-0.12, 0.12) * distance

  return {
    x: Math.max(width * 0.12, Math.min(width * 0.88, midpointX + (-dy / distance) * curveAmount)),
    y: Math.max(height * 0.14, Math.min(height * 0.86, midpointY + (dx / distance) * curveAmount)),
  }
}

function quadraticPoint(start: number, control: number, end: number, amount: number) {
  const inverse = 1 - amount
  return inverse * inverse * start + 2 * inverse * amount * control + amount * amount * end
}

function getMovementPoint(round: Round, progress: number, now: number) {
  const eased = easeOutCubic(progress)
  let x = quadraticPoint(round.spawnX, round.controlX, round.targetX, eased)
  let y = quadraticPoint(round.spawnY, round.controlY, round.targetY, eased)
  const distance = Math.hypot(round.targetX - round.spawnX, round.targetY - round.spawnY)
  const wobble = Math.sin(progress * Math.PI * 6 + round.id) * Math.min(46, distance * 0.08)
  const hop = Math.abs(Math.sin(progress * Math.PI * 5))

  if (round.gameId === 'butterfly') {
    y += Math.sin(progress * Math.PI * 7) * 42
    x += Math.cos(progress * Math.PI * 4) * 18
  } else if (round.gameId === 'bird' || round.gameId === 'squirrel') {
    const segment = Math.floor(progress * 5)
    x += (segment % 2 ? -1 : 1) * 28 * (1 - Math.abs((progress * 5) % 1 - 0.5))
    y += Math.sin(progress * Math.PI * 5) * 22
  } else if (round.gameId === 'cricket' || round.gameId === 'frog') {
    y -= hop * (round.gameId === 'frog' ? 76 : 58)
  } else if (round.gameId === 'gecko' || round.gameId === 'beetle') {
    x += wobble * 0.45
    y += Math.sin(progress * Math.PI * 9 + round.id) * 12
  } else if (round.gameId === 'snake') {
    x += wobble
    y += Math.cos(progress * Math.PI * 7 + round.id) * 20
  } else if (round.gameId === 'firefly') {
    x += Math.sin(now * 4.2 + round.id) * 28
    y += Math.cos(now * 3.6 + round.id) * 34
  }

  return { x, y }
}

function createRound(
  id: number,
  width: number,
  height: number,
  config: DifficultyConfig,
  now: number,
  gameId: GameId,
): Round {
  const spawn = pickSpawn(width, height, gameId)
  const target = pickTarget(width, height, spawn.x, spawn.y, gameId)
  const control = createControlPoint(width, height, spawn.x, spawn.y, target.x, target.y)
  const fishType =
    gameId === 'fish'
      ? fishTypes[Math.floor(Math.random() * fishTypes.length)]
      : targetStyles[gameId]
  const distance = Math.hypot(target.x - spawn.x, target.y - spawn.y)
  const profile = getProfile(gameId)
  const pace = profile.pace
  const swimDuration = Math.max(3.4, Math.min(7.8, distance / (config.fishSpeed * pace)))

  return {
    id,
    phase: 'cue',
    phaseStartedAt: now,
    spawnX: spawn.x,
    spawnY: spawn.y,
    targetX: target.x,
    targetY: target.y,
    controlX: control.x,
    controlY: control.y,
    fishX: spawn.x,
    fishY: spawn.y,
    fishSize: config.fishSize * profile.size,
    fishType: fishType.type,
    gameId,
    color: fishType.color,
    accent: fishType.accent,
    bubbleDuration: rand(profile.cueDuration[0], profile.cueDuration[1]),
    swimDuration,
    rewardUntil: 0,
    missUntil: 0,
    bornAt: 0,
  }
}

function drawPond(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#b6f4ff')
  gradient.addColorStop(0.5, '#35b1d8')
  gradient.addColorStop(1, '#0f668a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.2
  for (let i = 0; i < 12; i += 1) {
    const y = ((i * 97) % height) + Math.sin(i) * 16
    ctx.beginPath()
    ctx.moveTo(-40, y)
    for (let x = -40; x < width + 80; x += 120) {
      ctx.quadraticCurveTo(x + 60, y + Math.sin(i + x) * 10, x + 120, y)
    }
    ctx.strokeStyle = i % 2 ? '#f2fdff' : '#ffe976'
    ctx.lineWidth = i % 2 ? 1.4 : 1
    ctx.stroke()
  }
  ctx.restore()
}

function drawMeadow(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#c8f4ff')
  gradient.addColorStop(0.56, '#8ddc8f')
  gradient.addColorStop(1, '#4f9c55')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.32
  ctx.fillStyle = '#fff6a8'
  ctx.beginPath()
  ctx.arc(width * 0.14, height * 0.16, 58, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 24; i += 1) {
    const x = (i * 89) % width
    const y = height * (0.62 + ((i * 17) % 34) / 100)
    ctx.strokeStyle = i % 2 ? '#f1d85b' : '#2f7a45'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(x, height)
    ctx.quadraticCurveTo(x + Math.sin(i) * 34, y, x + Math.cos(i) * 28, y - 48)
    ctx.stroke()
  }
  ctx.restore()
}

function drawDragonflyScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#d8fbff')
  gradient.addColorStop(0.54, '#7adcf0')
  gradient.addColorStop(1, '#2f9bb9')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.22
  for (let i = 0; i < 10; i += 1) {
    const x = (i * 137) % width
    const y = height * (0.18 + ((i * 29) % 48) / 100)
    ctx.fillStyle = i % 2 ? '#ffffff' : '#fff6a8'
    ctx.beginPath()
    ctx.ellipse(x, y, 72, 18, Math.sin(i) * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawFlowerScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  drawMeadow(ctx, width, height)
  ctx.save()
  for (let i = 0; i < 14; i += 1) {
    const x = (i * 103) % width
    const y = height * (0.62 + ((i * 11) % 24) / 100)
    ctx.fillStyle = i % 2 ? '#ff9bd1' : '#fff06a'
    for (let p = 0; p < 5; p += 1) {
      const angle = (Math.PI * 2 * p) / 5
      ctx.beginPath()
      ctx.ellipse(x + Math.cos(angle) * 12, y + Math.sin(angle) * 8, 10, 6, angle, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawBranchScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#d9fbff')
  gradient.addColorStop(0.58, '#78cfe0')
  gradient.addColorStop(1, '#3e9a72')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.strokeStyle = '#7a5637'
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  for (let i = 0; i < 4; i += 1) {
    const y = height * (0.24 + i * 0.14)
    ctx.beginPath()
    ctx.moveTo(-40, y)
    ctx.quadraticCurveTo(width * 0.38, y + Math.sin(i) * 36, width + 40, y - 18)
    ctx.stroke()
  }
  ctx.fillStyle = 'rgba(183, 227, 95, 0.72)'
  for (let i = 0; i < 18; i += 1) {
    ctx.beginPath()
    ctx.ellipse((i * 83) % width, height * (0.18 + ((i * 13) % 48) / 100), 24, 12, Math.sin(i), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawNightScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#07152c')
  gradient.addColorStop(0.6, '#143b57')
  gradient.addColorStop(1, '#195f4f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  for (let i = 0; i < 28; i += 1) {
    ctx.globalAlpha = 0.35 + ((i * 7) % 40) / 100
    ctx.fillStyle = i % 3 ? '#d7ff55' : '#ffffff'
    ctx.beginPath()
    ctx.arc((i * 127) % width, height * (0.14 + ((i * 19) % 72) / 100), 2 + (i % 3), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawWallScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#d8e3df')
  gradient.addColorStop(1, '#8ca69d')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.globalAlpha = 0.22
  ctx.strokeStyle = '#47675f'
  ctx.lineWidth = 3
  for (let y = 50; y < height; y += 90) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y + Math.sin(y) * 8)
    ctx.stroke()
  }
  for (let x = 80; x < width; x += 140) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + Math.sin(x) * 12, height)
    ctx.stroke()
  }
  ctx.restore()
}

function drawLeafScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#bde9d5')
  gradient.addColorStop(1, '#7d9d4f')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  for (let i = 0; i < 30; i += 1) {
    ctx.fillStyle = i % 3 === 0 ? '#f1d85b' : i % 3 === 1 ? '#c98a4f' : '#6c9143'
    ctx.beginPath()
    ctx.ellipse((i * 91) % width, height * (0.48 + ((i * 17) % 48) / 100), 26, 12, i, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawSandScene(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#d8fbff')
  gradient.addColorStop(0.52, '#e7d28f')
  gradient.addColorStop(1, '#c5a965')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  ctx.globalAlpha = 0.28
  ctx.strokeStyle = '#fff2b8'
  ctx.lineWidth = 3
  for (let i = 0; i < 12; i += 1) {
    const y = height * (0.44 + i * 0.045)
    ctx.beginPath()
    ctx.moveTo(-30, y)
    for (let x = -30; x < width + 60; x += 90) {
      ctx.quadraticCurveTo(x + 45, y + Math.sin(i + x) * 12, x + 90, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameId: GameId,
) {
  const scene = getProfile(gameId).scene

  if (scene === 'meadow') {
    drawMeadow(ctx, width, height)
    return
  }

  if (scene === 'air') {
    drawDragonflyScene(ctx, width, height)
    return
  }

  if (scene === 'flowers') {
    drawFlowerScene(ctx, width, height)
    return
  }

  if (scene === 'branch') {
    drawBranchScene(ctx, width, height)
    return
  }

  if (scene === 'night') {
    drawNightScene(ctx, width, height)
    return
  }

  if (scene === 'wall') {
    drawWallScene(ctx, width, height)
    return
  }

  if (scene === 'leaves') {
    drawLeafScene(ctx, width, height)
    return
  }

  if (scene === 'sand') {
    drawSandScene(ctx, width, height)
    return
  }

  drawPond(ctx, width, height)
}

function drawDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  decorations: PondDecoration[],
) {
  decorations.forEach((decoration) => {
    const x = decoration.x * width
    const y = decoration.y * height
    const s = decoration.scale

    if (decoration.kind === 'rock') {
      ctx.fillStyle = '#194e6b'
      ctx.beginPath()
      ctx.ellipse(x, y, 58 * s, 26 * s, -0.08, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2a7390'
      ctx.beginPath()
      ctx.ellipse(x - 16 * s, y - 8 * s, 26 * s, 12 * s, -0.18, 0, Math.PI * 2)
      ctx.fill()
      return
    }

    if (decoration.kind === 'lily') {
      ctx.fillStyle = '#b8e35f'
      ctx.beginPath()
      ctx.ellipse(x, y, 42 * s, 22 * s, 0.18, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#2aa47d'
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 34 * s, y - 8 * s)
      ctx.lineTo(x + 8 * s, y + 6 * s)
      ctx.closePath()
      ctx.fill()
      return
    }

    for (let blade = -2; blade <= 2; blade += 1) {
      ctx.strokeStyle = blade % 2 ? '#fcda52' : '#144f77'
      ctx.lineWidth = 7 * s
      ctx.beginPath()
      ctx.moveTo(x + blade * 15 * s, y + 48 * s)
      ctx.quadraticCurveTo(
        x + blade * 12 * s,
        y - 10 * s,
        x + blade * 26 * s,
        y - 72 * s,
      )
      ctx.stroke()
    }
  })
}

function drawCue(
  ctx: CanvasRenderingContext2D,
  round: Round,
  now: number,
) {
  const age = now - round.phaseStartedAt

  const profile = getProfile(round.gameId)

  if (profile.scene === 'meadow' || profile.scene === 'leaves') {
    const pulse = (Math.sin(age * 5) + 1) / 2
    ctx.save()
    ctx.globalAlpha = 0.58
    ctx.strokeStyle = '#fff4a7'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(round.spawnX, round.spawnY, 34 + pulse * 12, 15 + pulse * 4, 0, 0, Math.PI * 2)
    ctx.stroke()
    for (let i = -2; i <= 2; i += 1) {
      ctx.strokeStyle = i % 2 ? '#f4de63' : '#246f42'
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(round.spawnX + i * 14, round.spawnY + 28)
      ctx.quadraticCurveTo(
        round.spawnX + i * 8 + Math.sin(age * 8 + i) * 12,
        round.spawnY - 8,
        round.spawnX + i * 18,
        round.spawnY - 36 - pulse * 10,
      )
      ctx.stroke()
    }
    ctx.restore()
    return
  }

  if (profile.scene === 'wall') {
    const pulse = (Math.sin(age * 6) + 1) / 2
    ctx.save()
    ctx.globalAlpha = 0.52
    ctx.strokeStyle = '#fff2a6'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(round.spawnX, round.spawnY, 18 + pulse * 14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(round.spawnX - 28, round.spawnY + 10)
    ctx.quadraticCurveTo(round.spawnX, round.spawnY - 18 - pulse * 8, round.spawnX + 30, round.spawnY + 8)
    ctx.stroke()
    ctx.restore()
    return
  }

  if (profile.scene === 'branch') {
    const pulse = Math.sin(age * 7)
    ctx.save()
    ctx.strokeStyle = '#fff1a6'
    ctx.lineWidth = 5
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.ellipse(round.spawnX, round.spawnY, 36 + pulse * 5, 18, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#b8e35f'
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath()
      ctx.ellipse(
        round.spawnX + (i - 2) * 20,
        round.spawnY - 28 + Math.sin(age * 8 + i) * 8,
        16,
        8,
        i,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
    ctx.restore()
    return
  }

  if (profile.scene === 'sand') {
    const pulse = (Math.sin(age * 5) + 1) / 2
    ctx.save()
    ctx.strokeStyle = '#fff4b2'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.54
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath()
      ctx.ellipse(round.spawnX, round.spawnY, 24 + i * 14 + pulse * 8, 7 + i * 4, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
    return
  }

  if (profile.scene === 'air' || profile.scene === 'flowers' || profile.scene === 'night') {
    ctx.save()
    for (let i = 0; i < 5; i += 1) {
      const phase = (age * 0.78 + i * 0.2) % 1
      const angle = i * 1.55 + age * 0.6
      const radius = 10 + phase * 36
      ctx.globalAlpha = (1 - phase) * 0.74
      ctx.fillStyle = profile.scene === 'night' ? '#d7ff55' : i % 2 ? '#ffffff' : '#fff17d'
      ctx.beginPath()
      ctx.arc(
        round.spawnX + Math.cos(angle) * radius,
        round.spawnY + Math.sin(angle) * radius * 0.74,
        5 + (1 - phase) * 4,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
    ctx.restore()
    return
  }

  const pulse = (Math.sin(age * 4.2) + 1) / 2
  const outer = 28 + pulse * 10

  ctx.save()
  ctx.globalAlpha = 0.42
  ctx.strokeStyle = '#fff7a8'
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.ellipse(round.spawnX, round.spawnY, outer, outer * 0.52, 0, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 4; i += 1) {
    const phase = (age * 0.72 + i * 0.28) % 1
    const angle = i * 2.15
    const radius = 8 + phase * 24
    ctx.globalAlpha = (1 - phase * 0.72) * 0.62
    ctx.fillStyle = i % 2 ? '#ffffff' : '#fff1a6'
    ctx.beginPath()
    ctx.arc(
      round.spawnX + Math.cos(angle) * radius,
      round.spawnY + Math.sin(angle) * radius * 0.46 - phase * 18,
      4 + (1 - phase) * 3,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.restore()
}

function drawFish(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(
    round.targetY - round.controlY,
    round.targetX - round.controlX,
  )
  const jumpAge = Math.max(0, now - round.bornAt)
  const jump = Math.sin(Math.min(1, jumpAge / 0.55) * Math.PI) * round.fishSize * 0.62

  ctx.save()
  const glow = ctx.createRadialGradient(
    round.fishX,
    round.fishY - jump,
    round.fishSize * 0.2,
    round.fishX,
    round.fishY - jump,
    round.fishSize * 2.05,
  )
  glow.addColorStop(0, 'rgba(255, 250, 188, 0.52)')
  glow.addColorStop(0.5, 'rgba(255, 238, 102, 0.2)')
  glow.addColorStop(1, 'rgba(255, 238, 102, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(round.fishX, round.fishY - jump, round.fishSize * 2.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(round.fishX, round.fishY - jump)
  ctx.rotate(angle)

  ctx.strokeStyle = '#fff8b6'
  ctx.lineWidth = Math.max(4, round.fishSize * 0.11)
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize * 1.05, round.fishSize * 0.52, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize, round.fishSize * 0.46, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = round.accent
  ctx.beginPath()
  ctx.ellipse(round.fishSize * 0.2, -round.fishSize * 0.08, round.fishSize * 0.38, round.fishSize * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.moveTo(-round.fishSize * 0.86, 0)
  ctx.lineTo(-round.fishSize * 1.42, -round.fishSize * 0.38)
  ctx.lineTo(-round.fishSize * 1.36, round.fishSize * 0.36)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#072c3f'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.58, -round.fishSize * 0.12, round.fishSize * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawMouse(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(
    round.targetY - round.controlY,
    round.targetX - round.controlX,
  )
  const stride = Math.sin((now - round.bornAt) * 18) * round.fishSize * 0.07

  ctx.save()
  const glow = ctx.createRadialGradient(
    round.fishX,
    round.fishY,
    round.fishSize * 0.1,
    round.fishX,
    round.fishY,
    round.fishSize * 1.95,
  )
  glow.addColorStop(0, 'rgba(255, 245, 178, 0.48)')
  glow.addColorStop(0.55, 'rgba(255, 230, 97, 0.18)')
  glow.addColorStop(1, 'rgba(255, 230, 97, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(round.fishX, round.fishY, round.fishSize * 1.95, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(round.fishX, round.fishY + stride)
  ctx.rotate(angle)

  ctx.strokeStyle = '#fff8d1'
  ctx.lineWidth = Math.max(4, round.fishSize * 0.1)
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize * 1.1, round.fishSize * 0.58, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = '#7f8e96'
  ctx.lineWidth = Math.max(3, round.fishSize * 0.08)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-round.fishSize * 0.9, round.fishSize * 0.08)
  ctx.quadraticCurveTo(
    -round.fishSize * 1.45,
    -round.fishSize * 0.36,
    -round.fishSize * 1.82,
    round.fishSize * 0.2,
  )
  ctx.stroke()

  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize, round.fishSize * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = round.accent
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.52, -round.fishSize * 0.34, round.fishSize * 0.25, 0, Math.PI * 2)
  ctx.arc(round.fishSize * 0.18, -round.fishSize * 0.38, round.fishSize * 0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#7f8e96'
  ctx.beginPath()
  ctx.moveTo(round.fishSize * 0.72, -round.fishSize * 0.02)
  ctx.lineTo(round.fishSize * 1.26, round.fishSize * 0.18)
  ctx.lineTo(round.fishSize * 0.72, round.fishSize * 0.34)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.43, -round.fishSize * 0.14, round.fishSize * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawDragonfly(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(
    round.targetY - round.controlY,
    round.targetX - round.controlX,
  )
  const wingBeat = Math.sin((now - round.bornAt) * 28) * 0.22

  ctx.save()
  const glow = ctx.createRadialGradient(
    round.fishX,
    round.fishY,
    round.fishSize * 0.1,
    round.fishX,
    round.fishY,
    round.fishSize * 2.25,
  )
  glow.addColorStop(0, 'rgba(225, 255, 255, 0.62)')
  glow.addColorStop(0.46, 'rgba(255, 241, 125, 0.24)')
  glow.addColorStop(1, 'rgba(255, 241, 125, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(round.fishX, round.fishY, round.fishSize * 2.25, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.translate(round.fishX, round.fishY)
  ctx.rotate(angle + Math.sin(now * 8) * 0.12)

  ctx.fillStyle = 'rgba(226, 252, 255, 0.72)'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = Math.max(2, round.fishSize * 0.06)
  ;[
    [-0.1, -0.56 - wingBeat],
    [0.15, 0.56 + wingBeat],
  ].forEach(([xOffset, yOffset]) => {
    ctx.beginPath()
    ctx.ellipse(
      round.fishSize * xOffset,
      round.fishSize * yOffset,
      round.fishSize * 0.82,
      round.fishSize * 0.28,
      yOffset < 0 ? -0.42 : 0.42,
      0,
      Math.PI * 2,
    )
    ctx.fill()
    ctx.stroke()
  })

  ctx.fillStyle = round.color
  ctx.strokeStyle = '#f7ffb8'
  ctx.lineWidth = Math.max(3, round.fishSize * 0.08)
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize * 0.9, round.fishSize * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.72, -round.fishSize * 0.08, round.fishSize * 0.08, 0, Math.PI * 2)
  ctx.arc(round.fishSize * 0.72, round.fishSize * 0.08, round.fishSize * 0.08, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawWingedTarget(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(round.targetY - round.controlY, round.targetX - round.controlX)
  const beat = Math.sin((now - round.bornAt) * 18) * 0.2
  const isButterfly = round.gameId === 'butterfly'
  ctx.save()
  ctx.translate(round.fishX, round.fishY)
  ctx.rotate(angle + Math.sin(now * 4) * 0.16)
  ctx.fillStyle = isButterfly ? 'rgba(255, 155, 209, 0.78)' : 'rgba(121, 201, 255, 0.82)'
  ctx.strokeStyle = '#fff8b6'
  ctx.lineWidth = Math.max(3, round.fishSize * 0.08)
  ctx.beginPath()
  ctx.ellipse(-round.fishSize * 0.25, -round.fishSize * 0.36 - beat * round.fishSize, round.fishSize * 0.56, round.fishSize * 0.46, -0.5, 0, Math.PI * 2)
  ctx.ellipse(-round.fishSize * 0.25, round.fishSize * 0.36 + beat * round.fishSize, round.fishSize * 0.56, round.fishSize * 0.46, 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(round.fishSize * 0.22, 0, round.fishSize * 0.62, round.fishSize * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()
  if (round.gameId === 'bird') {
    ctx.fillStyle = round.accent
    ctx.beginPath()
    ctx.moveTo(round.fishSize * 0.82, 0)
    ctx.lineTo(round.fishSize * 1.32, -round.fishSize * 0.14)
    ctx.lineTo(round.fishSize * 0.82, round.fishSize * 0.16)
    ctx.closePath()
    ctx.fill()
  }
  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.58, -round.fishSize * 0.08, round.fishSize * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawHopperTarget(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(round.targetY - round.controlY, round.targetX - round.controlX)
  const crouch = Math.sin((now - round.bornAt) * 14) * round.fishSize * 0.06
  ctx.save()
  ctx.translate(round.fishX, round.fishY + crouch)
  ctx.rotate(angle)
  ctx.strokeStyle = '#fff8b6'
  ctx.lineWidth = Math.max(3, round.fishSize * 0.08)
  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize * 0.9, round.fishSize * 0.46, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = round.accent
  ctx.lineWidth = Math.max(4, round.fishSize * 0.1)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-round.fishSize * 0.35, round.fishSize * 0.18)
  ctx.lineTo(-round.fishSize * 0.82, round.fishSize * 0.62)
  ctx.moveTo(round.fishSize * 0.3, round.fishSize * 0.18)
  ctx.lineTo(round.fishSize * 0.8, round.fishSize * 0.58)
  ctx.stroke()
  if (round.gameId === 'frog') {
    ctx.fillStyle = round.accent
    ctx.beginPath()
    ctx.arc(round.fishSize * 0.28, -round.fishSize * 0.38, round.fishSize * 0.18, 0, Math.PI * 2)
    ctx.arc(round.fishSize * 0.62, -round.fishSize * 0.3, round.fishSize * 0.16, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.48, -round.fishSize * 0.12, round.fishSize * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawCrawlerTarget(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(round.targetY - round.controlY, round.targetX - round.controlX)
  const wiggle = Math.sin((now - round.bornAt) * 12) * 0.12
  ctx.save()
  ctx.translate(round.fishX, round.fishY)
  ctx.rotate(angle + wiggle)
  ctx.strokeStyle = round.accent
  ctx.lineWidth = Math.max(3, round.fishSize * 0.07)
  ctx.lineCap = 'round'
  if (round.gameId === 'gecko') {
    ctx.beginPath()
    ctx.moveTo(-round.fishSize * 0.8, 0)
    ctx.quadraticCurveTo(-round.fishSize * 1.35, -round.fishSize * 0.32, -round.fishSize * 1.7, round.fishSize * 0.16)
    ctx.stroke()
  }
  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(0, 0, round.fishSize * 0.95, round.fishSize * 0.38, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  for (let i = -1; i <= 1; i += 2) {
    ctx.beginPath()
    ctx.moveTo(-round.fishSize * 0.25, i * round.fishSize * 0.22)
    ctx.lineTo(-round.fishSize * 0.7, i * round.fishSize * 0.56)
    ctx.moveTo(round.fishSize * 0.28, i * round.fishSize * 0.2)
    ctx.lineTo(round.fishSize * 0.74, i * round.fishSize * 0.5)
    ctx.stroke()
  }
  if (round.gameId === 'beetle') {
    ctx.strokeStyle = '#214d35'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, -round.fishSize * 0.34)
    ctx.lineTo(0, round.fishSize * 0.34)
    ctx.stroke()
  }
  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 0.54, -round.fishSize * 0.1, round.fishSize * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSnake(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const angle = Math.atan2(round.targetY - round.controlY, round.targetX - round.controlX)
  ctx.save()
  ctx.translate(round.fishX, round.fishY)
  ctx.rotate(angle)
  ctx.strokeStyle = '#fff8b6'
  ctx.lineWidth = round.fishSize * 0.34
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-round.fishSize * 1.5, 0)
  for (let i = -1.4; i <= 1.0; i += 0.35) {
    ctx.lineTo(round.fishSize * i, Math.sin(i * 4 + now * 8) * round.fishSize * 0.28)
  }
  ctx.stroke()
  ctx.strokeStyle = round.color
  ctx.lineWidth = round.fishSize * 0.24
  ctx.stroke()
  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.arc(round.fishSize * 1.05, 0, round.fishSize * 0.28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#073247'
  ctx.beginPath()
  ctx.arc(round.fishSize * 1.16, -round.fishSize * 0.08, round.fishSize * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSquirrel(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  drawMouse(ctx, { ...round, color: round.color, accent: round.accent, fishSize: round.fishSize * 0.96 }, now)
  ctx.save()
  ctx.translate(round.fishX, round.fishY)
  ctx.rotate(Math.atan2(round.targetY - round.controlY, round.targetX - round.controlX))
  ctx.strokeStyle = round.color
  ctx.lineWidth = round.fishSize * 0.22
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(-round.fishSize * 0.7, -round.fishSize * 0.08)
  ctx.quadraticCurveTo(-round.fishSize * 1.45, -round.fishSize * 1.0, -round.fishSize * 0.58, -round.fishSize * 1.12)
  ctx.stroke()
  ctx.restore()
}

function drawFirefly(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const blink = 0.45 + (Math.sin(now * 9 + round.id) + 1) * 0.28
  ctx.save()
  ctx.globalAlpha = blink
  const glow = ctx.createRadialGradient(round.fishX, round.fishY, 0, round.fishX, round.fishY, round.fishSize * 2.8)
  glow.addColorStop(0, 'rgba(215, 255, 85, 0.95)')
  glow.addColorStop(0.45, 'rgba(215, 255, 85, 0.32)')
  glow.addColorStop(1, 'rgba(215, 255, 85, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(round.fishX, round.fishY, round.fishSize * 2.8, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = round.color
  ctx.beginPath()
  ctx.ellipse(round.fishX, round.fishY, round.fishSize * 0.42, round.fishSize * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTarget(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  if (round.gameId === 'mouse') {
    drawMouse(ctx, round, now)
    return
  }

  if (round.gameId === 'dragonfly') {
    drawDragonfly(ctx, round, now)
    return
  }

  if (round.gameId === 'butterfly' || round.gameId === 'bird') {
    drawWingedTarget(ctx, round, now)
    return
  }

  if (round.gameId === 'cricket' || round.gameId === 'frog') {
    drawHopperTarget(ctx, round, now)
    return
  }

  if (round.gameId === 'gecko' || round.gameId === 'beetle') {
    drawCrawlerTarget(ctx, round, now)
    return
  }

  if (round.gameId === 'snake') {
    drawSnake(ctx, round, now)
    return
  }

  if (round.gameId === 'squirrel') {
    drawSquirrel(ctx, round, now)
    return
  }

  if (round.gameId === 'firefly') {
    drawFirefly(ctx, round, now)
    return
  }

  drawFish(ctx, round, now)
}

function drawRipple(ctx: CanvasRenderingContext2D, ripple: SimpleRipple) {
  const progress = ripple.age / ripple.maxAge
  const radius =
    progress *
    (ripple.kind === 'reward' ? 150 : ripple.kind === 'catch' ? 96 : 46)

  ctx.save()
  ctx.globalAlpha = Math.max(0, 1 - progress)
  ctx.strokeStyle =
    ripple.kind === 'bubble' || ripple.kind === 'reward' ? '#fff7a8' : '#ffffff'
  ctx.lineWidth = ripple.kind === 'catch' || ripple.kind === 'reward' ? 4 : 2
  ctx.beginPath()
  ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
  ctx.stroke()

  if (ripple.kind === 'catch' || ripple.kind === 'reward') {
    for (let i = 0; i < 10; i += 1) {
      const angle = (Math.PI * 2 * i) / 10
      ctx.beginPath()
      ctx.arc(
        ripple.x + Math.cos(angle) * radius * 0.72,
        ripple.y + Math.sin(angle) * radius * 0.48,
        4 + (1 - progress) * 4,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = i % 2 ? '#ffffff' : '#fff18a'
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawReward(ctx: CanvasRenderingContext2D, round: Round, now: number) {
  const progress = clamp01((now - round.phaseStartedAt) / 1.05)
  const radius = easeOutCubic(progress) * 190

  ctx.save()
  const glow = ctx.createRadialGradient(
    round.fishX,
    round.fishY,
    0,
    round.fishX,
    round.fishY,
    radius,
  )
  glow.addColorStop(0, 'rgba(255, 255, 230, 0.72)')
  glow.addColorStop(0.42, 'rgba(255, 226, 89, 0.38)')
  glow.addColorStop(1, 'rgba(255, 226, 89, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(round.fishX, round.fishY, radius, 0, Math.PI * 2)
  ctx.fill()

  for (let i = 0; i < 16; i += 1) {
    const angle = (Math.PI * 2 * i) / 16 + progress * 1.6
    const distance = 26 + radius * 0.58
    ctx.globalAlpha = 1 - progress
    ctx.fillStyle = i % 2 ? '#ffffff' : '#ffef75'
    ctx.beginPath()
    ctx.arc(
      round.fishX + Math.cos(angle) * distance,
      round.fishY + Math.sin(angle) * distance,
      5 + (1 - progress) * 5,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }
  ctx.restore()
}

function drawMissOverlay(ctx: CanvasRenderingContext2D, width: number, height: number, round: Round, now: number) {
  const progress = clamp01((now - round.phaseStartedAt) / 0.42)
  ctx.save()
  ctx.globalAlpha = 0.62 * progress
  ctx.fillStyle = '#03131f'
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

export function GameCanvas({
  gameId,
  settings,
  language,
  onLanguageChange: _onLanguageChange,
  paused,
  onPauseToggle,
  onPreviousGame,
  onNextGame,
  onStop,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>(0)
  const roundRef = useRef<Round | null>(null)
  const rippleRef = useRef<SimpleRipple[]>([])
  const statsRef = useRef({
    startTime: performance.now(),
    touches: 0,
    catches: 0,
    reactionTimes: [] as number[],
    fishTypes: new Map<string, number>(),
    quietIntervals: 0,
  })
  const nextIdRef = useRef(1)
  const stopHoldTimerRef = useRef<number | null>(null)
  const stoppedRef = useRef(false)
  const sound = useMemo(() => new SoundManager(), [])
  const wakeLock = useMemo(() => new WakeLockController(), [])
  const config = useMemo(
    () => getDifficultyConfig(settings.age, settings.personality),
    [settings.age, settings.personality],
  )
  const decorations = useMemo(createDecorations, [])
  const [, setElapsed] = useState(0)
  const [pageHidden, setPageHidden] = useState(document.hidden)
  const t = copy[language]
  const selectedDuration = durationToSeconds(settings.duration)
  const isEndless = isEndlessDuration(settings.duration)

  const buildStats = useCallback(() => {
    const stats = statsRef.current
    const favorite =
      Array.from(stats.fishTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'Not yet'
    const average =
      stats.reactionTimes.reduce((sum, value) => sum + value, 0) /
      Math.max(1, stats.reactionTimes.length)

    return {
      duration: (performance.now() - stats.startTime) / 1000,
      age: settings.age,
      touches: stats.touches,
      catches: stats.catches,
      fishCount: 1 as const,
      averageReactionTime: stats.reactionTimes.length ? average : 0,
      favoriteFishType: favorite,
      personality: settings.personality,
      quietIntervals: stats.quietIntervals,
    }
  }, [settings.age, settings.personality])

  const stopSession = useCallback(() => {
    if (stoppedRef.current) {
      return
    }
    stoppedRef.current = true
    sound.fadeOut()
    void wakeLock.release()
    onStop(buildStats())
  }, [buildStats, onStop, sound, wakeLock])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(canvas.clientWidth * dpr)
      canvas.height = Math.floor(canvas.clientHeight * dpr)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    const width = rect?.width || 1000
    const height = rect?.height || 640
    const now = performance.now() / 1000

    roundRef.current = createRound(nextIdRef.current++, width, height, config, now, gameId)
    rippleRef.current = []
    statsRef.current = {
      startTime: performance.now(),
      touches: 0,
      catches: 0,
      reactionTimes: [],
      fishTypes: new Map(),
      quietIntervals: 0,
    }
    stoppedRef.current = false
  }, [config, gameId])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageHidden(document.hidden)
      if (document.hidden) {
        sound.fadeOut()
        void wakeLock.release()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [sound, wakeLock])

  useEffect(() => {
    if (!isEndless || paused || pageHidden) {
      void wakeLock.release()
      return
    }

    void wakeLock.request()
    return () => {
      void wakeLock.release()
    }
  }, [isEndless, pageHidden, paused, wakeLock])

  useEffect(() => {
    if (!isEndless || paused) {
      return
    }

    const persistStats = () => {
      localStorage.setItem(ENDLESS_STATS_KEY, serializeSessionStats(buildStats()))
    }

    persistStats()
    const interval = window.setInterval(persistStats, 15_000)
    return () => window.clearInterval(interval)
  }, [buildStats, isEndless, paused, settings])

  useEffect(() => () => {
    if (stopHoldTimerRef.current !== null) {
      window.clearTimeout(stopHoldTimerRef.current)
    }
    sound.fadeOut()
    void wakeLock.release()
  }, [sound, wakeLock])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) {
      return
    }

    let previous = performance.now()
    let elapsedAccumulator = 0

    const animate = (time: number) => {
      const dpr = canvas.width / Math.max(1, canvas.clientWidth)
      const width = canvas.width / dpr
      const height = canvas.height / dpr
      const dt = Math.min(0.04, (time - previous) / 1000)
      const now = time / 1000
      previous = time

      if (!roundRef.current) {
        roundRef.current = createRound(nextIdRef.current++, width, height, config, now, gameId)
      }

      const round = roundRef.current

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawScene(ctx, width, height, gameId)

      if (!paused && !pageHidden) {
        if (round.phase === 'cue') {
          if (now - round.phaseStartedAt >= round.bubbleDuration) {
            round.phase = 'target'
            round.phaseStartedAt = now
            round.bornAt = now
          }
        } else if (round.phase === 'target') {
          const progress = clamp01((now - round.phaseStartedAt) / round.swimDuration)
          const point = getMovementPoint(round, progress, now)
          round.fishX = point.x
          round.fishY = point.y

          if (progress >= 1) {
            round.phase = 'miss'
            round.phaseStartedAt = now
            round.missUntil = now + 1.05
            statsRef.current.quietIntervals += 1
          }
        } else if (round.phase === 'reward' && now >= round.rewardUntil) {
          roundRef.current = createRound(nextIdRef.current++, width, height, config, now, gameId)
        } else if (round.phase === 'miss' && now >= round.missUntil) {
          roundRef.current = createRound(nextIdRef.current++, width, height, config, now, gameId)
        }

        rippleRef.current = rippleRef.current
          .map((ripple) => ({ ...ripple, age: ripple.age + dt }))
          .filter((ripple) => ripple.age < ripple.maxAge)
      }

      const visibleRound = roundRef.current
      if (gameId === 'fish') {
        drawDecorations(ctx, width, height, decorations)
      }

      if (visibleRound.phase === 'cue') {
        drawCue(ctx, visibleRound, now)
      }

      if (visibleRound.phase === 'target') {
        drawCue(ctx, visibleRound, now)
        drawTarget(ctx, visibleRound, now)
      }

      if (visibleRound.phase === 'reward') {
        drawReward(ctx, visibleRound, now)
      }

      rippleRef.current.forEach((ripple) => drawRipple(ctx, ripple))

      if (visibleRound.phase === 'miss') {
        drawMissOverlay(ctx, width, height, visibleRound, now)
      }

      elapsedAccumulator += dt
      if (elapsedAccumulator > 0.4) {
        const seconds = (performance.now() - statsRef.current.startTime) / 1000
        setElapsed(seconds)
        if (selectedDuration !== null && seconds >= selectedDuration) {
          stopSession()
          return
        }
        elapsedAccumulator = 0
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [
    config,
    decorations,
    gameId,
    pageHidden,
    paused,
    selectedDuration,
    stopSession,
  ])

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const round = roundRef.current
    if (!canvas || !round || paused) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const now = performance.now() / 1000
    statsRef.current.touches += 1

    const distance = Math.hypot(round.fishX - x, round.fishY - y)
    if (
      round.phase === 'target' &&
      distance <= config.reactionDistance + round.fishSize * 0.82
    ) {
      statsRef.current.catches += 1
      statsRef.current.reactionTimes.push(now - round.bornAt)
      statsRef.current.fishTypes.set(
        round.fishType,
        (statsRef.current.fishTypes.get(round.fishType) ?? 0) + 1,
      )
      sound.playSplash(config.soundIntensity)
      round.phase = 'reward'
      round.phaseStartedAt = now
      round.rewardUntil = now + 1.18
      rippleRef.current.push(
        {
          id: nextIdRef.current++,
          x: round.fishX,
          y: round.fishY,
          age: 0,
          maxAge: 0.85,
          kind: 'catch',
        },
        {
          id: nextIdRef.current++,
          x: round.fishX,
          y: round.fishY,
          age: 0,
          maxAge: 1.25,
          kind: 'reward',
        },
      )
      return
    }

    rippleRef.current.push({
      id: nextIdRef.current++,
      x,
      y,
      age: 0,
      maxAge: round.phase === 'cue' ? 0.7 : 0.5,
      kind: round.phase === 'cue' ? 'bubble' : 'tap',
    })
  }

  const handleStopPointerDown = () => {
    if (!isEndless) {
      stopSession()
      return
    }

    stopHoldTimerRef.current = window.setTimeout(stopSession, 900)
  }

  const clearStopHold = () => {
    if (stopHoldTimerRef.current !== null) {
      window.clearTimeout(stopHoldTimerRef.current)
      stopHoldTimerRef.current = null
    }
  }

  return (
    <main className="game-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <canvas
        ref={canvasRef}
        className="pond-canvas"
        aria-label={t.gameCanvas}
        onPointerDown={handlePointerDown}
      />
      <button
        className="corner-control corner-control-top-left"
        type="button"
        onPointerDown={handleStopPointerDown}
        onPointerLeave={clearStopHold}
        onPointerUp={clearStopHold}
        aria-label={isEndless ? t.holdToStop : t.stop}
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M8 25 24 11l16 14v15H29V29H19v11H8z" />
        </svg>
      </button>
      <button
        className="corner-control corner-control-top-right"
        type="button"
        onClick={onPauseToggle}
        aria-label={t.pauseGame}
      >
        {paused ? (
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M18 13v22l17-11z" />
          </svg>
        ) : (
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path d="M15 12h7v24h-7zM27 12h7v24h-7z" />
          </svg>
        )}
      </button>
      <button
        className="corner-control corner-control-bottom-left"
        type="button"
        onClick={onPreviousGame}
        aria-label="previous game"
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M15 24 31 12v24zM10 12h5v24h-5z" />
        </svg>
      </button>
      <button
        className="corner-control corner-control-bottom-right"
        type="button"
        onClick={onNextGame}
        aria-label="next game"
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M33 24 17 12v24zM33 12h5v24h-5z" />
        </svg>
      </button>
    </main>
  )
}
