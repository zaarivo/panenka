import type { Ref } from 'react'
import { ITEMS_BY_ID } from '../../data/items'
import { BASE_ASSETS, CANVAS_VIEWBOX } from '../../graphics'
import { LAYER_ORDER, type Category, type Item } from '../../types'
import { LayerAsset } from './LayerAsset'

interface DollViewerProps {
  equipped: Partial<Record<Category, string>>
  showBackground?: boolean
  viewBox?: string
  className?: string
  label?: string
  ref?: Ref<SVGSVGElement>
}

export function DollViewer({
  equipped,
  showBackground = true,
  viewBox = CANVAS_VIEWBOX,
  className,
  label = 'Panenka',
  ref,
}: DollViewerProps) {
  const worn = Object.values(equipped)
    .map((id) => (id ? ITEMS_BY_ID.get(id) : undefined))
    .filter((item): item is Item => item !== undefined)

  return (
    <svg ref={ref} viewBox={viewBox} className={className} role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
      {LAYER_ORDER.map((layer) => {
        if (layer === 'background') {
          return showBackground ? (
            <g key={layer} data-layer={layer}>
              <LayerAsset asset={BASE_ASSETS.background} />
            </g>
          ) : null
        }
        if (layer === 'body') {
          return (
            <g key={layer} data-layer={layer}>
              <LayerAsset asset={BASE_ASSETS.body} />
            </g>
          )
        }
        return (
          <g key={layer} data-layer={layer}>
            {worn
              .filter((item) => item.layer === layer)
              .map((item) => (
                <LayerAsset key={item.id} asset={item.asset} />
              ))}
          </g>
        )
      })}
    </svg>
  )
}
