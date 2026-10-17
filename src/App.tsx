import { useState } from 'react'
import { Navigation, type Tab } from './components/Navigation'
import { WardrobeScreen } from './components/screens/WardrobeScreen'
import { useGameState } from './hooks/useGameState'

const COMING_SOON: Record<Exclude<Tab, 'wardrobe'>, string> = {
  shop: 'Obchod se brzy otevře.',
  academy: 'Akademie se brzy otevře.',
  fame: 'Síň slávy se brzy otevře.',
}

export default function App() {
  const { save, toggleItem } = useGameState()
  const [tab, setTab] = useState<Tab>('wardrobe')

  return (
    <div className="mx-auto flex h-full max-w-md flex-col">
      <main className="min-h-0 flex-1">
        {tab === 'wardrobe' ? (
          <WardrobeScreen save={save} onToggleItem={toggleItem} />
        ) : (
          <p className="flex h-full items-center justify-center p-6 text-center text-xl text-violet-400">{COMING_SOON[tab]}</p>
        )}
      </main>
      <Navigation active={tab} onChange={setTab} />
    </div>
  )
}
