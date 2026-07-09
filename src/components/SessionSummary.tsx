import type { SessionSettings, SessionStats } from '../game/types'

type Props = {
  settings: SessionSettings
  stats: SessionStats
  onRestart: () => void
  onSetup: () => void
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function SessionSummary({
  settings,
  stats,
  onRestart,
  onSetup,
}: Props) {
  return (
    <main className="summary-screen">
      <section className="summary-header">
        <p className="eyebrow">Session complete</p>
        <h1>Fishing Pond</h1>
        <p>
          {settings.age} + {settings.personality} mode
        </p>
      </section>

      <dl className="summary-grid">
        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(stats.duration)}</dd>
        </div>
        <div>
          <dt>Touches</dt>
          <dd>{stats.touches}</dd>
        </div>
        <div>
          <dt>Fish reactions</dt>
          <dd>{stats.catches}</dd>
        </div>
        <div>
          <dt>Average reaction</dt>
          <dd>
            {stats.averageReactionTime > 0
              ? `${stats.averageReactionTime.toFixed(1)}s`
              : 'Not yet'}
          </dd>
        </div>
        <div>
          <dt>Favorite fish</dt>
          <dd>{stats.favoriteFishType}</dd>
        </div>
      </dl>

      <div className="summary-actions">
        <button className="primary-action" type="button" onClick={onRestart}>
          Play Again
        </button>
        <button className="secondary-action" type="button" onClick={onSetup}>
          Change Setup
        </button>
      </div>
    </main>
  )
}
