import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameLobby, type GameId } from './components/GameLobby'
import type { Language, SessionStats } from './game/types'
import { DEFAULT_SETTINGS } from './game/session'
import './App.css'

type Screen = 'lobby' | 'game'
const gameOrder: GameId[] = ['fish', 'mouse', 'dragonfly']

function App() {
  const [screen, setScreen] = useState<Screen>('lobby')
  const [language, setLanguage] = useState<Language>('en')
  const [paused, setPaused] = useState(false)
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null)

  const startGame = (gameId: GameId) => {
    setPaused(false)
    setSelectedGame(gameId)
    setScreen('game')
  }

  const stopGame = useCallback((_nextStats: SessionStats) => {
    setPaused(false)
    setSelectedGame(null)
    setScreen('lobby')
  }, [])

  const switchGame = useCallback((direction: -1 | 1) => {
    setPaused(false)
    setSelectedGame((currentGame) => {
      const currentIndex = Math.max(0, gameOrder.indexOf(currentGame ?? 'fish'))
      const nextIndex =
        (currentIndex + direction + gameOrder.length) % gameOrder.length
      return gameOrder[nextIndex]
    })
  }, [])

  if (screen === 'game' && selectedGame) {
    return (
      <GameCanvas
        gameId={selectedGame}
        settings={DEFAULT_SETTINGS}
        language={language}
        onLanguageChange={setLanguage}
        paused={paused}
        onPauseToggle={() => setPaused((value) => !value)}
        onPreviousGame={() => switchGame(-1)}
        onNextGame={() => switchGame(1)}
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
