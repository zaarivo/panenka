import { useState } from 'react'
import { ITEMS } from '../../data/items'
import { formatGold } from '../../lib/czech'
import type { BuyResult } from '../../lib/economy'
import { CATEGORIES, type Item, type SaveData } from '../../types'
import { ItemThumbnail } from '../doll/ItemThumbnail'
import { Coin, GoldCounter } from '../ui/Coin'
import { Dialog } from '../ui/Dialog'
import { CATEGORY_LABELS } from './WardrobeScreen'

const SHOP_ITEMS = ITEMS.filter((item) => item.price !== null && item.price > 0)

type Prompt = { kind: 'confirm' | 'missing' | 'bought'; item: Item } | null

interface ShopScreenProps {
  save: SaveData
  onBuy: (itemId: string) => BuyResult
  onGoToAcademy: () => void
}

export function ShopScreen({ save, onBuy, onGoToAcademy }: ShopScreenProps) {
  const [prompt, setPrompt] = useState<Prompt>(null)
  const close = () => setPrompt(null)

  function choose(item: Item) {
    if (save.owned.includes(item.id)) return
    setPrompt({ kind: save.gold >= item.price! ? 'confirm' : 'missing', item })
  }

  function confirmPurchase(item: Item) {
    const result = onBuy(item.id)
    setPrompt(result.ok ? { kind: 'bought', item } : { kind: 'missing', item })
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 p-3">
        <h1 className="text-2xl font-bold text-violet-700">Obchod</h1>
        <GoldCounter gold={save.gold} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {CATEGORIES.map((category) => (
          <section key={category} className="mb-4">
            <h2 className="mb-2 text-lg font-bold text-violet-500">{CATEGORY_LABELS[category]}</h2>
            <div className="grid grid-cols-3 gap-3">
              {SHOP_ITEMS.filter((item) => item.category === category).map((item) => {
                const owned = save.owned.includes(item.id)
                const affordable = !owned && save.gold >= item.price!
                const cardStyle = owned
                  ? 'bg-white ring-2 ring-emerald-200'
                  : affordable
                    ? 'bg-white ring-2 ring-pink-300 active:scale-95'
                    : 'bg-violet-50 active:scale-95'
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => choose(item)}
                    disabled={owned}
                    aria-label={owned ? `${item.name}, už máš` : `${item.name}, cena ${formatGold(item.price!)}`}
                    className={`flex flex-col items-center gap-1 rounded-2xl p-2 transition-transform ${cardStyle}`}
                  >
                    <ItemThumbnail
                      item={item}
                      className={`aspect-square w-full ${owned || affordable ? '' : 'opacity-60 grayscale'}`}
                    />
                    <span className="text-xs leading-tight text-violet-700">{item.name}</span>
                    {owned ? (
                      <span className="flex min-h-7 items-center text-sm font-bold text-emerald-600">Už máš</span>
                    ) : (
                      <span className="flex min-h-7 items-center gap-1 text-base font-bold text-amber-600">
                        <Coin className="h-5 w-5" />
                        {item.price}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {prompt?.kind === 'confirm' && (
        <Dialog
          title={prompt.item.name}
          onClose={close}
          actions={[
            { label: 'Ne', onClick: close },
            { label: 'Koupit', onClick: () => confirmPurchase(prompt.item), primary: true },
          ]}
        >
          <ItemThumbnail item={prompt.item} className="mx-auto h-32 w-32" />
          <p>
            Koupit za <strong>{formatGold(prompt.item.price!)}</strong>?
          </p>
        </Dialog>
      )}

      {prompt?.kind === 'missing' && (
        <Dialog
          title="Zlaťáky zatím nestačí"
          onClose={close}
          actions={[
            { label: 'Zavřít', onClick: close },
            { label: 'Jít počítat', onClick: () => (close(), onGoToAcademy()), primary: true },
          ]}
        >
          <ItemThumbnail item={prompt.item} className="mx-auto h-24 w-24 opacity-60 grayscale" />
          <p>
            Na tenhle kousek potřebuješ ještě <strong>{formatGold(prompt.item.price! - save.gold)}</strong>. Vydělej si
            je v Akademii!
          </p>
        </Dialog>
      )}

      {prompt?.kind === 'bought' && (
        <Dialog title="Hurá!" onClose={close} actions={[{ label: 'Super', onClick: close, primary: true }]}>
          <ItemThumbnail item={prompt.item} className="mx-auto h-32 w-32" />
          <p>
            <strong>{prompt.item.name}</strong> — najdeš v šatníku.
          </p>
        </Dialog>
      )}
    </div>
  )
}
