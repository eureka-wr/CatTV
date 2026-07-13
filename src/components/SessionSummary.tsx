import { copy } from '../i18n'
import type { SessionSettings, SessionStats } from '../game/types'
import type { Language } from '../game/types'
import { getSuccessRate } from '../game/session'

const fishTypeKeys = ['sunny gold', 'moon blue', 'white flash', 'deep teal'] as const
type FishTypeKey = (typeof fishTypeKeys)[number]

type Props = {
  settings: SessionSettings
  language: Language
  onLanguageChange: (language: Language) => void
  stats: SessionStats
  onRestart: () => void
  onSetup: () => void
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const isFishTypeKey = (value: string): value is FishTypeKey =>
  fishTypeKeys.includes(value as FishTypeKey)

export function SessionSummary({
  settings,
  language,
  onLanguageChange,
  stats,
  onRestart,
  onSetup,
}: Props) {
  const t = copy[language]
  const successRate = Math.round(getSuccessRate(stats) * 100)
  const favoriteFish =
    stats.favoriteFishType === 'Not yet'
      ? t.notYet
      : isFishTypeKey(stats.favoriteFishType)
        ? t.fishTypes[stats.favoriteFishType]
        : stats.favoriteFishType

  return (
    <main className="summary-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <div className="language-switch" aria-label={t.language}>
        {(['en', 'zh'] as const).map((item) => (
          <button
            className={language === item ? 'selected' : ''}
            key={item}
            type="button"
            onClick={() => onLanguageChange(item)}
          >
            {item === 'en' ? 'English' : '中文'}
          </button>
        ))}
      </div>

      <section className="summary-header">
        <p className="eyebrow">{t.sessionComplete}</p>
        <h1>{t.title}</h1>
        <p>
          {t.ages[settings.age].label} +{' '}
          {t.personalities[settings.personality].label} {t.modeSuffix}
        </p>
      </section>

      <dl className="summary-grid">
        <div>
          <dt>{t.sessionLength}</dt>
          <dd>{formatDuration(stats.duration)}</dd>
        </div>
        <div>
          <dt>{t.touches}</dt>
          <dd>{stats.touches}</dd>
        </div>
        <div>
          <dt>{t.successfulTouches}</dt>
          <dd>{stats.catches}</dd>
        </div>
        <div>
          <dt>{t.successRate}</dt>
          <dd>{successRate}%</dd>
        </div>
        <div>
          <dt>{t.fishCountUsed}</dt>
          <dd>{t.fishCounts[stats.fishCount].label}</dd>
        </div>
        <div>
          <dt>{t.ageMode}</dt>
          <dd>{t.ages[stats.age].label}</dd>
        </div>
        <div>
          <dt>{t.personalityMode}</dt>
          <dd>{t.personalities[stats.personality].label}</dd>
        </div>
        <div>
          <dt>{t.quietIntervals}</dt>
          <dd>{stats.quietIntervals}</dd>
        </div>
        <div>
          <dt>{t.averageReaction}</dt>
          <dd>
            {stats.averageReactionTime > 0
              ? `${stats.averageReactionTime.toFixed(1)}s`
              : t.notYet}
          </dd>
        </div>
        <div>
          <dt>{t.favoriteFish}</dt>
          <dd>{favoriteFish}</dd>
        </div>
      </dl>

      <div className="summary-actions">
        <button className="primary-action" type="button" onClick={onRestart}>
          {t.playAgain}
        </button>
        <button className="secondary-action" type="button" onClick={onSetup}>
          {t.changeSetup}
        </button>
      </div>
    </main>
  )
}
