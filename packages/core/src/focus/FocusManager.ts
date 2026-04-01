import type {
  FocusableId,
  FocusableNode,
  FocusDirection,
  FocusGroup,
  FocusManagerOptions,
  FocusState,
} from './types'

export class FocusManager {
  private state: FocusState = {
    focusedId: null,
    nodes: new Map(),
    groups: new Map(),
  }

  private options: FocusManagerOptions

  constructor(options: FocusManagerOptions = {}) {
    this.options = options
  }

  registerNode(node: FocusableNode): void {
    this.state.nodes.set(node.id, node)
    if (
      this.state.focusedId === null &&
      this.options.initialFocusId === node.id
    ) {
      this.setFocus(node.id)
    }
  }

  unregisterNode(id: FocusableId): void {
    this.state.nodes.delete(id)
    if (this.state.focusedId === id) {
      this.state.focusedId = null
      this.options.onFocusChange?.(null)
    }
  }

  registerGroup(group: FocusGroup): void {
    this.state.groups.set(group.id, group)
  }

  unregisterGroup(id: FocusableId): void {
    this.state.groups.delete(id)
  }

  setFocus(id: FocusableId): void {
    const node = this.state.nodes.get(id)
    if (!node || node.disabled) return

    const prev = this.state.focusedId
    if (prev) {
      const prevNode = this.state.nodes.get(prev)
      prevNode?.onBlur?.()
      prevNode?.el.blur()

      if (prevNode?.groupId) {
        const group = this.state.groups.get(prevNode.groupId)
        if (group) group.lastFocusedId = prev
      }
    }

    this.state.focusedId = id
    node.el.focus({ preventScroll: true })
    node.onFocus?.()
    this.options.onFocusChange?.(id)
  }

  move(direction: FocusDirection): void {
    const currentId = this.state.focusedId
    if (!currentId) {
      this.focusFirst()
      return
    }

    const current = this.state.nodes.get(currentId)
    if (!current) return

    const groupId = current.groupId
    const group = groupId ? this.state.groups.get(groupId) : null

    const next = group
      ? this.findNextInGroup(currentId, direction, group)
      : this.findNextSpatial(currentId, direction)

    if (next) this.setFocus(next)
  }

  select(): void {
    const node = this.state.focusedId
      ? this.state.nodes.get(this.state.focusedId)
      : null
    node?.onSelect?.()
    node?.el.click()
  }

  focusFirst(): void {
    const first = this.state.nodes.values().next().value as FocusableNode | undefined
    if (first) this.setFocus(first.id)
  }

  getFocusedId(): FocusableId | null {
    return this.state.focusedId
  }

  private findNextInGroup(
    currentId: FocusableId,
    direction: FocusDirection,
    group: FocusGroup,
  ): FocusableId | null {
    const siblings = [...this.state.nodes.values()].filter(
      (n) => n.groupId === group.id && !n.disabled,
    )
    const index = siblings.findIndex((n) => n.id === currentId)
    if (index === -1) return null

    const isForward =
      (group.orientation === 'horizontal' && direction === 'right') ||
      (group.orientation === 'vertical' && direction === 'down')

    const isBackward =
      (group.orientation === 'horizontal' && direction === 'left') ||
      (group.orientation === 'vertical' && direction === 'up')

    if (isForward) {
      if (index < siblings.length - 1) return siblings[index + 1]?.id ?? null
      if (group.loop) return siblings[0]?.id ?? null
      return null
    }

    if (isBackward) {
      if (index > 0) return siblings[index - 1]?.id ?? null
      if (group.loop) return siblings[siblings.length - 1]?.id ?? null
      return null
    }

    return this.findNextSpatial(currentId, direction)
  }

  private findNextSpatial(currentId: FocusableId, direction: FocusDirection): FocusableId | null {
    const current = this.state.nodes.get(currentId)
    if (!current) return null

    const currentRect = current.el.getBoundingClientRect()
    const candidates = [...this.state.nodes.values()].filter(
      (n) => n.id !== currentId && !n.disabled,
    )

    const inDirection = candidates.filter((n) => {
      const rect = n.el.getBoundingClientRect()
      if (direction === 'right') return rect.left > currentRect.right - 1
      if (direction === 'left') return rect.right < currentRect.left + 1
      if (direction === 'down') return rect.top > currentRect.bottom - 1
      if (direction === 'up') return rect.bottom < currentRect.top + 1
      return false
    })

    if (inDirection.length === 0) return null

    return inDirection.reduce((best, node) => {
      const a = node.el.getBoundingClientRect()
      const b = best.el.getBoundingClientRect()
      const distA = distance(currentRect, a, direction)
      const distB = distance(currentRect, b, direction)
      return distA < distB ? node : best
    }).id
  }
}


function distance(
  from: DOMRect,
  to: DOMRect,
  direction: FocusDirection,
): number {
  const fromCx = from.left + from.width / 2
  const fromCy = from.top + from.height / 2
  const toCx = to.left + to.width / 2
  const toCy = to.top + to.height / 2

  const primary =
    direction === 'right' || direction === 'left'
      ? Math.abs(toCx - fromCx)
      : Math.abs(toCy - fromCy)

  const secondary =
    direction === 'right' || direction === 'left'
      ? Math.abs(toCy - fromCy)
      : Math.abs(toCx - fromCx)

  return primary + secondary * 0.5
}