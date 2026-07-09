export type CatAge = 'kitten' | 'adult' | 'senior'
export type CatPersonality = 'calm' | 'curious' | 'hunter' | 'lazy'
export type Language = 'en' | 'zh'
export type TimerOption = 300 | 600 | 0

export type DifficultyConfig = {
  fishCount: number
  fishSpeed: number
  fishSize: number
  reactionDistance: number
  hidingFrequency: number
  directionChangeFrequency: number
  jumpFrequency: number
  soundIntensity: number
}

export type SessionSettings = {
  age: CatAge
  personality: CatPersonality
  timer: TimerOption
}

export type SessionStats = {
  duration: number
  touches: number
  catches: number
  averageReactionTime: number
  favoriteFishType: string
}

export type Fish = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  accent: string
  type: string
  hidden: boolean
  pausedUntil: number
  hideUntil: number
  jumpUntil: number
  bornAt: number
  nextDecisionAt: number
  nextBubbleAt: number
  escapingUntil: number
}

export type Ripple = {
  id: number
  x: number
  y: number
  age: number
  maxAge: number
  kind: 'miss' | 'catch' | 'bubble'
}
