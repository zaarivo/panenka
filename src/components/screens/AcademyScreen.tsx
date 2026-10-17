import { useEffect, useRef, useState } from 'react'
import { ROUND_SIZE } from '../../lib/academy'
import { formatGold } from '../../lib/czech'
import { CORRECT_IN_ROW_TO_LEVEL_UP, updateDifficulty, type DifficultyState } from '../../lib/difficulty'
import { rollChestReward } from '../../lib/economy'
import { generateProblem, isCorrectAnswer, type CompareSign, type Problem } from '../../lib/mathGenerator'
import { playChest, playCoin } from '../../lib/sound'
import type { Level, SaveData } from '../../types'
import { CompareButtons } from '../math/CompareButtons'
import { NumericKeyboard } from '../math/NumericKeyboard'
import { ProblemCard } from '../math/ProblemCard'
import { TreasureChest } from '../math/TreasureChest'
import { GoldCounter } from '../ui/Coin'
import { Dialog } from '../ui/Dialog'
import { SoundOffIcon, SoundOnIcon } from '../ui/icons'

const PRAISE = ['Správně!', 'Výborně!', 'Super!', 'Paráda!', 'Skvělé!']
const NEXT_PROBLEM_DELAY_MS = 1200

type Phase = 'answering' | 'wrong' | 'correct' | 'chest' | 'summary'

interface AcademyScreenProps {
  save: SaveData
  onCorrect: (problem: Problem, nextLevel: Level) => number
  onWrong: (problem: Problem, nextLevel: Level) => void
  onReceiveGold: (amount: number) => void
  onSoundChange: (soundOn: boolean) => void
  onGoToShop: () => void
}

