import { useCallback, useState } from 'react'
import { BadgeCelebration } from './components/fame/BadgeCelebration'
import { LockScreen } from './components/lock/LockScreen'
import { TimePicker } from './components/lock/TimePicker'
import { TimerBar } from './components/lock/TimerBar'
import { Navigation, type Tab } from './components/Navigation'
import { ParentGate } from './components/parent/ParentGate'
import { ParentPanel } from './components/parent/ParentPanel'
import { PinSetupScreen } from './components/parent/PinSetupScreen'
import { AcademyScreen } from './components/screens/AcademyScreen'
import { HallOfFameScreen } from './components/screens/HallOfFameScreen'
import { ShopScreen } from './components/screens/ShopScreen'
import { WardrobeScreen } from './components/screens/WardrobeScreen'
import { useGameState } from './hooks/useGameState'
import { usePlayTime, type TimeChoice } from './hooks/usePlayTime'
import type { Problem } from './lib/mathGenerator'
import { verifyPin } from './lib/parent'
import type { Level } from './types'

export default function App() {
  const game = useGameState()
  const playTime = usePlayTime()
  const { save } = game
  const [tab, setTab] = useState<Tab>('wardrobe')
  const [parent, setParent] = useState<'closed' | 'gate' | 'open'>('closed')
  /** Odemykání po zamčení: nejdřív PIN, pak výběr času. */
  const [unlocking, setUnlocking] = useState<'none' | 'pin' | 'time'>('none')
  const [academyBusy, setAcademyBusy] = useState(false)
  const celebration = game.celebrations[0]

  const { answerCorrect, receiveGold } = game
  const { addEarned } = playTime
  const onCorrect = useCallback(
    (problem: Problem, nextLevel: Level) => {
      const reward = answerCorrect(problem, nextLevel)
      addEarned(reward)
      return reward
    },
    [answerCorrect, addEarned],
  )
  const onReceiveGold = useCallback(
    (amount: number) => {
      receiveGold(amount)
      addEarned(amount)
    },
    [receiveGold, addEarned],
  )

  function startPlaying(choice: TimeChoice) {
    playTime.start(choice)
    setUnlocking('none')
  }

  if (save.parentPinHash === null) {
    return (
      <PinSetupScreen
        onSetPin={(pin) => {
          game.setPin(pin)
          setUnlocking('time')
        }}
      />
    )
  }

  if (unlocking === 'time') return <TimePicker onStart={startPlaying} />

  // Rozdělaný příklad v Akademii smí dopočítat; jinde se zamkne hned.
  const waitingForProblem = playTime.expired && tab === 'academy' && academyBusy
  const locked = playTime.unlock === null || (playTime.expired && !waitingForProblem)

  if (locked) {
    return (
      <>
        <LockScreen
          timeIsUp={playTime.expired}
          earned={playTime.unlock?.earned ?? 0}
          onParent={() => setUnlocking('pin')}
        />
        {unlocking === 'pin' && (
          <ParentGate
            checkPin={(pin) => verifyPin(save, pin)}
            onUnlock={() => setUnlocking('time')}
            onCancel={() => setUnlocking('none')}
            cancelLabel="Zpět"
          />
        )}
      </>
    )
  }

  const { settings } = save
  // Nové nastavení, reset nebo import = nové kolo v Akademii podle aktuálních pravidel.
  const academyKey = [game.generation, settings.enabledTypes.join(), settings.minLevel, settings.maxLevel].join('|')

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      {playTime.remaining !== null && (
        <TimerBar remaining={playTime.remaining} warning={playTime.warning} expired={playTime.expired} />
      )}
      <main className="min-h-0 flex-1">
        {tab === 'wardrobe' && <WardrobeScreen save={save} onToggleItem={game.toggleItem} />}
        {tab === 'shop' && <ShopScreen save={save} onBuy={game.buy} onGoToAcademy={() => setTab('academy')} />}
        {/* Akademie zůstává připojená, aby přepnutí záložky nesmazalo rozdělané kolo. */}
        <div className={tab === 'academy' ? 'h-full' : 'hidden'}>
          <AcademyScreen
            key={academyKey}
            save={save}
            onCorrect={onCorrect}
            onWrong={game.answerWrong}
            onSkip={game.skipProblem}
            onReceiveGold={onReceiveGold}
            onSoundChange={game.setSoundOn}
            onGoToShop={() => setTab('shop')}
            lockRequested={playTime.expired}
            onBusyChange={setAcademyBusy}
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
