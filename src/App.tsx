import { useCallback, useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { GameLobby } from './components/GameLobby'
import { gameIds, type GameId } from './game/games'
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
      const currentIndex = Math.max(0, gameIds.indexOf(currentGame ?? 'fish'))
      const nextIndex =
        (currentIndex + direction + gameIds.length) % gameIds.length
      return gameIds[nextIndex]
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
