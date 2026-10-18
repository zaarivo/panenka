import type { Recommendation } from '../../lib/practice'
import { recommendations } from '../../lib/practice'
import { TIER_LABELS, TOPIC_LABELS } from '../../lib/topics'
import type { SaveData, Tier, TopicId } from '../../types'
import { TopicEditor } from '../practice/TopicEditor'

interface PracticePickerProps {
  save: SaveData
  onToggle: (topic: TopicId, tier: Tier) => void
  onAccept: (recommendation: Recommendation) => void
  onSnooze: (recommendation: Recommendation) => void
  onNext: () => void
}

/** Krok 1 ze 2 po zadání PINu: co se bude procvičovat, nahoře doporučení podle úspěšnosti. */
export function PracticePicker({ save, onToggle, onAccept, onSnooze, onNext }: PracticePickerProps) {
  const advice = recommendations(save.settings.topics, save.practice)

  return (
    <div className="mx-auto flex h-full max-w-md flex-col gap-3 overflow-y-auto p-4">
      <p className="text-center text-sm font-semibold text-violet-400">Krok 1 ze 2</p>
      <h1 className="text-center text-2xl font-bold text-pink-500">Co dnes procvičíme?</h1>

      {advice.map((recommendation) => (
        <div key={`${recommendation.topic}:${recommendation.tier}`} className="rounded-2xl bg-amber-50 p-3 text-amber-900" role="status">
          <p className="text-base font-bold">
            {TOPIC_LABELS[recommendation.topic]} – {TIER_LABELS[recommendation.tier]}: {Math.round(recommendation.rate * 100)} % správně
          </p>
          <p className="text-base">
            {recommendation.action === 'add' ? 'Přidat' : 'Odebrat'} obtížnost „{TIER_LABELS[recommendation.targetTier]}“?
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onAccept(recommendation)}
              className="min-h-12 rounded-xl bg-pink-400 text-base font-bold text-white active:scale-95"
            >
              {recommendation.action === 'add' ? 'Přidat' : 'Odebrat'}
            </button>
            <button
              type="button"
              onClick={() => onSnooze(recommendation)}
              className="min-h-12 rounded-xl bg-white text-base font-bold text-amber-800 active:scale-95"
            >
              Teď ne
            </button>
          </div>
        </div>
      ))}

      <TopicEditor topics={save.settings.topics} onToggle={onToggle} />

      <button
        type="button"
        onClick={onNext}
        className="min-h-14 shrink-0 rounded-2xl bg-pink-400 text-xl font-bold text-white shadow-sm active:scale-95"
      >
        Dál
      </button>
    </div>
  )
}
