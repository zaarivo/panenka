import { useCallback, useEffect, useState } from 'react'
import { buyItem, type BuyResult } from '../lib/economy'
import { loadSave, writeSave } from '../lib/storage'
import { toggleEquip } from '../lib/wardrobe'
import type { SaveData } from '../types'

export function useGameState() {
  const [save, setSave] = useState<SaveData>(() => loadSave())

  useEffect(() => {
    writeSave(save)
  }, [save])

  const toggleItem = useCallback((itemId: string) => setSave((current) => toggleEquip(current, itemId)), [])

  const buy = useCallback(
    (itemId: string): BuyResult => {
      const result = buyItem(save, itemId)
      if (result.ok) setSave(result.save)
      return result
    },
    [save],
  )

  return { save, toggleItem, buy }
}
