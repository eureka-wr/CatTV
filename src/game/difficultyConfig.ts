import type { CatAge, CatPersonality, DifficultyConfig } from './types'

const agePresets: Record<CatAge, DifficultyConfig> = {
  kitten: {
    fishSpeed: 42,
    fishSize: 44,
    reactionDistance: 64,
    hidingFrequency: 0.18,
    directionChangeFrequency: 0.34,
    jumpFrequency: 0.2,
    soundIntensity: 0.55,
    quietAfterInteractions: 5,
    quietMinDuration: 10,
    quietMaxDuration: 18,
    quietSlowMultiplier: 0.38,
  },
  adult: {
    fishSpeed: 58,
    fishSize: 36,
    reactionDistance: 52,
    hidingFrequency: 0.34,
    directionChangeFrequency: 0.44,
    jumpFrequency: 0.16,
    soundIntensity: 0.48,
    quietAfterInteractions: 4,
    quietMinDuration: 12,
    quietMaxDuration: 24,
    quietSlowMultiplier: 0.32,
  },
  senior: {
    fishSpeed: 34,
    fishSize: 48,
    reactionDistance: 70,
    hidingFrequency: 0.14,
    directionChangeFrequency: 0.24,
    jumpFrequency: 0.08,
    soundIntensity: 0.32,
    quietAfterInteractions: 4,
    quietMinDuration: 14,
    quietMaxDuration: 28,
    quietSlowMultiplier: 0.24,
  },
}

const personalityAdjustments: Record<
  CatPersonality,
  Partial<DifficultyConfig>
> = {
  calm: {
    fishSpeed: 0.82,
    hidingFrequency: 0.72,
    directionChangeFrequency: 0.78,
    jumpFrequency: 0.6,
    soundIntensity: 0.82,
    quietAfterInteractions: 0.8,
    quietMaxDuration: 1.15,
  },
  curious: {
    fishSpeed: 0.96,
    hidingFrequency: 1.26,
    directionChangeFrequency: 1.05,
    jumpFrequency: 1.45,
    soundIntensity: 0.92,
    quietAfterInteractions: 1,
  },
  hunter: {
    fishSpeed: 1.28,
    fishSize: 0.9,
    reactionDistance: 0.9,
    hidingFrequency: 1.24,
    directionChangeFrequency: 1.38,
    jumpFrequency: 1.15,
    soundIntensity: 1,
    quietAfterInteractions: 0.75,
    quietSlowMultiplier: 0.9,
  },
  lazy: {
    fishSpeed: 0.74,
    fishSize: 1.18,
    reactionDistance: 1.22,
    hidingFrequency: 0.65,
    directionChangeFrequency: 0.82,
    jumpFrequency: 0.7,
    soundIntensity: 0.78,
    quietAfterInteractions: 0.8,
    quietSlowMultiplier: 0.75,
  },
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

export function getDifficultyConfig(
  age: CatAge,
  personality: CatPersonality,
): DifficultyConfig {
  const base = agePresets[age]
  const adjustment = personalityAdjustments[personality]

  return {
    fishSpeed: clamp(base.fishSpeed * (adjustment.fishSpeed ?? 1), 24, 92),
    fishSize: clamp(base.fishSize * (adjustment.fishSize ?? 1), 28, 58),
    reactionDistance: clamp(
      base.reactionDistance * (adjustment.reactionDistance ?? 1),
      42,
      86,
    ),
    hidingFrequency: clamp(
      base.hidingFrequency * (adjustment.hidingFrequency ?? 1),
      0.06,
      0.65,
    ),
    directionChangeFrequency: clamp(
      base.directionChangeFrequency *
        (adjustment.directionChangeFrequency ?? 1),
      0.16,
      0.82,
    ),
    jumpFrequency: clamp(
      base.jumpFrequency * (adjustment.jumpFrequency ?? 1),
      0.02,
      0.46,
    ),
    soundIntensity: clamp(
      base.soundIntensity * (adjustment.soundIntensity ?? 1),
      0.18,
      0.72,
    ),
    quietAfterInteractions: Math.round(
      clamp(
        base.quietAfterInteractions *
          (adjustment.quietAfterInteractions ?? 1),
        2,
        8,
      ),
    ),
    quietMinDuration: clamp(
      base.quietMinDuration * (adjustment.quietMinDuration ?? 1),
      8,
      20,
    ),
    quietMaxDuration: clamp(
      base.quietMaxDuration * (adjustment.quietMaxDuration ?? 1),
      12,
      30,
    ),
    quietSlowMultiplier: clamp(
      base.quietSlowMultiplier * (adjustment.quietSlowMultiplier ?? 1),
      0.18,
      0.55,
    ),
  }
}
