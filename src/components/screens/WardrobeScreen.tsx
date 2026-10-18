import { useRef, useState } from 'react'
import { ITEMS } from '../../data/items'
import { renderDollPng, shareOrDownload } from '../../lib/photo'
import { equipSlot } from '../../lib/wardrobe'
import { CATEGORIES, type Category, type SaveData } from '../../types'
import { DollViewer } from '../doll/DollViewer'
import { ItemThumbnail } from '../doll/ItemThumbnail'
import { CameraIcon } from '../ui/icons'

export const CATEGORY_LABELS: Record<Category, string> = {
  hair: 'Vlasy',
  dress: 'Šaty',
  shoes: 'Boty',
  accessory: 'Doplňky',
}

interface WardrobeScreenProps {
  save: SaveData
  onToggleItem: (itemId: string) => void
}

export function WardrobeScreen({ save, onToggleItem }: WardrobeScreenProps) {
  const [category, setCategory] = useState<Category>('dress')
  const [photoState, setPhotoState] = useState<'idle' | 'working' | 'failed'>('idle')
  const dollRef = useRef<SVGSVGElement>(null)

  const ownedInCategory = ITEMS.filter((item) => item.category === category && save.owned.includes(item.id))

  async function takePhoto() {
    if (!dollRef.current || photoState === 'working') return
    setPhotoState('working')
    try {
      const png = await renderDollPng(dollRef.current)
      await shareOrDownload(png, 'moje-panenka.png')
      setPhotoState('idle')
    } catch {
      setPhotoState('failed')
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="relative flex min-h-0 flex-1 justify-center">
        <DollViewer ref={dollRef} equipped={save.equipped} className="h-full max-w-full rounded-3xl shadow-sm" />
        <button
          type="button"
          onClick={takePhoto}
          disabled={photoState === 'working'}
          className="absolute right-0 bottom-0 flex min-h-14 items-center gap-2 rounded-full bg-white px-4 text-base font-bold text-violet-600 shadow-md active:scale-95 disabled:opacity-60"
        >
          <CameraIcon className="h-6 w-6" />
          {photoState === 'working' ? 'Fotím…' : 'Vyfotit'}
        </button>
        {photoState === 'failed' && (
          <p role="status" className="absolute top-2 right-0 left-0 mx-auto w-fit rounded-full bg-white px-4 py-1 text-sm text-rose-500 shadow">
            Fotka se nepovedla, zkus to znovu.
          </p>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2" role="tablist" aria-label="Druh oblečení">
        {CATEGORIES.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={id === category}
            onClick={() => setCategory(id)}
            className={`min-h-14 rounded-2xl text-base font-bold transition-colors ${
              id === category ? 'bg-violet-200 text-violet-700' : 'bg-white text-violet-400 active:bg-violet-50'
            }`}
          >
            {CATEGORY_LABELS[id]}
          </button>
        ))}
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto p-1 [scrollbar-width:none]">
        {ownedInCategory.map((item) => {
          const worn = save.equipped[equipSlot(item)] === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={worn}
              aria-label={item.name}
              onClick={() => onToggleItem(item.id)}
              className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-1 transition-transform active:scale-95 ${
                worn ? 'ring-4 ring-pink-400' : 'ring-1 ring-violet-100'
              }`}
            >
              <ItemThumbnail item={item} className="h-full w-full" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
