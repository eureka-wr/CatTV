import type { CatAge, CatPersonality, SessionSettings, TimerOption } from '../game/types'

type Props = {
  settings: SessionSettings
  onChange: (settings: SessionSettings) => void
  onStart: () => void
}

const ages: Array<{ value: CatAge; label: string; detail: string }> = [
  { value: 'kitten', label: 'Kitten', detail: 'Large, bright, forgiving fish' },
  { value: 'adult', label: 'Adult', detail: 'Balanced motion and hiding' },
  { value: 'senior', label: 'Senior', detail: 'Slow, clear, gentle play' },
]

const personalities: Array<{
  value: CatPersonality
  label: string
  detail: string
}> = [
  { value: 'calm', label: 'Calm', detail: 'Relaxed pond watching' },
  { value: 'curious', label: 'Curious', detail: 'Peeks, bubbles, small jumps' },
  { value: 'hunter', label: 'Hunter', detail: 'Sharper turns and escapes' },
  { value: 'lazy', label: 'Lazy', detail: 'Slow fish near the middle' },
]

const timers: Array<{ value: TimerOption; label: string }> = [
  { value: 300, label: '5 min' },
  { value: 600, label: '10 min' },
  { value: 0, label: 'Endless' },
]

export function ModeSelector({ settings, onChange, onStart }: Props) {
  return (
    <main className="setup-screen">
      <section className="setup-intro" aria-labelledby="game-title">
        <p className="eyebrow">Cat TV Game 01</p>
        <h1 id="game-title">Fishing Pond</h1>
        <p>
          A soft, high-contrast pond where fish glide, pause, hide, and splash
          away when touched.
        </p>
      </section>

      <section className="setup-controls" aria-label="Game setup">
        <fieldset>
          <legend>Cat age</legend>
          <div className="option-grid three">
            {ages.map((age) => (
              <button
                className={settings.age === age.value ? 'selected' : ''}
                key={age.value}
                type="button"
                onClick={() => onChange({ ...settings, age: age.value })}
              >
                <strong>{age.label}</strong>
                <span>{age.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Cat personality</legend>
          <div className="option-grid four">
            {personalities.map((personality) => (
              <button
                className={
                  settings.personality === personality.value ? 'selected' : ''
                }
                key={personality.value}
                type="button"
                onClick={() =>
                  onChange({ ...settings, personality: personality.value })
                }
              >
                <strong>{personality.label}</strong>
                <span>{personality.detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Timer</legend>
          <div className="timer-row">
            {timers.map((timer) => (
              <button
                className={settings.timer === timer.value ? 'selected' : ''}
                key={timer.value}
                type="button"
                onClick={() => onChange({ ...settings, timer: timer.value })}
              >
                {timer.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="primary-action" type="button" onClick={onStart}>
          Start Game
        </button>
      </section>

      <aside className="safety-note">
        <strong>Owner note</strong>
        <span>
          Use guided access or screen lock if available. Supervise play and stop
          if your cat seems frustrated or overstimulated.
        </span>
      </aside>
    </main>
  )
}
