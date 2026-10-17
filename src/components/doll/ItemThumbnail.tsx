import { BASE_ASSETS, thumbnailViewBox } from '../../graphics'
import type { Item } from '../../types'
import { LayerAsset } from './LayerAsset'

/** Kousek oblečení na těle panenky, oříznutý na místo, kde se nosí. */
export function ItemThumbnail({ item, className }: { item: Item; className?: string }) {
  return (
    <svg viewBox={thumbnailViewBox(item)} className={className} aria-hidden="true">
      <g opacity="0.55">
        <LayerAsset asset={BASE_ASSETS.body} />
      </g>
      <LayerAsset asset={item.asset} />
    </svg>
  )
}
