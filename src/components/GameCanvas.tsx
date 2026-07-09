import { useEffect, useMemo, useRef, useState } from 'react'
import { getDifficultyConfig } from '../game/difficultyConfig'
import { SoundManager } from '../game/SoundManager'
import { copy, languageNames } from '../i18n'
import type {
  Fish,
  Language,
  Ripple,
  SessionSettings,
  SessionStats,
} from '../game/types'

type Props = {
  settings: SessionSettings
  language: Language
  onLanguageChange: (language: Language) => void
  paused: boolean
  onPauseToggle: () => void
  onStop: (stats: SessionStats) => void
}

type PondDecoration = {
  x: number
  y: number
  scale: number
  kind: 'plant' | 'rock' | 'lily'
}

const fishTypes = [
  { type: 'sunny gold', color: '#ffd54d', accent: '#fff2a6' },
  { type: 'moon blue', color: '#6fe3ff', accent: '#f4fdff' },
  { type: 'white flash', color: '#fff9d8', accent: '#ffe66b' },
  { type: 'deep teal', color: '#57d8ca', accent: '#f7ff9b' },
]

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const chance = (value: number) => Math.random() < value

function makeFish(
  id: number,
  width: number,
  height: number,
  size: number,
  speed: number,
  now: number,
  preferCenter: boolean,
): Fish {
  const angle = rand(-0.6, 0.6) + (Math.random() > 0.5 ? 0 : Math.PI)
  const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)]
  const x = preferCenter ? rand(width * 0.28, width * 0.72) : rand(80, width - 80)
  return {
    id,
    x,
    y: rand(height * 0.22, height * 0.82),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed * 0.45,
    size,
    color: fishType.color,
    accent: fishType.accent,
    type: fishType.type,
    hidden: false,
    pausedUntil: 0,
    hideUntil: 0,
    jumpUntil: 0,
    bornAt: now,
    nextDecisionAt: now + rand(0.5, 2.2),
    nextBubbleAt: now + rand(0.8, 4),
    escapingUntil: 0,
  }
}

function createDecorations(): PondDecoration[] {
  return [
    { kind: 'plant', x: 0.12, y: 0.72, scale: 1.1 },
    { kind: 'plant', x: 0.82, y: 0.68, scale: 1.3 },
    { kind: 'rock', x: 0.24, y: 0.83, scale: 1.05 },
    { kind: 'rock', x: 0.68, y: 0.78, scale: 1.18 },
    { kind: 'lily', x: 0.36, y: 0.25, scale: 1 },
    { kind: 'lily', x: 0.72, y: 0.34, scale: 0.86 },
  ]
}

