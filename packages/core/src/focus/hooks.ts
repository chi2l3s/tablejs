import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import { useFocusContext } from './context'
import type { FocusGroup } from './types'

export interface UseFocusableOptions {
  groupId?: string
  disabled?: boolean
  onFocus?: () => void
  onBlur?: () => void
  onSelect?: () => void
  autoFocus?: boolean
}

export interface UseFocusableResult {
  ref: React.RefObject<HTMLElement>
  focused: boolean
  focusableProps: {
    'data-focusable': string
    'data-focused': boolean
    tabIndex: number
  }
}

export function useFocusable(options: UseFocusableOptions = {}): UseFocusableResult {
  const id = useId()
  const ref = useRef<HTMLElement>(null)
  const [focused, setFocused] = useState(false)
  const { manager } = useFocusContext()

  const { groupId, disabled = false, onFocus, onBlur, onSelect, autoFocus } = options

  useEffect(() => {
    const el = ref.current
    if (!el) return

    manager.registerNode({
      id,
      el,
      groupId: groupId ?? null,
      disabled,
      onFocus: () => {
        setFocused(true)
        onFocus?.()
      },
      onBlur: () => {
        setFocused(false)
        onBlur?.()
      },
      onSelect: onSelect || (() => {}),
    })

    if (autoFocus) {
      manager.setFocus(id)
    }

    return () => {
      manager.unregisterNode(id)
    }
  }, [id, groupId, disabled, autoFocus, manager, onFocus, onBlur, onSelect])

  const focusableProps = {
    'data-focusable': id,
    'data-focused': focused,
    tabIndex: focused ? 0 : -1,
  }

  return { ref: ref as React.RefObject<HTMLElement>, focused, focusableProps }
}

export type UseFocusGroupOptions = Omit<FocusGroup, 'id' | 'lastFocusedId' | 'parentId'>

export function useFocusGroup(options: UseFocusGroupOptions) {
  const id = useId()
  const { manager } = useFocusContext()

  useEffect(() => {
    manager.registerGroup({
      id,
      parentId: null,
      lastFocusedId: null,
      ...options,
    })
    return () => {
      manager.unregisterGroup(id)
    }
  }, [id, manager, options.orientation, options.loop, options.rememberFocus])

  return { groupId: id }
}