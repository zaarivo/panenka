import { useState } from 'react'
import { BadgeCelebration } from './components/fame/BadgeCelebration'
import { Navigation, type Tab } from './components/Navigation'
import { AcademyScreen } from './components/screens/AcademyScreen'
import { HallOfFameScreen } from './components/screens/HallOfFameScreen'
import { ShopScreen } from './components/screens/ShopScreen'
import { WardrobeScreen } from './components/screens/WardrobeScreen'
import { useGameState } from './hooks/useGameState'

export default function App() {
  const game = useGameState()
  const { save } = game
  const [tab, setTab] = useState<Tab>('wardrobe')
  const celebration = game.celebrations[0]

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <main className="min-h-0 flex-1">
        {tab === 'wardrobe' && <WardrobeScreen save={save} onToggleItem={game.toggleItem} />}
        {tab === 'shop' && <ShopScreen save={save} onBuy={game.buy} onGoToAcademy={() => setTab('academy')} />}
        {/* Akademie zůstává připojená, aby přepnutí záložky nesmazalo rozdělané kolo. */}
        <div className={tab === 'academy' ? 'h-full' : 'hidden'}>
          <AcademyScreen
            save={save}
            onCorrect={game.answerCorrect}
            onWrong={game.answerWrong}
            onReceiveGold={game.receiveGold}
            onSoundChange={game.setSoundOn}
            onGoToShop={() => setTab('shop')}
          />
        </div>
        {tab === 'fame' && <HallOfFameScreen save={save} />}
      </main>
      <Navigation active={tab} onChange={setTab} />

      {celebration && (
        <BadgeCelebration
          key={celebration.id}
          badge={celebration}
          soundOn={save.settings.soundOn}
          onClose={game.dismissCelebration}
          onShowWardrobe={() => setTab('wardrobe')}
        />
      )}
    </div>
  )
}