function drawPond(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#aeeeff')
  gradient.addColorStop(0.46, '#2aa9d6')
  gradient.addColorStop(1, '#0d5f8b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = 0.28
  for (let i = 0; i < 18; i += 1) {
    const y = ((i * 73) % height) + Math.sin(i) * 18
    ctx.beginPath()
    ctx.moveTo(-40, y)
    for (let x = -40; x < width + 80; x += 90) {
      ctx.quadraticCurveTo(x + 45, y + Math.sin(i + x) * 12, x + 90, y)
    }
    ctx.strokeStyle = i % 2 ? '#f2fdff' : '#ffe976'
    ctx.lineWidth = i % 2 ? 1.5 : 1
    ctx.stroke()
  }
  ctx.restore()
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

function drawFish(ctx: CanvasRenderingContext2D, fish: Fish, now: number) {
  const direction = fish.vx >= 0 ? 1 : -1
  const jump = now < fish.jumpUntil ? Math.sin(now * 24) * 10 : 0
  const isEscaping = now < fish.escapingUntil

  ctx.save()
  ctx.translate(fish.x, fish.y + jump)
  ctx.scale(direction, 1)
  ctx.globalAlpha = fish.hidden ? 0.24 : 1
  ctx.rotate(fish.vy * 0.003)

  ctx.fillStyle = fish.color
  ctx.beginPath()
  ctx.ellipse(0, 0, fish.size, fish.size * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = fish.accent
  ctx.beginPath()
  ctx.ellipse(fish.size * 0.2, -fish.size * 0.08, fish.size * 0.38, fish.size * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = fish.color
  ctx.beginPath()
  ctx.moveTo(-fish.size * 0.86, 0)
  ctx.lineTo(-fish.size * 1.42, -fish.size * 0.38)
  ctx.lineTo(-fish.size * 1.36, fish.size * 0.36)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#072c3f'
  ctx.beginPath()
  ctx.arc(fish.size * 0.58, -fish.size * 0.12, fish.size * 0.07, 0, Math.PI * 2)
  ctx.fill()

  if (isEscaping) {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.globalAlpha = 0.6
    ctx.beginPath()
    ctx.arc(-fish.size * 1.05, 0, fish.size * 0.7, -0.6, 0.6)
    ctx.stroke()
  }

  ctx.restore()
}

function drawRipple(ctx: CanvasRenderingContext2D, ripple: Ripple) {
  const progress = ripple.age / ripple.maxAge
  const radius = progress * (ripple.kind === 'catch' ? 76 : 42)
  ctx.save()
  ctx.globalAlpha = Math.max(0, 1 - progress)
  ctx.strokeStyle = ripple.kind === 'bubble' ? '#fff7a8' : '#ffffff'
  ctx.lineWidth = ripple.kind === 'catch' ? 4 : 2
  ctx.beginPath()
  ctx.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
  ctx.stroke()
  if (ripple.kind === 'catch') {
    for (let i = 0; i < 7; i += 1) {
      const angle = (Math.PI * 2 * i) / 7
      ctx.beginPath()
      ctx.arc(
        ripple.x + Math.cos(angle) * radius * 0.72,
        ripple.y + Math.sin(angle) * radius * 0.45,
        4,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = '#fff6a3'
      ctx.fill()
    }
  }
  ctx.restore()
}

export function GameCanvas({
  settings,
  language,
  onLanguageChange,
  paused,
  onPauseToggle,
  onStop,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>(0)
  const fishRef = useRef<Fish[]>([])
  const rippleRef = useRef<Ripple[]>([])
  const statsRef = useRef({
    startTime: performance.now(),
    touches: 0,
    catches: 0,
    reactionTimes: [] as number[],
    fishTypes: new Map<string, number>(),
  })
  const nextIdRef = useRef(1)
  const sound = useMemo(() => new SoundManager(), [])
  const config = useMemo(
    () => getDifficultyConfig(settings.age, settings.personality),
    [settings.age, settings.personality],
  )
  const decorations = useMemo(createDecorations, [])
  const [elapsed, setElapsed] = useState(0)
  const t = copy[language]

  const buildStats = () => {
    const stats = statsRef.current
    const favorite =
      Array.from(stats.fishTypes.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      'Not yet'
    const average =
      stats.reactionTimes.reduce((sum, value) => sum + value, 0) /
      Math.max(1, stats.reactionTimes.length)

    return {
      duration: (performance.now() - stats.startTime) / 1000,
      touches: stats.touches,
      catches: stats.catches,
      averageReactionTime: stats.reactionTimes.length ? average : 0,
      favoriteFishType: favorite,
    }
  }

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
    if (!canvas) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const now = performance.now() / 1000
    fishRef.current = Array.from({ length: config.fishCount }, (_, index) =>
      makeFish(
        index + 1,
        rect.width || 1000,
        rect.height || 640,
        config.fishSize,
        config.fishSpeed,
        now,
        settings.personality === 'lazy',
      ),
    )
    rippleRef.current = []
    statsRef.current = {
      startTime: performance.now(),
      touches: 0,
      catches: 0,
      reactionTimes: [],
      fishTypes: new Map(),
    }
    nextIdRef.current = config.fishCount + 1
  }, [config, settings.personality])

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

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawPond(ctx, width, height)

      if (!paused) {
        fishRef.current.forEach((fish) => {
          if (now >= fish.pausedUntil) {
            fish.x += fish.vx * dt
            fish.y += fish.vy * dt
          }

          if (fish.x < -80 || fish.x > width + 80) fish.vx *= -1
          if (fish.y < height * 0.14 || fish.y > height * 0.86) fish.vy *= -1

          if (now >= fish.nextDecisionAt) {
            if (chance(config.directionChangeFrequency)) {
              const angle = rand(-0.85, 0.85) + (fish.vx > 0 ? 0 : Math.PI)
              fish.vx = Math.cos(angle) * config.fishSpeed * rand(0.75, 1.25)
              fish.vy = Math.sin(angle) * config.fishSpeed * rand(0.25, 0.75)
            }
            if (chance(0.18)) fish.pausedUntil = now + rand(0.35, 1.2)
            if (chance(config.hidingFrequency)) fish.hideUntil = now + rand(0.8, 2.4)
            if (chance(config.jumpFrequency)) fish.jumpUntil = now + rand(0.28, 0.5)
            fish.nextDecisionAt = now + rand(0.7, 2.4)
          }

          fish.hidden = now < fish.hideUntil
          if (now >= fish.nextBubbleAt) {
            rippleRef.current.push({
              id: nextIdRef.current++,
              x: fish.x - Math.sign(fish.vx) * fish.size * 0.8,
              y: fish.y - fish.size * 0.25,
              age: 0,
              maxAge: rand(0.9, 1.7),
              kind: 'bubble',
            })
            fish.nextBubbleAt = now + rand(1.2, 4.8)
          }
        })

        rippleRef.current = rippleRef.current
          .map((ripple) => ({ ...ripple, age: ripple.age + dt }))
          .filter((ripple) => ripple.age < ripple.maxAge)
      }

      drawDecorations(ctx, width, height, decorations)
      fishRef.current.forEach((fish) => drawFish(ctx, fish, now))
      rippleRef.current.forEach((ripple) => drawRipple(ctx, ripple))

      elapsedAccumulator += dt
      if (elapsedAccumulator > 0.4) {
        const seconds = (performance.now() - statsRef.current.startTime) / 1000
        setElapsed(seconds)
        if (settings.timer > 0 && seconds >= settings.timer) {
          onStop(buildStats())
          return
        }
        elapsedAccumulator = 0
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [config, decorations, onStop, paused, settings.timer])

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || paused) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const now = performance.now() / 1000
    statsRef.current.touches += 1

    const target = fishRef.current
      .filter((fish) => !fish.hidden)
      .map((fish) => ({
        fish,
        distance: Math.hypot(fish.x - x, fish.y - y),
      }))
      .sort((a, b) => a.distance - b.distance)[0]

    if (target && target.distance <= config.reactionDistance + target.fish.size * 0.65) {
      const fish = target.fish
      statsRef.current.catches += 1
      statsRef.current.reactionTimes.push(now - fish.bornAt)
      statsRef.current.fishTypes.set(
        fish.type,
        (statsRef.current.fishTypes.get(fish.type) ?? 0) + 1,
      )
      sound.playSplash(config.soundIntensity)
      fish.escapingUntil = now + 0.55
      fish.vx = (fish.x < rect.width / 2 ? -1 : 1) * config.fishSpeed * 3.2
      fish.vy = (fish.y < rect.height / 2 ? -1 : 1) * config.fishSpeed * 1.2
      rippleRef.current.push({
        id: nextIdRef.current++,
        x,
        y,
        age: 0,
        maxAge: 0.9,
        kind: 'catch',
      })

      window.setTimeout(() => {
        const index = fishRef.current.findIndex((item) => item.id === fish.id)
        if (index >= 0) {
          fishRef.current[index] = makeFish(
            nextIdRef.current++,
            rect.width,
            rect.height,
            config.fishSize,
            config.fishSpeed,
            performance.now() / 1000,
            settings.personality === 'lazy',
          )
        }
      }, 650)
      return
    }

    rippleRef.current.push({
      id: nextIdRef.current++,
      x,
      y,
      age: 0,
      maxAge: 0.65,
      kind: 'miss',
    })
  }

  const remaining =
    settings.timer > 0 ? Math.max(0, Math.ceil(settings.timer - elapsed)) : null

  return (
    <main className="game-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <canvas
        ref={canvasRef}
        className="pond-canvas"
        aria-label={t.gameCanvas}
        onPointerDown={handlePointerDown}
      />
      <div className="game-controls" aria-label={t.ownerControls}>
        <div className="game-language-switch" aria-label={t.language}>
          {(['en', 'zh'] as const).map((item) => (
            <button
              className={language === item ? 'selected' : ''}
              key={item}
              type="button"
              onClick={() => onLanguageChange(item)}
            >
              {languageNames[item]}
            </button>
          ))}
        </div>
        <button type="button" onClick={onPauseToggle} aria-label={t.pauseGame}>
          {paused ? t.resume : t.pause}
        </button>
        <button type="button" onClick={() => onStop(buildStats())}>
          {t.stop}
        </button>
        {remaining !== null && (
          <span aria-label={t.timeRemaining}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}
          </span>
        )}
      </div>
    </main>
  )
}
