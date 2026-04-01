import React from 'react'

export interface RouteParams {
    [key: string]: string
}

export interface RouteQuery {
    [key: string]: string | string[] | undefined
}

export interface Route {
    path: string
    params: RouteParams
    query: RouteQuery
}

export interface RouteSegment {
    type: 'static' | 'dynamic' | 'catch-all'
    value: string
}

export interface RouteDefinition {
    filePath: string
    segments: RouteSegment[]
    component: React.LazyExoticComponent<React.ComponentType>
}

export interface RouterState {
  current: Route
  history: Route[]
}

export type NavigateOptions = {
  replace?: boolean
  query?: RouteQuery
}