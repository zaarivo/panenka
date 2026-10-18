import { useState } from 'react'
import { BadgeCelebration } from './components/fame/BadgeCelebration'
import { Navigation, type Tab } from './components/Navigation'
import { ParentGate } from './components/parent/ParentGate'
import { ParentPanel } from './components/parent/ParentPanel'
import { PinSetupScreen } from './components/parent/PinSetupScreen'
import { AcademyScreen } from './components/screens/AcademyScreen'
import { HallOfFameScreen } from './components/screens/HallOfFameScreen'
import { ShopScreen } from './components/screens/ShopScreen'
import { WardrobeScreen } from './components/screens/WardrobeScreen'
import { useGameState } from './hooks/useGameState'
import { verifyPin } from './lib/parent'

export default function App() {
  const game = useGameState()
  const { save } = game
  const [tab, setTab] = useState<Tab>('wardrobe')
  const [parent, setParent] = useState<'closed' | 'gate' | 'open'>('closed')
  const celebration = game.celebrations[0]

  if (save.parentPinHash === null) return <PinSetupScreen onSetPin={game.setPin} />

  const { settings } = save
  // Nové nastavení, reset nebo import = nové kolo v Akademii podle aktuálních pravidel.
  const academyKey = [game.generation, settings.enabledTypes.join(), settings.minLevel, settings.maxLevel].join('|')

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <main className="min-h-0 flex-1">
        {tab === 'wardrobe' && <WardrobeScreen save={save} onToggleItem={game.toggleItem} />}
        {tab === 'shop' && <ShopScreen save={save} onBuy={game.buy} onGoToAcademy={() => setTab('academy')} />}
        {/* Akademie zůstává připojená, aby přepnutí záložky nesmazalo rozdělané kolo. */}
        <div className={tab === 'academy' ? 'h-full' : 'hidden'}>
          <AcademyScreen
            key={academyKey}
            save={save}
            onCorrect={game.answerCorrect}
            onWrong={game.answerWrong}
            onSkip={game.skipProblem}
            onReceiveGold={game.receiveGold}
            onSoundChange={game.setSoundOn}
            onGoToShop={() => setTab('shop')}
          />
        </div>
        {tab === 'fame' && <HallOfFameScreen save={save} onOpenParent={() => setParent('gate')} />}
      </main>
      <Navigation active={tab} onChange={setTab} />

      {celebration && parent === 'closed' && (
        <BadgeCelebration
          key={celebration.id}
          badge={celebration}
          soundOn={settings.soundOn}
          onClose={game.dismissCelebration}
          onShowWardrobe={() => setTab('wardrobe')}
        />
      )}

      {parent === 'gate' && (
        <ParentGate checkPin={(pin) => verifyPin(save, pin)} onUnlock={() => setParent('open')} onCancel={() => setParent('closed')} />
      )}
      {parent === 'open' && (
        <ParentPanel
          save={save}
          onChangeSettings={game.changeSettings}
          onReplaceSave={game.replaceSave}
          onReset={game.reset}
          onClose={() => setParent('closed')}
        />
      )}
    </div>
  )
}
