import { ITEMS_BY_ID } from '../data/items'
import type { Category, EquipSlot, Item, SaveData } from '../types'

/** Kategorie, které nejde sundat úplně — jen vyměnit (bez vlasů by panenka byla holohlavá). */
export const ALWAYS_WORN: readonly Category[] = ['hair']

/** Kam se kousek nasazuje: u doplňků místo na těle, jinak kategorie. */
export function equipSlot(item: Pick<Item, 'category' | 'slot'>): EquipSlot {
  if (item.category !== 'accessory') return item.category
  return `accessory:${item.slot ?? 'head'}`
}

export function toggleEquip(save: SaveData, itemId: string): SaveData {
  const item = ITEMS_BY_ID.get(itemId)
  if (!item || !save.owned.includes(itemId)) return save

  const slot = equipSlot(item)
  if (save.equipped[slot] === itemId) {
    if (ALWAYS_WORN.includes(item.category)) return save
    const equipped = { ...save.equipped }
    delete equipped[slot]
    return { ...save, equipped }
  }
  return { ...save, equipped: { ...save.equipped, [slot]: itemId } }
}
