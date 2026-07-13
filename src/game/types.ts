export type CatAge = 'kitten' | 'adult' | 'senior'
export type CatPersonality = 'calm' | 'curious' | 'hunter' | 'lazy'
export type FishCount = 1 | 2
export type Language = 'en' | 'zh'
export type SessionDuration = 3 | 5 | 'endless'

export type DifficultyConfig = {
  fishSpeed: number
  fishSize: number
  reactionDistance: number
  hidingFrequency: number
  directionChangeFrequency: number
  jumpFrequency: number
  soundIntensity: number
  quietAfterInteractions: number
  quietMinDuration: number
  quietMaxDuration: number
  quietSlowMultiplier: number
}

export type SessionSettings = {
  age: CatAge
  duration: SessionDuration
  fishCount: FishCount
  personality: CatPersonality
}

export type SessionStats = {
  age: CatAge
  catches: number
  duration: number
  fishCount: FishCount
  averageReactionTime: number
  favoriteFishType: string
  personality: CatPersonality
  quietIntervals: number
  touches: number
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
  respawnAt: number
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
