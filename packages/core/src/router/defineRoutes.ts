import React from 'react'
import { parseSegments } from './matcher'
import type { RouteDefinition, RouteSegment } from './types'

export type RouteModule = {
  default: React.ComponentType
}

export type RouteModuleLoader = () => Promise<RouteModule>

type RouteInput = {
  path: string
  component: RouteModuleLoader
}

export function defineRoutes(routes: RouteInput[]): RouteDefinition[] {
  return routes.map((route) => createRouteDefinition(route.path, route.component, route.path))
}

export function defineFileRoutes(
  routeModules: Record<string, RouteModuleLoader>,
  options: { appDir?: string } = {},
): RouteDefinition[] {
  const appDir = options.appDir ?? 'app'

  return Object.entries(routeModules)
    .map(([filePath, component]) =>
      createRouteDefinition(normalizeRoutePath(filePath, appDir), component, filePath),
    )
    .sort(compareRouteDefinitions)
}

function createRouteDefinition(
  path: string,
  component: RouteModuleLoader,
  filePath: string,
): RouteDefinition {
  return {
    filePath,
    segments: parseSegments(path),
    component: React.lazy(component),
  }
}

function normalizeRoutePath(filePath: string, appDir: string): string {
  const normalizedPath = filePath.replace(/\\/g, '/').replace(/^\.\//, '')
  const appDirPrefix = `${appDir}/`
  const appDirIndex = normalizedPath.indexOf(appDirPrefix)

  if (appDirIndex === -1) {
    throw new Error(`Route module "${filePath}" must be inside "${appDir}/"`)
  }

  const pagePath = normalizedPath.slice(appDirIndex + appDirPrefix.length)
  const routePath = pagePath.replace(/(?:^|\/)page\.[^/.]+$/, '')

  return routePath.length === 0 ? '/' : `/${routePath}`
}

function compareRouteDefinitions(left: RouteDefinition, right: RouteDefinition): number {
  const segmentsOrder = compareSegments(left.segments, right.segments)
  if (segmentsOrder !== 0) {
    return segmentsOrder
  }

  return left.filePath.localeCompare(right.filePath)
}

function compareSegments(left: RouteSegment[], right: RouteSegment[]): number {
  const length = Math.max(left.length, right.length)

  for (let index = 0; index < length; index++) {
    const leftSegment = left[index]
    const rightSegment = right[index]

    if (leftSegment === undefined) return -1
    if (rightSegment === undefined) return 1

    const rankDifference = segmentRank(rightSegment) - segmentRank(leftSegment)
    if (rankDifference !== 0) {
      return rankDifference
    }

    if (leftSegment.type === 'static' && rightSegment.type === 'static') {
      const valueDifference = leftSegment.value.localeCompare(rightSegment.value)
      if (valueDifference !== 0) {
        return valueDifference
      }
    }
  }

  return 0
}

function segmentRank(segment: RouteSegment): number {
  switch (segment.type) {
    case 'static':
      return 3
    case 'dynamic':
      return 2
    case 'catch-all':
      return 1
  }
}
