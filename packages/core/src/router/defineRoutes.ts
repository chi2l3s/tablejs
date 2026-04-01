import React from 'react'
import { parseSegments } from './matcher'
import type { RouteDefinition } from './types'

type RouteInput = {
  path: string
  component: () => Promise<{ default: React.ComponentType }>
}

export function defineRoutes(routes: RouteInput[]): RouteDefinition[] {
  return routes.map((r) => ({
    filePath: r.path,
    segments: parseSegments(r.path),
    component: React.lazy(r.component),
  }))
}