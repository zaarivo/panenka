import { useState } from 'react'
import { DollViewer } from './components/doll/DollViewer'
import { loadSave } from './lib/storage'

export default function App() {
  const [save] = useState(loadSave)
  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-4">
      <DollViewer equipped={save.equipped} className="h-[70vh] max-h-[600px] w-auto drop-shadow-sm" />
      <p className="text-lg text-pink-500">Šatník, obchod a akademie přibudou v dalších krocích.</p>
    </main>
  )
}
