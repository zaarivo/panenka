import { useEffect, useRef, useState } from 'react'
import { ROUND_SIZE } from '../../lib/academy'
import { formatGold } from '../../lib/czech'
import {
  CORRECT_IN_ROW_FOR_CHEST,
  clampTier,
  skipTopicProgress,
  updateChestStreak,
  updateTopicProgress,
  type TopicProgress,
} from '../../lib/difficulty'
import { rollChestReward } from '../../lib/economy'
import { generateProblem, isCorrectAnswer, pickTopic, type CompareSign, type Problem } from '../../lib/mathGenerator'
import { isSuccess } from '../../lib/practice'
import { playChest, playCoin } from '../../lib/sound'
import { ActiveStopwatch } from '../../lib/stopwatch'
import { enabledTopics } from '../../lib/topics'
import { TOPIC_IDS, type SaveData, type Tier, type TopicId, type TopicSettings } from '../../types'
import { CompareButtons } from '../math/CompareButtons'
import { NumericKeyboard } from '../math/NumericKeyboard'
import { ProblemCard } from '../math/ProblemCard'
import { TreasureChest } from '../math/TreasureChest'
import { GoldCounter } from '../ui/Coin'
import { Dialog } from '../ui/Dialog'
import { SoundOffIcon, SoundOnIcon } from '../ui/icons'

const PRAISE = ['Správně!', 'Výborně!', 'Super!', 'Paráda!', 'Skvělé!']
const NEXT_PROBLEM_DELAY_MS = 1200

type Phase = 'answering' | 'wrong' | 'correct' | 'skipped' | 'chest' | 'summary' | 'paused'

/** Fáze, kdy je příklad rozdělaný (včetně pochvaly a truhly) — časový zámek počká. */
const BUSY_PHASES: readonly Phase[] = ['answering', 'wrong', 'correct', 'skipped', 'chest']

type ProgressByTopic = Record<TopicId, TopicProgress>

function initialProgress(save: SaveData): ProgressByTopic {
  return Object.fromEntries(
    TOPIC_IDS.map((topic) => [
      topic,
      { tier: clampTier(save.currentTier[topic], save.settings.topics[topic]), correctStreak: 0, mistakeStreak: 0 },
    ]),
  ) as ProgressByTopic
}

function createProblem(topics: TopicSettings, progress: ProgressByTopic, previousKey?: string): Problem {
  const topic = pickTopic(enabledTopics(topics))
  return generateProblem({ topic, tier: progress[topic].tier, previousKey })
}

interface AcademyScreenProps {
  save: SaveData
  /** `success` = správně napoprvé a v časovém limitu (jen pro statistiku rodiče). */
  onCorrect: (problem: Problem, nextTier: Tier, success: boolean) => number
  onWrong: (problem: Problem, nextTier: Tier) => void
  onSkip: (problem: Problem, nextTier: Tier) => void
  onReceiveGold: (amount: number) => void
  onSoundChange: (soundOn: boolean) => void
  onGoToShop: () => void
  /** Čas vypršel: dokončit rozdělaný příklad, další už nedávat. */
  lockRequested: boolean
  onBusyChange: (busy: boolean) => void
  /** Otevřená záložka Akademie — jen tehdy se měří čas řešení. */
  active: boolean
}

