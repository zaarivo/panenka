import { BADGES, itemsUnlockedBy } from '../../lib/badges'
import { plural } from '../../lib/czech'
import { MEDALS, nextMedal } from '../../lib/medals'
import { TOPIC_LABELS } from '../../lib/topics'
import { TOPIC_IDS, type MedalTier, type SaveData, type TopicId } from '../../types'
import { ItemThumbnail } from '../doll/ItemThumbnail'
import { BadgeMedal } from '../fame/BadgeMedal'
import { MedalIcon } from '../fame/MedalIcon'
import { GearIcon } from '../ui/icons'

const TOWARDS: Record<MedalTier, string> = { bronze: 'do bronzové', silver: 'do stříbrné', gold: 'do zlaté' }

function ProgressBar({ current, target, label }: { current: number; target: number; label: string }) {
  return (
    <div className="flex items-center gap-2" aria-label={`${label}: splněno ${current} z ${target}`}>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-violet-100">
        <div className="h-full rounded-full bg-pink-300" style={{ width: `${(current / target) * 100}%` }} />
      </div>
      <span className="text-sm font-semibold text-violet-500">
        {current}/{target}
      </span>
    </div>
  )
}

function TopicMedals({ save, topic }: { save: SaveData; topic: TopicId }) {
  const next = nextMedal(save, topic)
  return (
    <article className="flex flex-col gap-2 rounded-3xl bg-white p-3 shadow-sm">
      <h2 className="text-lg font-bold text-violet-700">{TOPIC_LABELS[topic]}</h2>
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 gap-1">
          {MEDALS.filter((medal) => medal.topic === topic).map((medal) => (
            <MedalIcon key={medal.id} tier={medal.tier} earned={save.medals.includes(medal.id)} className="h-14 w-11" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          {next ? (
            <>
              <p className="text-sm text-violet-500">{TOWARDS[next.medal.tier]}</p>
              <ProgressBar
                current={Math.min(next.count, next.medal.target)}
                target={next.medal.target}
                label={TOWARDS[next.medal.tier]}
              />
            </>
          ) : (
            <p className="text-base font-bold text-emerald-600">Všechny medaile!</p>
          )}
        </div>
      </div>
    </article>
  )
}

export function MedalsScreen({ save, onOpenParent }: { save: SaveData; onOpenParent: () => void }) {
  const solved = save.stats.totalCorrect
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-violet-700">Medaile</h1>
          <p className="text-base text-violet-500">
            Zatím jsi správně vyřešila {solved} {plural(solved, 'příklad', 'příklady', 'příkladů')}.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenParent}
          aria-label="Nastavení pro rodiče"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-violet-300 active:bg-violet-100"
        >
          <GearIcon className="h-6 w-6" />
        </button>
      </header>

      {TOPIC_IDS.map((topic) => (
        <TopicMedals key={topic} save={save} topic={topic} />
      ))}

      <h2 className="mt-2 text-xl font-bold text-violet-500">Odznaky</h2>
      {BADGES.map((badge) => {
        const earned = save.badges.includes(badge.id)
        const current = Math.min(badge.progress(save), badge.target)
        const rewards = itemsUnlockedBy(badge.id)
        return (
          <article
            key={badge.id}
            className={`flex gap-3 rounded-3xl p-3 ${earned ? 'bg-white shadow-sm ring-2 ring-amber-200' : 'bg-violet-50'}`}
          >
            <BadgeMedal id={badge.id} earned={earned} className="h-20 w-18 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className={`text-lg font-bold ${earned ? 'text-violet-700' : 'text-violet-400'}`}>{badge.name}</h2>
              <p className="text-sm text-violet-600">{badge.description}</p>
              {earned ? (
                <p className="text-sm font-bold text-emerald-600">Získáno!</p>
              ) : (
                <ProgressBar current={current} target={badge.target} label={badge.name} />
              )}
              {rewards.map((item) => (
                <div key={item.id} className="mt-1 flex items-center gap-2 rounded-2xl bg-amber-50 p-1 pr-3">
                  <ItemThumbnail item={item} className={`h-12 w-12 ${earned ? '' : 'opacity-60 grayscale'}`} />
                  <span className="text-sm text-amber-800">
                    {earned ? (
                      <>
                        <strong>{item.name}</strong> je v šatníku!
                      </>
                    ) : (
                      <>
                        Odměna: <strong>{item.name}</strong>
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </article>
        )
      })}
    </div>
  )
}
