import { useCallback, useEffect, useState } from 'react'
import { loadSave, writeSave } from '../lib/storage'
import { toggleEquip } from '../lib/wardrobe'
import type { SaveData } from '../types'

export function useGameState() {
  const [save, setSave] = useState<SaveData>(() => loadSave())

  useEffect(() => {
    writeSave(save)
  }, [save])

  const toggleItem = useCallback((itemId: string) => setSave((current) => toggleEquip(current, itemId)), [])

  return { save, toggleItem }
}
