import type { ComponentType } from 'react'
import { defineFileRoutes } from '@table-js/core'

export const routes = defineFileRoutes(
  import.meta.glob<{ default: ComponentType }>('./app/**/page.{js,jsx,ts,tsx}'),
)
