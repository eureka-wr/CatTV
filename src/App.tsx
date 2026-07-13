import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameLobby, type GameId } from './components/GameLobby'
import type { Language, SessionStats } from './game/types'
import { DEFAULT_SETTINGS } from './game/session'
import './App.css'

type Screen = 'lobby' | 'game'

function App() {
  const [screen, setScreen] = useState<Screen>('lobby')
  const [language, setLanguage] = useState<Language>('en')
  const [paused, setPaused] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)

  const startGame = (gameId: GameId) => {
    if (gameId !== 'fish') {
      return
    }
    setPaused(false)
    setSelectedGame(gameId)
    setScreen('game')
  }

  const stopGame = useCallback((_nextStats: SessionStats) => {
    setPaused(false)
    setSelectedGame(null)
    setScreen('lobby')
  }, [])

  if (screen === 'game' && selectedGame === 'fish') {
    return (
      <GameCanvas
        settings={DEFAULT_SETTINGS}
        language={language}
        onLanguageChange={setLanguage}
        paused={paused}
        onPauseToggle={() => setPaused((value) => !value)}
        onStop={stopGame}
      />
    )
  }

  return (
    <GameLobby
      language={language}
      onStart={startGame}
    />
  )
}

export default App
