import type { CatAge, CatPersonality, Language, TimerOption } from './game/types'

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
    timer: 'Timer',
    startGame: 'Start Game',
    ownerNote: 'Owner note',
    safety:
      'Use guided access or screen lock if available. Supervise play and stop if your cat seems frustrated or overstimulated.',
    gameCanvas: 'Fishing Pond game canvas',
    ownerControls: 'Owner controls',
    pauseGame: 'Pause game',
    pause: 'Pause',
    resume: 'Resume',
    stop: 'Stop',
    timeRemaining: 'Time remaining',
    sessionComplete: 'Session complete',
    duration: 'Duration',
    touches: 'Touches',
    fishReactions: 'Fish reactions',
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
    timers: {
      300: '5 min',
      600: '10 min',
      0: 'Endless',
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
    timer: '时长',
    startGame: '开始游戏',
    ownerNote: '主人提示',
    safety: '如设备支持，请开启引导式访问或屏幕锁定。请全程陪玩，若猫咪焦躁或过度兴奋，请停止游戏。',
    gameCanvas: '钓鱼池游戏画布',
    ownerControls: '主人控制',
    pauseGame: '暂停游戏',
    pause: '暂停',
    resume: '继续',
    stop: '停止',
    timeRemaining: '剩余时间',
    sessionComplete: '本次游戏结束',
    duration: '时长',
    touches: '触碰次数',
    fishReactions: '鱼儿反应',
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
    timers: {
      300: '5 分钟',
      600: '10 分钟',
      0: '不限时',
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
    timer: string
    startGame: string
    ownerNote: string
    safety: string
    gameCanvas: string
    ownerControls: string
    pauseGame: string
    pause: string
    resume: string
    stop: string
    timeRemaining: string
    sessionComplete: string
    duration: string
    touches: string
    fishReactions: string
    averageReaction: string
    favoriteFish: string
    notYet: string
    modeSuffix: string
    playAgain: string
    changeSetup: string
    ages: Record<CatAge, { label: string; detail: string }>
    personalities: Record<CatPersonality, { label: string; detail: string }>
    timers: Record<TimerOption, string>
    fishTypes: Record<'sunny gold' | 'moon blue' | 'white flash' | 'deep teal', string>
  }
>
