import { copy, languageNames } from '../i18n'
import type {
  CatAge,
  CatPersonality,
  Language,
  SessionDuration,
  SessionSettings,
} from '../game/types'

type Props = {
  settings: SessionSettings
  language: Language
  onLanguageChange: (language: Language) => void
  onChange: (settings: SessionSettings) => void
  onStart: () => void
}

const ages: CatAge[] = ['kitten', 'adult', 'senior']
const personalities: CatPersonality[] = ['calm', 'curious', 'hunter', 'lazy']
const durations: SessionDuration[] = [3, 5, 'endless']

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
          <legend>{t.playTime}</legend>
          <div className="timer-row">
            {durations.map((duration) => (
              <button
                className={settings.duration === duration ? 'selected' : ''}
                key={duration}
                type="button"
                onClick={() => onChange({ ...settings, duration })}
              >
                <strong>{t.durations[duration].label}</strong>
                <span>{t.durations[duration].detail}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {settings.duration === 'endless' && (
          <p className="endless-note">{t.endlessSetupNote}</p>
        )}

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
