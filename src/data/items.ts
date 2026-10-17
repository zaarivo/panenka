import type { Item } from '../types'
import rawItems from './items.json'

export const ITEMS: readonly Item[] = rawItems as Item[]

export const ITEMS_BY_ID: ReadonlyMap<string, Item> = new Map(ITEMS.map((item) => [item.id, item]))

export const STARTER_ITEMS: readonly Item[] = ITEMS.filter((item) => item.price === 0)
