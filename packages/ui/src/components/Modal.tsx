import { useEffect } from 'react'
import { FocusGroup, useFocusContext } from '@table-js/core'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className = '' }: ModalProps) {
  const { keyHandler } = useFocusContext()

  useEffect(() => {
    if (!open) return

    const unsub = keyHandler.subscribe((action) => {
      if (action.type === 'back') {
        onClose()
      }
    })

    return unsub
  }, [open, onClose, keyHandler])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div
        className={`relative z-10 w-full max-w-2xl rounded-2xl border border-zinc-700 bg-zinc-900 p-8 shadow-2xl ${className} `}
      >
        {title && <h2 className="mb-6 text-3xl font-bold">{title}</h2>}
        <FocusGroup orientation="vertical" loop={false} rememberFocus={false}>
          {children}
        </FocusGroup>
      </div>
    </div>
  )
}
