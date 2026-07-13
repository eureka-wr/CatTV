import { copy } from '../i18n'
import type { GameId } from '../game/games'
import type { Language } from '../game/types'

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
  { id: 'mouse', ready: true, className: 'mouse-tile' },
  { id: 'dragonfly', ready: true, className: 'dragonfly-tile' },
  { id: 'butterfly', ready: true, className: 'butterfly-tile' },
  { id: 'bird', ready: true, className: 'bird-tile' },
  { id: 'cricket', ready: true, className: 'cricket-tile' },
  { id: 'frog', ready: true, className: 'frog-tile' },
  { id: 'gecko', ready: true, className: 'gecko-tile' },
  { id: 'beetle', ready: true, className: 'beetle-tile' },
  { id: 'snake', ready: true, className: 'snake-tile' },
  { id: 'squirrel', ready: true, className: 'squirrel-tile' },
  { id: 'firefly', ready: true, className: 'firefly-tile' },
]

const gameLabels: Record<GameId, string> = {
  fish: '小鱼',
  mouse: '老鼠',
  dragonfly: '蜻蜓',
  butterfly: '蝴蝶',
  bird: '小鸟',
  cricket: '蟋蟀',
  frog: '青蛙',
  gecko: '壁虎',
  beetle: '甲虫',
  snake: '小蛇',
  squirrel: '松鼠',
  firefly: '萤火虫',
}

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
    </svg>
  )
}

function ButterflyIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow" cx="90" cy="90" r="66" />
      <ellipse className="butterfly-wing left" cx="64" cy="78" rx="34" ry="42" />
      <ellipse className="butterfly-wing right" cx="116" cy="78" rx="34" ry="42" />
      <ellipse className="butterfly-wing small left" cx="70" cy="118" rx="25" ry="26" />
      <ellipse className="butterfly-wing small right" cx="110" cy="118" rx="25" ry="26" />
      <path className="butterfly-body" d="M90 48c9 22 9 68 0 92-9-24-9-70 0-92Z" />
    </svg>
  )
}

function BirdIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <path className="bird-wing" d="M50 94c26-42 57-46 88-8-32-12-62-7-88 8Z" />
      <ellipse className="bird-body" cx="92" cy="98" rx="45" ry="28" />
      <path className="bird-beak" d="m132 93 28 10-28 12z" />
      <circle className="fish-eye" cx="114" cy="88" r="5" />
    </svg>
  )
}

function CricketIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <ellipse className="cricket-body" cx="90" cy="98" rx="42" ry="25" />
      <path className="cricket-leg" d="M58 108 28 142M122 108l30 34M66 86 38 64M114 86l28-22" />
      <circle className="fish-eye" cx="114" cy="91" r="5" />
    </svg>
  )
}

function FrogIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow" cx="90" cy="90" r="66" />
      <ellipse className="frog-body" cx="90" cy="102" rx="48" ry="34" />
      <circle className="frog-eye" cx="67" cy="72" r="15" />
      <circle className="frog-eye" cx="113" cy="72" r="15" />
      <circle className="fish-eye" cx="67" cy="72" r="5" />
      <circle className="fish-eye" cx="113" cy="72" r="5" />
    </svg>
  )
}

function GeckoIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <path className="gecko-tail" d="M48 112c-30 16-21 43 10 27" />
      <ellipse className="gecko-body" cx="92" cy="94" rx="44" ry="23" />
      <circle className="gecko-head" cx="128" cy="90" r="20" />
      <path className="gecko-leg" d="M70 78 45 56M74 111 48 134M107 78l20-25M111 112l23 20" />
      <circle className="fish-eye" cx="134" cy="84" r="4" />
    </svg>
  )
}

function BeetleIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <ellipse className="beetle-shell" cx="90" cy="96" rx="43" ry="48" />
      <path className="beetle-line" d="M90 52v88M56 80H32M124 80h24M54 112H30M126 112h24" />
      <circle className="fish-eye" cx="77" cy="66" r="4" />
      <circle className="fish-eye" cx="103" cy="66" r="4" />
    </svg>
  )
}

function SnakeIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <path className="snake-body" d="M35 110c25-44 50 40 80-4 16-24 32-13 40 0" />
      <circle className="snake-head" cx="146" cy="104" r="17" />
      <circle className="fish-eye" cx="150" cy="99" r="4" />
    </svg>
  )
}

function SquirrelIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="tile-glow muted" cx="90" cy="90" r="66" />
      <path className="squirrel-tail" d="M60 108c-38-52 37-83 44-34 4 29-23 32-34 18" />
      <ellipse className="squirrel-body" cx="101" cy="103" rx="36" ry="29" />
      <circle className="squirrel-head" cx="130" cy="82" r="21" />
      <circle className="fish-eye" cx="137" cy="78" r="4" />
    </svg>
  )
}

function FireflyIcon() {
  return (
    <svg viewBox="0 0 180 180" aria-hidden="true">
      <circle className="firefly-glow" cx="90" cy="96" r="58" />
      <ellipse className="wing" cx="72" cy="76" rx="28" ry="18" />
      <ellipse className="wing" cx="108" cy="76" rx="28" ry="18" />
      <path className="dragonfly-body" d="M90 64c10 18 10 54 0 74-10-20-10-56 0-74Z" />
      <circle className="fish-eye" cx="94" cy="62" r="4" />
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

  if (id === 'dragonfly') return <DragonflyIcon />
  if (id === 'butterfly') return <ButterflyIcon />
  if (id === 'bird') return <BirdIcon />
  if (id === 'cricket') return <CricketIcon />
  if (id === 'frog') return <FrogIcon />
  if (id === 'gecko') return <GeckoIcon />
  if (id === 'beetle') return <BeetleIcon />
  if (id === 'snake') return <SnakeIcon />
  if (id === 'squirrel') return <SquirrelIcon />
  return <FireflyIcon />
}

export function GameLobby({ language, onStart }: Props) {
  const t = copy[language]

  return (
    <main className="lobby-screen" lang={language === 'zh' ? 'zh-Hans' : 'en'}>
      <section className="game-grid" aria-label={t.title}>
        {games.map((game) => (
          <button
            aria-label={gameLabels[game.id]}
            className={`game-tile ${game.className}`}
            data-label={gameLabels[game.id]}
            key={game.id}
            title={gameLabels[game.id]}
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
