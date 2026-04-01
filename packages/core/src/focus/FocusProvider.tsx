import React, { useEffect, useMemo, useRef } from 'react'
import { FocusContext } from './context'
import { FocusManager } from './FocusManager'
import { KeyHandler } from './KeyHandler'
import type { FocusManagerOptions } from './types'

interface FocusProviderProps {
  children: React.ReactNode
  options?: FocusManagerOptions
}

export function FocusProvider({ children, options }: FocusProviderProps) {
  const managerRef = useRef<FocusManager | null>(null)
  const keyHandlerRef = useRef<KeyHandler | null>(null)

  if (!managerRef.current) {
    managerRef.current = new FocusManager(options ?? {})
  }
  if (!keyHandlerRef.current) {
    keyHandlerRef.current = new KeyHandler()
  }

  const manager = managerRef.current
  const keyHandler = keyHandlerRef.current

  useEffect(() => {
    keyHandler.mount()

    const unsub = keyHandler.subscribe((action) => {
      if (action.type === 'move') {
        manager.move(action.direction)
      }
      if (action.type === 'select') {
        manager.select()
      }
    })

    return () => {
      unsub()
      keyHandler.unmount()
    }
  }, [manager, keyHandler])

  const value = useMemo(
    () => ({ manager, keyHandler }),
    [manager, keyHandler],
  )

  return (
    <FocusContext.Provider value={value}>
      {children}
    </FocusContext.Provider>
  )
}