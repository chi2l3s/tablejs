import type { FocusDirection } from './types'

export type KeyAction =
  | { type: 'move'; direction: FocusDirection }
  | { type: 'select' }
  | { type: 'back' }
  | { type: 'unknown' }

const KEY_MAP: Record<string, KeyAction> = {
  ArrowUp:    { type: 'move', direction: 'up' },
  ArrowDown:  { type: 'move', direction: 'down' },
  ArrowLeft:  { type: 'move', direction: 'left' },
  ArrowRight: { type: 'move', direction: 'right' },
  Enter:      { type: 'select' },
  ' ':        { type: 'select' },
  Backspace:  { type: 'back' },
  Escape:     { type: 'back' },
}

const TIZEN_KEY_MAP: Record<number, KeyAction> = {
  38: { type: 'move', direction: 'up' },
  40: { type: 'move', direction: 'down' },
  37: { type: 'move', direction: 'left' },
  39: { type: 'move', direction: 'right' },
  13: { type: 'select' },
  10009: { type: 'back' },
}

const WEBOS_KEY_MAP: Record<number, KeyAction> = {
  38: { type: 'move', direction: 'up' },
  40: { type: 'move', direction: 'down' },
  37: { type: 'move', direction: 'left' },
  39: { type: 'move', direction: 'right' },
  13: { type: 'select' },
  461: { type: 'back' },
}

const ANDROID_TV_KEY_MAP: Record<number, KeyAction> = {
  38: { type: 'move', direction: 'up' },
  40: { type: 'move', direction: 'down' },
  37: { type: 'move', direction: 'left' },
  39: { type: 'move', direction: 'right' },
  13: { type: 'select' },
  85: { type: 'select' },
  4:  { type: 'back' },
}

function detectPlatform(): 'tizen' | 'webos' | 'android' | 'web' {
  if (typeof window === 'undefined') return 'web'
  const ua = navigator.userAgent
  if (ua.includes('Tizen')) return 'tizen'
  if (ua.includes('Web0S') || ua.includes('webOS')) return 'webos'
  if (ua.includes('Android')) return 'android'
  return 'web'
}

export function resolveKeyAction(event: KeyboardEvent): KeyAction {
  const byKey = KEY_MAP[event.key]
  if (byKey) return byKey

  const platform = detectPlatform()

  const platformMap =
    platform === 'tizen' ? TIZEN_KEY_MAP :
    platform === 'webos' ? WEBOS_KEY_MAP :
    platform === 'android' ? ANDROID_TV_KEY_MAP :
    {}

  return platformMap[event.keyCode] ?? { type: 'unknown' }
}

export class KeyHandler {
  private listeners = new Set<(action: KeyAction) => void>()
  private bound: ((e: KeyboardEvent) => void) | null = null

  mount(): void {
    this.bound = (e: KeyboardEvent) => {
      const action = resolveKeyAction(e)
      if (action.type === 'unknown') return
      e.preventDefault()
      this.listeners.forEach((fn) => fn(action))
    }
    window.addEventListener('keydown', this.bound)
  }

  unmount(): void {
    if (this.bound) {
      window.removeEventListener('keydown', this.bound)
      this.bound = null
    }
  }

  subscribe(fn: (action: KeyAction) => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
}