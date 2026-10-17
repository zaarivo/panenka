import { useState } from 'react'
import { Navigation, type Tab } from './components/Navigation'
import { AcademyScreen } from './components/screens/AcademyScreen'
import { ShopScreen } from './components/screens/ShopScreen'
import { WardrobeScreen } from './components/screens/WardrobeScreen'
import { useGameState } from './hooks/useGameState'

export default function App() {
  const game = useGameState()
  const { save } = game
  const [tab, setTab] = useState<Tab>('wardrobe')

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
        {tab === 'fame' && (
          <p className="flex h-full items-center justify-center p-6 text-center text-xl text-violet-400">Síň slávy se brzy otevře.</p>
        )}
      </main>
      <Navigation active={tab} onChange={setTab} />
    </div>
  )
}
