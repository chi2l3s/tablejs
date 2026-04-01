export type FocusDirection = 'up' | 'down' | 'left' | 'right'

export type FocusableId = string

export interface FocusableNode {
  id: FocusableId
  el: HTMLElement
  groupId: FocusableId | null
  disabled: boolean
  onFocus?: () => void
  onBlur?: () => void
  onSelect?: () => void
}

export interface FocusGroup {
  id: FocusableId
  parentId: FocusableId | null
  orientation: 'horizontal' | 'vertical' | 'grid'
  loop: boolean
  rememberFocus: boolean
  lastFocusedId: FocusableId | null
}

export interface FocusState {
  focusedId: FocusableId | null
  nodes: Map<FocusableId, FocusableNode>
  groups: Map<FocusableId, FocusGroup>
}

export interface FocusManagerOptions {
  initialFocusId?: FocusableId
  onFocusChange?: (id: FocusableId | null) => void
}
