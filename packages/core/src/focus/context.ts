import { createContext, useContext } from 'react'
import type { FocusManager } from './FocusManager'
import type { KeyHandler } from './KeyHandler'

export interface FocusContextValue {
  manager: FocusManager
  keyHandler: KeyHandler
}

export const FocusContext = createContext<FocusContextValue | null>(null)

export function useFocusContext(): FocusContextValue {
  const ctx = useContext(FocusContext)
  if (ctx === null) {
    throw new Error('useFocusContext must be used within a TableApp')
  }
  return ctx
}