import { useEffect } from 'react'
import { itemsUnlockedBy, type Badge } from '../../lib/badges'
import { playChest } from '../../lib/sound'
import { ItemThumbnail } from '../doll/ItemThumbnail'
import { Dialog } from '../ui/Dialog'
import { BadgeMedal } from './BadgeMedal'

interface BadgeCelebrationProps {
  badge: Badge
  soundOn: boolean
  onClose: () => void
  onShowWardrobe: () => void
}

export function BadgeCelebration({ badge, soundOn, onClose, onShowWardrobe }: BadgeCelebrationProps) {
  const rewards = itemsUnlockedBy(badge.id)

  useEffect(() => {
    if (soundOn) playChest()
  }, [badge.id, soundOn])

  return (
    <Dialog
      title="Nový odznak!"
      onClose={onClose}
      actions={
        rewards.length > 0
          ? [
              { label: 'Později', onClick: onClose },
              { label: 'Do šatníku', onClick: () => (onClose(), onShowWardrobe()), primary: true },
            ]
          : [{ label: 'Hurá!', onClick: onClose, primary: true }]
      }
    >
      <BadgeMedal id={badge.id} earned className="animate-pop mx-auto h-28 w-24" />
      <p className="mt-2 text-xl font-bold text-violet-700">{badge.name}</p>
      <p className="text-base text-violet-500">{badge.description}</p>
      {rewards.map((item) => (
        <div key={item.id} className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 p-2">
          <ItemThumbnail item={item} className="h-14 w-14" />
          <span className="text-base text-amber-800">
            Odemkla jsi: <strong>{item.name}</strong>
          </span>
        </div>
      ))}
    </Dialog>
  )
}
