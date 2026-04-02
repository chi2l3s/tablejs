import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TableApp, defineRoutes } from '@table/core'
import './styles/globals.css'

const routes = defineRoutes([
  {
    path: '/',
    component: () => import('./app/page'),
  },
  {
    path: '/movie/[id]',
    component: () => import('./app/movie/[id]/page'),
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TableApp routes={routes} />
  </StrictMode>,
)
