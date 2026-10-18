import { useCallback, useState } from 'react'
import { BadgeCelebration } from './components/fame/BadgeCelebration'
import { LockScreen } from './components/lock/LockScreen'
import { PracticePicker } from './components/lock/PracticePicker'
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
import { Dialog } from './components/ui/Dialog'
import { useGameState } from './hooks/useGameState'
import { usePlayTime, type TimeChoice } from './hooks/usePlayTime'
import { celebrationKey } from './lib/celebrations'
import type { Problem } from './lib/mathGenerator'
import { MEDAL_NAMES } from './lib/medals'
import { verifyPin } from './lib/parent'
import { TOPIC_LABELS, toggleTier } from './lib/topics'
import type { Tier } from './types'

export default function App() {
  const game = useGameState()
  const playTime = usePlayTime()
  const { save } = game
  const [tab, setTab] = useState<Tab>('wardrobe')
  const [parent, setParent] = useState<'closed' | 'gate' | 'open'>('closed')
  /** Odemykání po zamčení: PIN → Krok 1 (co procvičíme) → Krok 2 (čas). */
  const [unlocking, setUnlocking] = useState<'none' | 'pin' | 'practice' | 'time'>('none')
  const [academyBusy, setAcademyBusy] = useState(false)
  const celebration = game.celebrations[0]

  const { answerCorrect, receiveGold } = game
  const { addEarned } = playTime
  const onCorrect = useCallback(
    (problem: Problem, nextTier: Tier, success: boolean) => {
      const reward = answerCorrect(problem, nextTier, success)
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
          setUnlocking('practice')
        }}
      />
    )
  }

  if (unlocking === 'practice') {
    return (
      <PracticePicker
        save={save}
        onToggle={(topic, tier) => game.changeTopics(toggleTier(save.settings.topics, topic, tier))}
        onAccept={game.acceptAdvice}
        onSnooze={game.snoozeAdvice}
        onNext={() => setUnlocking('time')}
      />
    )
  }

  if (unlocking === 'time') return <TimePicker onStart={startPlaying} onBack={() => setUnlocking('practice')} />

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
            onUnlock={() => setUnlocking('practice')}
            onCancel={() => setUnlocking('none')}
            cancelLabel="Zpět"
          />
        )}
      </>
    )
  }

  const { settings } = save
  // Nové nastavení, reset nebo import = nové kolo v Akademii podle aktuálních pravidel.
  const academyKey = `${game.generation}|${JSON.stringify(settings.topics)}`

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
            active={tab === 'academy' && parent === 'closed' && !celebration}
          />
        </div>
        {tab === 'fame' && <HallOfFameScreen save={save} onOpenParent={() => setParent('gate')} />}
      </main>
      <Navigation active={tab} onChange={setTab} />

      {celebration?.kind === 'medal' && parent === 'closed' && (
        <Dialog
          key={celebrationKey(celebration)}
          title={`${MEDAL_NAMES[celebration.medal.tier]}!`}
          onClose={game.dismissCelebration}
          actions={[{ label: 'Hurá!', onClick: game.dismissCelebration, primary: true }]}
        >
          <p>
            {TOPIC_LABELS[celebration.medal.topic]} · {celebration.medal.target} příkladů správně
          </p>
        </Dialog>
      )}
      {celebration?.kind === 'badge' && parent === 'closed' && (
        <BadgeCelebration
          key={celebrationKey(celebration)}
          badge={celebration.badge}
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
          onChangeTopics={game.changeTopics}
          onSoundChange={game.setSoundOn}
          onReplaceSave={game.replaceSave}
          onReset={game.reset}
          onClose={() => setParent('closed')}
        />
      )}
    </div>
  )
}
