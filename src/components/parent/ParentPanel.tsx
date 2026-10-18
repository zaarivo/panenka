import { useRef, useState, type ReactNode } from 'react'
import { BADGES } from '../../lib/badges'
import { formatGold, plural } from '../../lib/czech'
import { downloadBlob } from '../../lib/download'
import { MAX_IMPORT_BYTES, exportFileName, exportProgress, importProgress } from '../../lib/parent'
import { successRate } from '../../lib/practice'
import { practiceKey, toggleTier } from '../../lib/topics'
import { TIERS, TOPIC_IDS, type PracticeKey, type SaveData, type TopicSettings } from '../../types'
import { TopicEditor } from '../practice/TopicEditor'
import { Dialog } from '../ui/Dialog'

interface ParentPanelProps {
  save: SaveData
  onChangeTopics: (topics: TopicSettings) => void
  onSoundChange: (soundOn: boolean) => void
  onReplaceSave: (save: SaveData) => void
  onReset: () => void
  onClose: () => void
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-bold text-violet-700">{title}</h2>
      {children}
    </section>
  )
}

function CheckRow({
  checked,
  disabled,
  onChange,
  children,
}: {
  checked: boolean
  disabled?: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    <label className={`flex min-h-14 items-center gap-3 rounded-2xl px-2 ${disabled ? 'opacity-60' : 'active:bg-violet-50'}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="h-6 w-6 shrink-0 accent-pink-500" />
      <span className="text-base text-violet-800">{children}</span>
    </label>
  )
}

type Pending = { kind: 'import'; save: SaveData } | { kind: 'reset' } | null

export function ParentPanel({ save, onChangeTopics, onSoundChange, onReplaceSave, onReset, onClose }: ParentPanelProps) {
  const { settings } = save
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Pending>(null)
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null)

  const rates: Partial<Record<PracticeKey, number | null>> = Object.fromEntries(
    TOPIC_IDS.flatMap((topic) => TIERS.map((tier) => [practiceKey(topic, tier), successRate(save.practice[practiceKey(topic, tier)])])),
  )

  function exportSave() {
    downloadBlob(new Blob([exportProgress(save)], { type: 'application/json' }), exportFileName())
    setMessage({ text: 'Záloha se stáhla.', tone: 'ok' })
  }

  async function chooseImportFile(file: File | undefined) {
    if (fileInput.current) fileInput.current.value = ''
    if (!file) return
    if (file.size > MAX_IMPORT_BYTES) {
      setMessage({ text: 'Soubor je příliš velký, nejde o zálohu hry.', tone: 'error' })
      return
    }
    const imported = importProgress(save, await file.text())
    if (!imported) {
      setMessage({ text: 'Soubor není platná záloha hry Panenka.', tone: 'error' })
      return
    }
    setMessage(null)
    setPending({ kind: 'import', save: imported })
  }

  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-pink-50">
      <div className="mx-auto flex max-w-md flex-col gap-3 p-3 pb-8">
        <header className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-violet-700">Pro rodiče</h1>
          <button type="button" onClick={onClose} className="min-h-12 rounded-full bg-pink-400 px-5 text-lg font-bold text-white">
            Hotovo
          </button>
        </header>

        <Section title="Přehled">
          <ul className="space-y-1 text-base text-violet-800">
            <li>Správně vyřešené příklady: <strong>{save.stats.totalCorrect}</strong></li>
            <li>Zlaťáky: <strong>{formatGold(save.gold)}</strong></li>
            <li>
              Odznaky: <strong>{save.badges.length} z {BADGES.length}</strong>
            </li>
          </ul>
        </Section>

        <Section title="Co procvičovat">
          <p className="mb-2 text-sm text-violet-500">
            Hra se v každé kategorii posouvá sama mezi zaškrtnutými obtížnostmi: po 5 správných v řadě výš, po 2 chybách
            níž. U zaškrtnutých obtížností je úspěšnost z posledních 20 příkladů (správně napoprvé a v časovém limitu).
          </p>
          <TopicEditor
            topics={settings.topics}
            rates={rates}
            onToggle={(topic, tier) => onChangeTopics(toggleTier(settings.topics, topic, tier))}
          />
        </Section>

        <Section title="Zvuk">
          <CheckRow checked={settings.soundOn} onChange={() => onSoundChange(!settings.soundOn)}>
            Zvuky zapnuté
          </CheckRow>
        </Section>

        <Section title="Záloha postupu">
          <div className="flex flex-col gap-2">
            <button type="button" onClick={exportSave} className="min-h-14 rounded-2xl bg-violet-100 text-lg font-bold text-violet-700">
              Stáhnout zálohu (JSON)
            </button>
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="min-h-14 rounded-2xl bg-violet-100 text-lg font-bold text-violet-700"
            >
              Nahrát zálohu ze souboru
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(event) => void chooseImportFile(event.target.files?.[0])}
            />
            {message && (
              <p role="status" className={`text-base font-semibold ${message.tone === 'ok' ? 'text-emerald-600' : 'text-rose-500'}`}>
                {message.text}
              </p>
            )}
          </div>
        </Section>

        <Section title="Začít znovu">
          <p className="mb-2 text-sm text-violet-600">
            Smaže zlaťáky, oblečení, odznaky a statistiky. PIN a nastavení zůstanou.
          </p>
          <button
            type="button"
            onClick={() => setPending({ kind: 'reset' })}
            className="min-h-14 w-full rounded-2xl bg-rose-100 text-lg font-bold text-rose-600"
          >
            Smazat postup
          </button>
        </Section>
      </div>

      {pending?.kind === 'import' && (
        <Dialog
          title="Nahradit postup?"
          onClose={() => setPending(null)}
          actions={[
            { label: 'Zrušit', onClick: () => setPending(null) },
            {
              label: 'Nahradit',
              primary: true,
              onClick: () => {
                onReplaceSave(pending.save)
                setPending(null)
                setMessage({ text: 'Záloha se nahrála.', tone: 'ok' })
              },
            },
          ]}
        >
          <p className="text-base">
            Záloha obsahuje {formatGold(pending.save.gold)}, {pending.save.stats.totalCorrect}{' '}
            {plural(pending.save.stats.totalCorrect, 'správný příklad', 'správné příklady', 'správných příkladů')} a{' '}
            {pending.save.badges.length} {plural(pending.save.badges.length, 'odznak', 'odznaky', 'odznaků')}. Současný postup
            se přepíše.
          </p>
        </Dialog>
      )}

      {pending?.kind === 'reset' && (
        <Dialog
          title="Opravdu smazat postup?"
          onClose={() => setPending(null)}
          actions={[
            { label: 'Ne', onClick: () => setPending(null), primary: true },
            {
              label: 'Smazat',
              onClick: () => {
                onReset()
                setPending(null)
                setMessage(null)
              },
            },
          ]}
        >
          <p className="text-base">Tohle nejde vrátit. Pokud chcete, stáhněte si nejdřív zálohu.</p>
        </Dialog>
      )}
    </div>
  )
}
