import { copy, languageNames } from '../i18n'
import type { CatAge, CatPersonality, Language, SessionSettings, TimerOption } from '../game/types'

type Props = {
  settings: SessionSettings
  language: Language
  onLanguageChange: (language: Language) => void
  onChange: (settings: SessionSettings) => void
  onStart: () => void
}

const ages: CatAge[] = ['kitten', 'adult', 'senior']
const personalities: CatPersonality[] = ['calm', 'curious', 'hunter', 'lazy']
const timers: TimerOption[] = [300, 600, 0]

export function ModeSelector({
  settings,
  language,
  onLanguageChange,
  onChange,
  onStart,
}: Props) {
  const t = copy[language]

  return (
    <main className="setup-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <div className="language-switch" aria-label={t.language}>
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

      <section className="setup-intro" aria-labelledby="game-title">
        <p className="eyebrow">{t.appLabel}</p>
        <h1 id="game-title">{t.title}</h1>
        <p>{t.intro}</p>
      </section>

      <section className="setup-controls" aria-label={t.startGame}>
        <fieldset>
          <legend>{t.catAge}</legend>
          <div className="option-grid three">
            {ages.map((age) => (
              <button
                className={settings.age === age ? 'selected' : ''}
                key={age}
                type="button"
                onClick={() => onChange({ ...settings, age })}
              >
                <strong>{t.ages[age].label}</strong>
                <span>{t.ages[age].detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t.catPersonality}</legend>
          <div className="option-grid four">
            {personalities.map((personality) => (
              <button
                className={
                  settings.personality === personality ? 'selected' : ''
                }
                key={personality}
                type="button"
                onClick={() =>
                  onChange({ ...settings, personality })
                }
              >
                <strong>{t.personalities[personality].label}</strong>
                <span>{t.personalities[personality].detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t.timer}</legend>
          <div className="timer-row">
            {timers.map((timer) => (
              <button
                className={settings.timer === timer ? 'selected' : ''}
                key={timer}
                type="button"
                onClick={() => onChange({ ...settings, timer })}
              >
                {t.timers[timer]}
              </button>
            ))}
          </div>
        </fieldset>

        <button className="primary-action" type="button" onClick={onStart}>
          {t.startGame}
        </button>
      </section>

      <aside className="safety-note">
        <strong>{t.ownerNote}</strong>
        <span>{t.safety}</span>
      </aside>
    </main>
  )
}
