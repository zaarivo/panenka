import { CANVAS, resolveAsset } from '../../graphics'

export function LayerAsset({ asset }: { asset: string }) {
  const resolved = resolveAsset(asset)
  if (!resolved) return null
  if (resolved.kind === 'image') {
    return <image href={resolved.href} x="0" y="0" width={CANVAS.width} height={CANVAS.height} />
  }
  const { Component } = resolved
  return <Component />
}
