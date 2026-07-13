import { copy } from '../i18n'
import type { Language } from '../game/types'

export type GameId = 'fish' | 'mouse' | 'dragonfly'

type Props = {
  language: Language
  onStart: (gameId: GameId) => void
}

type GameTile = {
  id: GameId
  ready: boolean
  className: string
}

const games: GameTile[] = [
  { id: 'fish', ready: true, className: 'fish-tile' },
  { id: 'mouse', ready: false, className: 'mouse-tile' },
  { id: 'dragonfly', ready: false, className: 'dragonfly-tile' },
]

function FishIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow" cx="90" cy="90" r="72" />
      <ellipse className="fish-body" cx="88" cy="92" rx="48" ry="29" />
      <path className="fish-tail" d="M45 92 18 65v54z" />
      <ellipse className="fish-highlight" cx="104" cy="81" rx="20" ry="8" />
      <circle className="fish-eye" cx="124" cy="86" r="5" />
      <path className="bubble-one" d="M58 48a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <path className="bubble-two" d="M83 36a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" />
    </svg>
  )
}

function MouseIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="92" r="68" />
      <path className="mouse-tail" d="M39 110c-22 8-24 29-3 32 20 3 34-18 17-30" />
      <ellipse className="mouse-body" cx="93" cy="98" rx="48" ry="31" />
      <circle className="mouse-ear" cx="63" cy="72" r="17" />
      <circle className="mouse-ear" cx="112" cy="68" r="15" />
      <path className="mouse-nose" d="m133 97 22 11-22 10z" />
      <circle className="mouse-eye" cx="110" cy="91" r="4" />
      <path className="placeholder-mark" d="M70 138h40" />
    </svg>
  )
}

function DragonflyIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="68" />
      <ellipse className="wing wing-left-top" cx="68" cy="64" rx="34" ry="18" />
      <ellipse className="wing wing-right-top" cx="112" cy="64" rx="34" ry="18" />
      <ellipse className="wing wing-left-bottom" cx="70" cy="104" rx="32" ry="16" />
      <ellipse className="wing wing-right-bottom" cx="110" cy="104" rx="32" ry="16" />
      <path className="dragonfly-body" d="M90 42c10 18 10 74 0 100-10-26-10-82 0-100Z" />
      <circle className="dragonfly-head" cx="90" cy="39" r="12" />
      <path className="placeholder-mark" d="M70 145h40" />
    </svg>
  )
}

function GameIcon({ id }: { id: GameId }) {
  if (id === 'fish') {
    return <FishIcon />
  }

  if (id === 'mouse') {
    return <MouseIcon />
  }

  return <DragonflyIcon />
}

export function GameLobby({ language, onStart }: Props) {
  const t = copy[language]

  return (
    <main className="lobby-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <section className="game-grid" aria-label={t.title}>
        {games.map((game) => (
          <button
            aria-label={game.id}
            aria-disabled={!game.ready}
            className={`game-tile ${game.className}`}
            key={game.id}
            type="button"
            onClick={() => onStart(game.id)}
          >
            <GameIcon id={game.id} />
            {!game.ready && <span className="tile-soon" aria-hidden="true" />}
          </button>
        ))}
      </section>
    </main>
  )
}
