import { TIER_LABELS, TOPIC_LABELS, practiceKey } from '../../lib/topics'
import { TIERS, TOPIC_IDS, type PracticeKey, type Tier, type TopicId, type TopicSettings } from '../../types'

interface TopicEditorProps {
  topics: TopicSettings
  onToggle: (topic: TopicId, tier: Tier) => void
  /** Úspěšnost 0–1 nebo null (málo dat) — jen pro rodičovský panel. */
  rates?: Partial<Record<PracticeKey, number | null>>
}

export function TopicEditor({ topics, onToggle, rates }: TopicEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      {TOPIC_IDS.map((topic) => {
        const enabled = topics[topic].length > 0
        return (
          <div key={topic} className="rounded-2xl bg-white p-2">
            <p className={`mb-1.5 px-1 text-base font-bold ${enabled ? 'text-violet-700' : 'text-violet-300'}`}>
              {TOPIC_LABELS[topic]}
              {!enabled && <span className="ml-1 text-sm font-normal">(vypnuto)</span>}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIERS.map((tier) => {
                const on = topics[topic].includes(tier)
                const rate = rates?.[practiceKey(topic, tier)]
                return (
                  <button
                    key={tier}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${TOPIC_LABELS[topic]} – ${TIER_LABELS[tier]}`}
                    onClick={() => onToggle(topic, tier)}
                    className={`flex min-h-12 flex-col items-center justify-center rounded-xl border-2 text-sm font-bold active:scale-95 ${
                      on ? 'border-pink-400 bg-pink-100 text-pink-600' : 'border-violet-100 bg-white text-violet-400'
                    }`}
                  >
                    {TIER_LABELS[tier]}
                    {rates && on && (
                      <span className="text-xs font-normal">{rate === null || rate === undefined ? 'málo dat' : `${Math.round(rate * 100)} %`}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
