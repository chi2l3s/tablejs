import type { RouteDefinition } from './router/types'
import type { FocusManagerOptions } from './focus/types'
import { FocusProvider } from './focus'
import { Router } from './router/Router'

export interface TableAppProps {
  routes: RouteDefinition[]
  initialPath?: string
  focus?: FocusManagerOptions
}

export function TableApp({ routes, initialPath, focus }: TableAppProps) {
  return (
    <FocusProvider {...(focus && { options: focus })}>
      <Router routes={routes} {...(initialPath && { initialPath })} />
    </FocusProvider>
  )
}