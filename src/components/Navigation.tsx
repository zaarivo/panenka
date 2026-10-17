import type { ComponentType, SVGProps } from 'react'
import { AcademyIcon, HangerIcon, ShopIcon, TrophyIcon } from './ui/icons'

export type Tab = 'wardrobe' | 'shop' | 'academy' | 'fame'

const TABS: { id: Tab; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { id: 'wardrobe', label: 'Šatník', Icon: HangerIcon },
  { id: 'shop', label: 'Obchod', Icon: ShopIcon },
  { id: 'academy', label: 'Akademie', Icon: AcademyIcon },
  { id: 'fame', label: 'Síň slávy', Icon: TrophyIcon },
]

export function Navigation({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return (
    <nav className="grid grid-cols-4 gap-1 border-t border-pink-100 bg-white/90 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {TABS.map(({ id, label, Icon }) => {
        const selected = id === active
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={selected ? 'page' : undefined}
            className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-semibold transition-colors ${
              selected ? 'bg-pink-100 text-pink-600' : 'text-violet-400 active:bg-violet-50'
            }`}
          >
            <Icon className="h-7 w-7" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
