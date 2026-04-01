import React, { useCallback, useEffect, useState, useTransition } from 'react'
import type { NavigateOptions, Route, RouteDefinition, RouteQuery } from './types'
import { matchRoute } from './matcher'
import { RouterContext } from './context'

interface RouterProps {
  routes: RouteDefinition[]
  initialPath?: string
}

function parseQuery(search: string): RouteQuery {
  const query: RouteQuery = {}
  const params = new URLSearchParams(search)
  params.forEach((value, key) => {
    const existing = query[key]
    if (existing === undefined) {
      query[key] = value
    } else if (Array.isArray(existing)) {
      existing.push(value)
    } else {
      query[key] = [existing, value]
    }
  })
  return query
}

function buildRoute(pathname: string, search: string, params: Record<string, string>): Route {
  return {
    path: pathname,
    params,
    query: parseQuery(search),
  }
}

export function Router({ routes, initialPath = '/' }: RouterProps) {
  const [, startTransition] = useTransition()
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') return window.location.pathname
    return initialPath
  })
  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') return window.location.search
    return ''
  })
  const [history, setHistory] = useState<Route[]>([])

  const match = matchRoute(currentPath, routes)
  const route = match
    ? buildRoute(currentPath, search, match.params)
    : buildRoute(currentPath, search, {})

  const navigate = useCallback(
    (path: string, options: NavigateOptions = {}) => {
      const [pathname, queryString] = path.split('?')
      const nextSearch = queryString ? `?${queryString}` : ''

      startTransition(() => {
        if (options.replace) {
          window.history.replaceState(null, '', path)
        } else {
          window.history.pushState(null, '', path)
          setHistory((prev) => [...prev, route])
        }
        setCurrentPath(pathname ?? '/')
        setSearch(nextSearch)
      })
    },
    [route],
  )

  const back = useCallback(() => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    window.history.back()
    setCurrentPath(prev.path)
    setSearch('')
  }, [history])

  const prefetch = useCallback(
    (path: string) => {
      const [pathname] = path.split('?')
      if (!pathname) return
      const result = matchRoute(pathname, routes)
      if (result) {
        void result.route.component
      }
    },
    [routes],
  )

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname)
      setSearch(window.location.search)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  if (!match) {
    return <NotFound path={currentPath} />
  }

  const { component: Page } = match.route

  return (
    <RouterContext.Provider value={{ route, navigate, back, prefetch }}>
        <React.Suspense fallback={<PageLoader />}>
            <Page />
        </React.Suspense>
    </RouterContext.Provider>
  )
}

function NotFound({ path }: { path: string }) {
  return (
    <div data-table-not-found>
      <span>404 — {path} not found</span>
    </div>
  )
}

function PageLoader() {
  return <div data-table-loader />
}
