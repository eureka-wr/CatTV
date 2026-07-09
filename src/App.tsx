import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { ModeSelector } from './components/ModeSelector'
import { SessionSummary } from './components/SessionSummary'
import type { SessionSettings, SessionStats } from './game/types'
import './App.css'

type Screen = 'setup' | 'game' | 'summary'

const initialSettings: SessionSettings = {
  age: 'adult',
  personality: 'curious',
  timer: 300,
}

function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settings, setSettings] = useState(initialSettings)
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
        stats={stats}
        onRestart={startGame}
        onSetup={() => setScreen('setup')}
      />
    )
  }

  return (
    <ModeSelector
      settings={settings}
      onChange={setSettings}
      onStart={startGame}
    />
  )
}

export default App
