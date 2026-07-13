import type {
  CatAge,
  CatPersonality,
  FishCount,
  Language,
  SessionDuration,
} from './game/types'

export const languageNames: Record<Language, string> = {
  en: 'English',
  zh: '中文',
}

export const copy = {
  en: {
    appLabel: 'Cat TV Game 01',
    title: 'Fishing Pond',
    intro:
      'A soft, high-contrast pond where fish glide, pause, hide, and splash away when touched.',
    language: 'Language',
    catAge: 'Cat age',
    catPersonality: 'Cat personality',
    fishCount: 'Number of fish',
    playTime: 'Play time',
    startGame: 'Start Game',
    endlessSetupNote:
      'Endless play continues until stopped. Keep the device in a secure position and check on your cat and device regularly.',
    ownerNote: 'Owner note',
    safety:
      'Use guided access or screen lock if available. Supervise play and stop if your cat seems frustrated or overstimulated.',
    gameCanvas: 'Fishing Pond game canvas',
    ownerControls: 'Owner controls',
    pauseGame: 'Pause game',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    holdToStop: 'Hold to stop',
    timeRemaining: 'Time remaining',
    sessionComplete: 'Session complete',
    sessionLength: 'Session length',
    touches: 'Touches',
    successfulTouches: 'Successful fish touches',
    successRate: 'Success rate',
    fishCountUsed: 'Fish count',
    ageMode: 'Cat age mode',
    personalityMode: 'Cat personality mode',
    quietIntervals: 'Quiet intervals',
    averageReaction: 'Average reaction',
    favoriteFish: 'Favorite fish',
    notYet: 'Not yet',
    modeSuffix: 'mode',
    playAgain: 'Play Again',
    changeSetup: 'Change Setup',
    ages: {
      kitten: { label: 'Kitten', detail: 'Large, bright, forgiving fish' },
      adult: { label: 'Adult', detail: 'Balanced motion and hiding' },
      senior: { label: 'Senior', detail: 'Slow, clear, gentle play' },
    },
    personalities: {
      calm: { label: 'Calm', detail: 'Relaxed pond watching' },
      curious: { label: 'Curious', detail: 'Peeks, bubbles, small jumps' },
      hunter: { label: 'Hunter', detail: 'Sharper turns and escapes' },
      lazy: { label: 'Lazy', detail: 'Slow fish near the middle' },
    },
    fishCounts: {
      1: { label: '1 fish', detail: 'Focused play', badge: 'Recommended' },
      2: { label: '2 fish', detail: 'More variety', badge: 'Optional' },
    },
    durations: {
      3: { label: '3 min', detail: 'Recommended' },
      5: { label: '5 min', detail: 'Short supervised play' },
      endless: { label: 'Endless', detail: 'For independent play' },
    },
    fishTypes: {
      'sunny gold': 'sunny gold',
      'moon blue': 'moon blue',
      'white flash': 'white flash',
      'deep teal': 'deep teal',
    },
  },
  zh: {
    appLabel: 'Cat TV 游戏 01',
    title: '钓鱼池',
    intro: '一个柔和、高对比度的数字池塘：鱼儿会游动、停顿、躲藏，被触碰时轻轻溅水逃开。',
    language: '语言',
    catAge: '猫咪年龄',
    catPersonality: '猫咪性格',
    fishCount: '鱼儿数量',
    playTime: '游戏时长',
    startGame: '开始游戏',
    endlessSetupNote: '不限时模式会持续到主人手动停止。请固定好设备，并定期查看猫咪和设备状态。',
    ownerNote: '主人提示',
    safety: '如设备支持，请开启引导式访问或屏幕锁定。请全程陪玩，若猫咪焦躁或过度兴奋，请停止游戏。',
    gameCanvas: '钓鱼池游戏画布',
    ownerControls: '主人控制',
    pauseGame: '暂停游戏',
    pause: '暂停',
    resume: '继续',
    stop: '停止',
    holdToStop: '长按停止',
    timeRemaining: '剩余时间',
    sessionComplete: '本次游戏结束',
    sessionLength: '游戏时长',
    touches: '触碰次数',
    successfulTouches: '成功触碰',
    successRate: '触碰成功率',
    fishCountUsed: '鱼儿数量',
    ageMode: '年龄模式',
    personalityMode: '性格模式',
    quietIntervals: '安静间隔',
    averageReaction: '平均反应',
    favoriteFish: '最喜欢的鱼',
    notYet: '暂无',
    modeSuffix: '模式',
    playAgain: '再玩一次',
    changeSetup: '更改设置',
    ages: {
      kitten: { label: '幼猫', detail: '鱼儿更大、更亮、更容易碰到' },
      adult: { label: '成年猫', detail: '速度、躲藏和转向更均衡' },
      senior: { label: '老年猫', detail: '移动更慢、对比更清晰、声音更温和' },
    },
    personalities: {
      calm: { label: '安静型', detail: '节奏放松，更适合观察' },
      curious: { label: '好奇型', detail: '更多气泡、探头和小跳跃' },
      hunter: { label: '猎手型', detail: '转向更快，逃脱更灵活' },
      lazy: { label: '懒懒型', detail: '大鱼慢游，更靠近屏幕中心' },
    },
    fishCounts: {
      1: { label: '1 条鱼', detail: '专注玩法', badge: '推荐' },
      2: { label: '2 条鱼', detail: '更多变化', badge: '可选' },
    },
    durations: {
      3: { label: '3 分钟', detail: '推荐' },
      5: { label: '5 分钟', detail: '短时陪玩' },
      endless: { label: '不限时', detail: '适合独立玩耍' },
    },
    fishTypes: {
      'sunny gold': '阳光金鱼',
      'moon blue': '月光蓝鱼',
      'white flash': '白闪鱼',
      'deep teal': '深青鱼',
    },
  },
} satisfies Record<
  Language,
  {
    appLabel: string
    title: string
    intro: string
    language: string
    catAge: string
    catPersonality: string
    fishCount: string
    playTime: string
    startGame: string
    endlessSetupNote: string
    ownerNote: string
    safety: string
    gameCanvas: string
    ownerControls: string
    pauseGame: string
    pause: string
    resume: string
    stop: string
    holdToStop: string
    timeRemaining: string
    sessionComplete: string
    sessionLength: string
    touches: string
    successfulTouches: string
    successRate: string
    fishCountUsed: string
    ageMode: string
    personalityMode: string
    quietIntervals: string
    averageReaction: string
    favoriteFish: string
    notYet: string
    modeSuffix: string
    playAgain: string
    changeSetup: string
    ages: Record<CatAge, { label: string; detail: string }>
    personalities: Record<CatPersonality, { label: string; detail: string }>
    fishCounts: Record<FishCount, { label: string; detail: string; badge: string }>
    durations: Record<SessionDuration, { label: string; detail: string }>
    fishTypes: Record<'sunny gold' | 'moon blue' | 'white flash' | 'deep teal', string>
  }
>
