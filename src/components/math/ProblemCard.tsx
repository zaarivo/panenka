import { formatTimeDigits } from '../../lib/clock'
import type { Problem } from '../../lib/mathGenerator'
import { ClockFace } from './ClockFace'

interface ProblemCardProps {
  problem: Problem
  answer: string
  state: 'answering' | 'wrong' | 'correct' | 'revealed'
}

const SLOT_STYLES: Record<ProblemCardProps['state'], string> = {
  answering: 'border-pink-300 bg-pink-50 text-pink-600',
  wrong: 'border-amber-300 bg-amber-50 text-amber-600',
  correct: 'border-emerald-400 bg-emerald-50 text-emerald-600',
  revealed: 'border-violet-300 bg-violet-50 text-violet-600',
}

export function ProblemCard({ problem, answer, state }: ProblemCardProps) {
  const slotStyle = SLOT_STYLES[state]
  const shown = problem.kind === 'time' ? formatTimeDigits(answer) : answer
  const storyAlign = problem.topic === 'clock' ? 'text-center' : 'text-left'

  return (
    <div
      className="flex min-h-28 shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-3xl bg-white px-3 py-4 text-5xl font-bold text-violet-800 shadow-sm"
      aria-live="polite"
    >
      {problem.story && (
        <p className={`w-full ${storyAlign} text-lg leading-snug font-semibold text-violet-800`} data-story>
          {problem.story}
        </p>
      )}
      {problem.tags && (
        <div className="flex w-full flex-wrap gap-2">
          {problem.tags.map((tag) => (
            <span key={tag} className="rounded-xl bg-amber-100 px-2 py-0.5 text-base font-semibold text-amber-800">
              {tag}
            </span>
          ))}
        </div>
      )}
      {problem.clock && (
        <div className="flex w-full justify-center">
          <ClockFace hours={problem.clock.hours} minutes={problem.clock.minutes} className="h-40 w-40" />
        </div>
      )}
      {problem.prompt.split(' ').map((token, index) =>
        token === '?' ? (
          <span
            key={index}
            className={`inline-flex h-16 min-w-16 items-center justify-center rounded-2xl border-4 border-dashed px-2 ${slotStyle}`}
            aria-label={answer ? `tvoje odpověď ${shown}` : 'sem patří odpověď'}
          >
            {shown}
          </span>
        ) : (
          <span key={index}>{token}</span>
        ),
      )}
      {problem.unit && <span>{problem.unit}</span>}
    </div>
  )
}
