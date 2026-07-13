import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { ModeSelector } from './components/ModeSelector'
import { SessionSummary } from './components/SessionSummary'
import type { Language, SessionStats } from './game/types'
import { DEFAULT_SETTINGS } from './game/session'
import './App.css'

type Screen = 'setup' | 'game' | 'summary'

function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [language, setLanguage] = useState<Language>('en')
  const [paused, setPaused] = useState(false)
  const [stats, setStats] = useState<SessionStats | null>(null)

  const startGame = () => {
    setPaused(false)
    setStats(null)
    setScreen('game')
  }

  const stopGame = useCallback((nextStats: SessionStats) => {
    setStats(nextStats)
    setScreen('summary')
  }, [])

  if (screen === 'game') {
    return (
      <GameCanvas
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
        paused={paused}
        onPauseToggle={() => setPaused((value) => !value)}
        onStop={stopGame}
      />
    )
  }

  if (screen === 'summary' && stats) {
    return (
      <SessionSummary
        settings={settings}
        language={language}
        onLanguageChange={setLanguage}
        stats={stats}
        onRestart={startGame}
        onSetup={() => setScreen('setup')}
      />
    )
  }

  return (
    <ModeSelector
      settings={settings}
      language={language}
      onLanguageChange={setLanguage}
      onChange={setSettings}
      onStart={startGame}
    />
  )
}

export default App
