import { useEffect, useId, useRef, type ReactNode } from 'react'

export interface DialogAction {
  label: string
  onClick: () => void
  primary?: boolean
}

interface DialogProps {
  title: string
  children?: ReactNode
  actions: DialogAction[]
  onClose: () => void
}

export function Dialog({ title, children, actions, onClose }: DialogProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>('button[data-primary="true"]')?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/30 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="animate-pop w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-xl"
      >
        <h2 id={titleId} className="text-2xl font-bold text-violet-700">
          {title}
        </h2>
        {children && <div className="mt-3 text-lg">{children}</div>}
        <div className="mt-5 flex gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              data-primary={action.primary ? 'true' : undefined}
              onClick={action.onClick}
              className={`min-h-14 flex-1 rounded-2xl text-lg font-bold active:scale-95 ${
                action.primary ? 'bg-pink-400 text-white' : 'bg-violet-100 text-violet-600'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
