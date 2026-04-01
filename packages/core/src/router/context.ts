import { createContext, useContext } from 'react'
import type { NavigateOptions, Route } from './types'

export interface RouterContextValue {
  route: Route
  navigate: (path: string, options?: NavigateOptions) => void
  back: () => void
  prefetch: (path: string) => void
}

export const RouterContext = createContext<RouterContextValue | null>(null)

export function useRouter(): RouterContextValue {
  const ctx = useContext(RouterContext)
  if (ctx === null) {
    throw new Error('useRouter must be used within a TableApp')
  }
  return ctx
}

export function useParams<T extends Record<string, string>>(): T {
  const { route } = useRouter()
  return route.params as T
}

export function useQuery<T extends Record<string, string | string[] | undefined>>(): T {
  const { route } = useRouter()
  return route.query as T
}