export function AcademyScreen({ save, onCorrect, onWrong, onReceiveGold, onSoundChange, onGoToShop }: AcademyScreenProps) {
  const { settings } = save
  const [difficulty, setDifficulty] = useState<DifficultyState>({ level: save.level, correctStreak: 0, mistakeStreak: 0 })
  const [problem, setProblem] = useState(() => generateProblem({ types: settings.enabledTypes, level: save.level }))
  const [input, setInput] = useState('')
  const [phase, setPhase] = useState<Phase>('answering')
  const [solved, setSolved] = useState(0)
  const [earned, setEarned] = useState(0)
  const [reward, setReward] = useState<{ amount: number; key: number } | null>(null)
  const [praise, setPraise] = useState(PRAISE[0])
  const [levelUp, setLevelUp] = useState(false)
  const [chestPending, setChestPending] = useState(false)
  const [chestReward, setChestReward] = useState<number | null>(null)
  const [hintVisible, setHintVisible] = useState(false)

  function nextProblem() {
    setProblem((previous) =>
      generateProblem({ types: settings.enabledTypes, level: difficulty.level, previousKey: previous.key }),
    )
    setInput('')
    setLevelUp(false)
    setHintVisible(false)
    setPhase('answering')
  }

  function continueAfterCorrect() {
    if (chestPending) setPhase('chest')
    else if (solved >= ROUND_SIZE) setPhase('summary')
    else nextProblem()
  }

  const continueRef = useRef(continueAfterCorrect)
  useEffect(() => {
    continueRef.current = continueAfterCorrect
  })

  useEffect(() => {
    if (phase !== 'correct') return
    const timer = setTimeout(() => continueRef.current(), NEXT_PROBLEM_DELAY_MS)
    return () => clearTimeout(timer)
  }, [phase])

  function submit(given: number | CompareSign) {
    if (phase !== 'answering' && phase !== 'wrong') return
    const correct = isCorrectAnswer(problem, given)
    const update = updateDifficulty(difficulty, correct, settings)
    setDifficulty(update.state)

    if (!correct) {
      onWrong(problem, update.state.level)
      setInput('')
      setHintVisible(true)
      setPhase('wrong')
      return
    }

    const amount = onCorrect(problem, update.state.level)
    if (settings.soundOn) playCoin()
    setEarned((total) => total + amount)
    setReward({ amount, key: Date.now() })
    setSolved((count) => count + 1)
    setChestPending(update.streakCompleted)
    setLevelUp(update.levelChange === 1)
    setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)])
    setPhase('correct')
  }

  function openChest() {
    const amount = rollChestReward()
    onReceiveGold(amount)
    if (settings.soundOn) playChest()
    setEarned((total) => total + amount)
    setReward({ amount, key: Date.now() })
    setChestReward(amount)
  }

  function closeChest() {
    setChestReward(null)
    setChestPending(false)
    if (solved >= ROUND_SIZE) setPhase('summary')
    else nextProblem()
  }

  function startNewRound() {
    setSolved(0)
    setEarned(0)
    nextProblem()
  }

  const isComparison = problem.type === 'comparison'

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <header className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-violet-700">Akademie</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSoundChange(!settings.soundOn)}
            aria-label={settings.soundOn ? 'Vypnout zvuk' : 'Zapnout zvuk'}
            aria-pressed={settings.soundOn}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-violet-500 shadow-sm active:scale-95"
          >
            {settings.soundOn ? <SoundOnIcon className="h-6 w-6" /> : <SoundOffIcon className="h-6 w-6" />}
          </button>
          <div className="relative">
            <GoldCounter gold={save.gold} />
            {reward && (
              <span
                key={reward.key}
                className="animate-float-up pointer-events-none absolute -top-2 right-2 text-2xl font-bold text-amber-500"
                aria-hidden="true"
              >
                +{reward.amount}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between text-base font-semibold text-violet-500">
        <span>
          Příklad {Math.min(phase === 'answering' || phase === 'wrong' ? solved + 1 : solved, ROUND_SIZE)} z {ROUND_SIZE}
        </span>
        <span className="flex items-center gap-1" aria-label={`Správně v řadě: ${difficulty.correctStreak} z ${CORRECT_IN_ROW_TO_LEVEL_UP}`}>
          {Array.from({ length: CORRECT_IN_ROW_TO_LEVEL_UP }, (_, i) => (
            <svg key={i} viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
                fill={i < difficulty.correctStreak ? '#facc15' : '#ede9fe'}
                stroke={i < difficulty.correctStreak ? '#ca8a04' : '#c4b5fd'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ))}
          <TreasureChest open={false} className="ml-1 h-7 w-8" />
        </span>
      </div>

      <ProblemCard problem={problem} answer={input} state={phase === 'correct' ? 'correct' : phase === 'wrong' ? 'wrong' : 'answering'} />

      <div className="flex min-h-20 flex-col justify-center rounded-2xl px-3 text-center text-lg" role="status">
        {phase === 'correct' && (
          <p className="font-bold text-emerald-600">
            {praise} +{reward?.amount} {levelUp && <span className="block text-base text-violet-500">Jdeš na těžší příklady!</span>}
          </p>
        )}
        {phase !== 'correct' && hintVisible && (
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
            <p className="font-bold">Skoro! Zkus to znovu.</p>
            <p className="text-base">{problem.hint}</p>
          </div>
        )}
        {phase === 'answering' && !hintVisible && (
          <p className="text-violet-400">{isComparison ? 'Vyber správné znaménko.' : 'Spočítej a klepni na Hotovo.'}</p>
        )}
      </div>

      <div className="mt-auto">
        {isComparison ? (
          <CompareButtons
            disabled={phase === 'correct'}
            onChoose={(sign) => {
              setInput(sign)
              submit(sign)
            }}
          />
        ) : (
          <NumericKeyboard
            value={input}
            onChange={(value) => {
              setInput(value)
              if (phase === 'wrong') setPhase('answering')
            }}
            onSubmit={() => submit(Number(input))}
            disabled={phase === 'correct'}
          />
        )}
      </div>

      {phase === 'chest' && (
        <Dialog
          title={chestReward === null ? 'Bonusová truhla!' : `+${formatGold(chestReward)}`}
          onClose={() => {}}
          actions={
            chestReward === null
              ? [{ label: 'Otevřít', onClick: openChest, primary: true }]
              : [{ label: 'Hurá!', onClick: closeChest, primary: true }]
          }
        >
          <button
            type="button"
            onClick={chestReward === null ? openChest : undefined}
            className="mx-auto block"
            aria-label={chestReward === null ? 'Otevřít truhlu' : 'Otevřená truhla'}
          >
            <TreasureChest open={chestReward !== null} className={`h-32 w-40 ${chestReward === null ? 'animate-wiggle' : ''}`} />
          </button>
          <p>{chestReward === null ? `${CORRECT_IN_ROW_TO_LEVEL_UP} správně v řadě! Co je uvnitř?` : 'Truhla byla plná zlaťáků.'}</p>
        </Dialog>
      )}

      {phase === 'summary' && (
        <Dialog
          title="Kolo hotové!"
          onClose={startNewRound}
          actions={[
            { label: 'Do obchodu', onClick: () => (startNewRound(), onGoToShop()) },
            { label: 'Ještě kolo', onClick: startNewRound, primary: true },
          ]}
        >
          <p>
            Vypočítala jsi {ROUND_SIZE} příkladů a vydělala <strong>{formatGold(earned)}</strong>.
          </p>
          <p className="mt-2 text-base text-violet-500">Můžeš si dát pauzu, nebo počítat dál.</p>
        </Dialog>
      )}
    </div>
  )
}
