import { ITEMS_BY_ID } from '../data/items'
import type { Category, SaveData } from '../types'

/** Kategorie, které nejde sundat úplně — jen vyměnit (bez vlasů by panenka byla holohlavá). */
export const ALWAYS_WORN: readonly Category[] = ['hair']

export function toggleEquip(save: SaveData, itemId: string): SaveData {
  const item = ITEMS_BY_ID.get(itemId)
  if (!item || !save.owned.includes(itemId)) return save

  const { category } = item
  if (save.equipped[category] === itemId) {
    if (ALWAYS_WORN.includes(category)) return save
    const equipped = { ...save.equipped }
    delete equipped[category]
    return { ...save, equipped }
  }
  return { ...save, equipped: { ...save.equipped, [category]: itemId } }
}