export function AcademyScreen({
  save,
  onCorrect,
  onWrong,
  onSkip,
  onReceiveGold,
  onSoundChange,
  onGoToShop,
  lockRequested,
  onBusyChange,
  active,
}: AcademyScreenProps) {
  const { settings } = save
  const [initial] = useState(() => {
    const progress = initialProgress(save)
    return { progress, problem: createProblem(settings.topics, progress) }
  })
  const [progress, setProgress] = useState<ProgressByTopic>(initial.progress)
  const [problem, setProblem] = useState<Problem>(initial.problem)
  const [chestStreak, setChestStreak] = useState(0)
  const [mistakeMade, setMistakeMade] = useState(false)
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
  const [easier, setEasier] = useState(false)

  const stopwatchRef = useRef<ActiveStopwatch | null>(null)
  stopwatchRef.current ??= new ActiveStopwatch()
  const stopwatch = stopwatchRef.current

  const busy = BUSY_PHASES.includes(phase)
  useEffect(() => {
    onBusyChange(busy)
  }, [busy, onBusyChange])

  // Čas řešení běží jen při otevřené Akademii, viditelné hře a rozdělaném příkladu.
  const timing = active && (phase === 'answering' || phase === 'wrong')
  useEffect(() => {
    const update = () => stopwatch.setRunning(timing && document.visibilityState === 'visible')
    update()
    document.addEventListener('visibilitychange', update)
    return () => {
      document.removeEventListener('visibilitychange', update)
      stopwatch.setRunning(false)
    }
  }, [timing, stopwatch])

  const allowed = (topic: TopicId) => settings.topics[topic]

  function nextProblem() {
    if (lockRequested) {
      setPhase('paused')
      return
    }
    setProblem((previous) => createProblem(settings.topics, progress, previous.key))
    stopwatch.reset()
    setMistakeMade(false)
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
    const { topic } = problem
    const correct = isCorrectAnswer(problem, given)
    const update = updateTopicProgress(progress[topic], correct, allowed(topic))
    setProgress((current) => ({ ...current, [topic]: update.progress }))
    const chest = updateChestStreak(chestStreak, correct)
    setChestStreak(chest.streak)

    if (!correct) {
      onWrong(problem, update.progress.tier)
      setMistakeMade(true)
      setInput('')
      setHintVisible(true)
      setPhase('wrong')
      return
    }

    const success = isSuccess(topic, !mistakeMade, stopwatch.elapsedMs())
    const amount = onCorrect(problem, update.progress.tier, success)
    if (settings.soundOn) playCoin()
    setEarned((total) => total + amount)
    setReward({ amount, key: Date.now() })
    setSolved((count) => count + 1)
    setChestPending(chest.chest)
    setLevelUp(update.tierChange === 1)
    setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)])
    setPhase('correct')
  }

  function skip() {
    if (phase !== 'answering' && phase !== 'wrong') return
    const { topic } = problem
    const update = skipTopicProgress(progress[topic], allowed(topic))
    setProgress((current) => ({ ...current, [topic]: update.progress }))
    setChestStreak(0)
    onSkip(problem, update.progress.tier)
    setEasier(update.tierChange === -1)
    setInput(String(problem.answer))
    setHintVisible(false)
    setPhase('skipped')
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

  const isComparison = problem.kind === 'compare'

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
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
          Příklad {Math.min(phase === 'correct' || phase === 'chest' || phase === 'summary' ? solved : solved + 1, ROUND_SIZE)} z{' '}
          {ROUND_SIZE}
        </span>
        <span className="flex items-center gap-1" aria-label={`Správně v řadě: ${chestStreak} z ${CORRECT_IN_ROW_FOR_CHEST}`}>
          {Array.from({ length: CORRECT_IN_ROW_FOR_CHEST }, (_, i) => (
            <svg key={i} viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
                fill={i < chestStreak ? '#facc15' : '#ede9fe'}
                stroke={i < chestStreak ? '#ca8a04' : '#c4b5fd'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          ))}
          <TreasureChest open={false} className="ml-1 h-7 w-8" />
        </span>
      </div>

      <ProblemCard
        problem={problem}
        answer={input}
        state={phase === 'correct' ? 'correct' : phase === 'wrong' ? 'wrong' : phase === 'skipped' ? 'revealed' : 'answering'}
      />

      <div className="flex min-h-14 shrink-0 flex-col justify-center rounded-2xl px-3 text-center text-lg" role="status">
        {phase === 'correct' && (
          <p className="font-bold text-emerald-600">
            {praise} +{reward?.amount} {levelUp && <span className="block text-base text-violet-500">Jdeš na těžší příklady!</span>}
          </p>
        )}
        {phase === 'skipped' && (
          <p className="font-bold text-violet-600">
            Nevadí! Správně je {problem.answer}.
            {easier && <span className="block text-base font-normal text-violet-500">Další příklad bude o kousek lehčí.</span>}
          </p>
        )}
        {(phase === 'answering' || phase === 'wrong') && hintVisible && (
          <div className="rounded-2xl bg-amber-50 p-3 text-amber-800">
            <p className="font-bold">Skoro! Zkus to znovu.</p>
            <p className="text-base">{problem.hint}</p>
          </div>
        )}
        {phase === 'answering' && !hintVisible && (
          <p className="text-violet-400">{isComparison ? 'Vyber správné znaménko.' : 'Spočítej a klepni na Hotovo.'}</p>
        )}
      </div>

      {phase === 'skipped' ? (
        <button
          type="button"
          onClick={nextProblem}
          className="min-h-14 rounded-2xl bg-pink-400 text-lg font-bold text-white shadow-sm active:scale-95"
        >
          Další příklad
        </button>
      ) : (
        <button
          type="button"
          onClick={skip}
          disabled={phase !== 'answering' && phase !== 'wrong'}
          className="min-h-14 rounded-2xl bg-white/70 text-base font-semibold text-violet-500 active:scale-95 disabled:opacity-40"
        >
          Je to moc těžké, přeskočit
        </button>
      )}

      <div className="mt-auto">
        {isComparison ? (
          <CompareButtons
            disabled={phase === 'correct' || phase === 'skipped'}
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
            disabled={phase === 'correct' || phase === 'skipped'}
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
          <p>{chestReward === null ? `${CORRECT_IN_ROW_FOR_CHEST} správně v řadě! Co je uvnitř?` : 'Truhla byla plná zlaťáků.'}</p>
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
