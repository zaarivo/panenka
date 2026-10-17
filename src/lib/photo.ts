import { CANVAS } from '../graphics'
import { downloadBlob } from './download'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** SVG vykreslené jako obrázek nesmí odkazovat na jiné soubory, proto PNG vrstvy vložíme přímo. */
async function inlineImages(svg: SVGSVGElement): Promise<void> {
  const images = [...svg.querySelectorAll('image')]
  await Promise.all(
    images.map(async (image) => {
      const href = image.getAttribute('href')
      if (!href || href.startsWith('data:')) return
      const response = await fetch(href)
      image.setAttribute('href', await blobToDataUrl(await response.blob()))
    }),
  )
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Obrázek panenky se nepodařilo načíst'))
    image.src = url
  })
}

export async function renderDollPng(source: SVGSVGElement, scale = 2): Promise<Blob> {
  const width = CANVAS.width * scale
  const height = CANVAS.height * scale
  const svg = source.cloneNode(true) as SVGSVGElement
  svg.setAttribute('width', String(width))
  svg.setAttribute('height', String(height))
  svg.removeAttribute('class')
  await inlineImages(svg)

  const svgUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }),
  )
  try {
    const image = await loadImage(svgUrl)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(image, 0, 0, width, height)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Fotku se nepodařilo vytvořit'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}

export type ShareOutcome = 'shared' | 'downloaded' | 'cancelled'

export async function shareOrDownload(blob: Blob, filename: string): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Moje panenka' })
      return 'shared'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // sdílení selhalo jinak (např. nepovolené) — zkusíme stažení
    }
  }
  downloadBlob(blob, filename)
  return 'downloaded'
}
