import type { RouteDefinition, RouteParams, RouteSegment } from './types'

export function parseSegments(path: string): RouteSegment[] {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith('[...') && segment.endsWith(']')) {
        return { type: 'catch-all', value: segment.slice(4, -1) }
      }
      if (segment.startsWith('[') && segment.endsWith(']')) {
        return { type: 'dynamic', value: segment.slice(1, -1) }
      }
      return { type: 'static', value: segment }
    })
}

export function matchRoute(
  pathname: string,
  routes: RouteDefinition[],
): { route: RouteDefinition; params: RouteParams } | null {
    const incomingSegments = pathname.split("/").filter(Boolean)

    for (const route of routes) {
        const result = matchSegments(incomingSegments, route.segments)
        if (result !== null) {
            return { route, params: result }
        }
    }

    return null
}

function matchSegments(incoming: string[], segments: RouteSegment[]): RouteParams | null {
  const params: RouteParams = {}
  let i = 0

  for (const segment of segments) {
    if (segment.type === 'catch-all') {
      params[segment.value] = incoming.slice(i).join('/')
      return params
    }

    const part = incoming[i]
    if (part === undefined) return null

    if (segment.type === 'static') {
      if (part !== segment.value) return null
    }

    if (segment.type === 'dynamic') {
      params[segment.value] = part
    }

    i++
  }

  if (i !== incoming.length) return null

  return params
}
