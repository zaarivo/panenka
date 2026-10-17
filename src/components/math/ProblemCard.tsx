import type { Problem } from '../../lib/mathGenerator'

interface ProblemCardProps {
  problem: Problem
  answer: string
  state: 'answering' | 'wrong' | 'correct'
}

export function ProblemCard({ problem, answer, state }: ProblemCardProps) {
  const slotStyle =
    state === 'correct'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
      : state === 'wrong'
        ? 'border-amber-300 bg-amber-50 text-amber-600'
        : 'border-pink-300 bg-pink-50 text-pink-600'

  return (
    <div
      className="flex min-h-28 flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-3xl bg-white px-3 py-4 text-5xl font-bold text-violet-800 shadow-sm"
      aria-live="polite"
    >
      {problem.prompt.split(' ').map((token, index) =>
        token === '?' ? (
          <span
            key={index}
            className={`inline-flex h-16 min-w-16 items-center justify-center rounded-2xl border-4 border-dashed px-2 ${slotStyle}`}
            aria-label={answer ? `tvoje odpověď ${answer}` : 'sem patří odpověď'}
          >
            {answer}
          </span>
        ) : (
          <span key={index}>{token}</span>
        ),
      )}
    </div>
  )
}
