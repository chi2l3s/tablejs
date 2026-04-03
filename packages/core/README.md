# @tablejs/core

Core runtime for Table.js - the Smart TV application framework.

## Features

- **File-based Router** - Next.js-style app router with dynamic routes
- **Focus Engine** - Spatial navigation for TV remotes
- **Platform Support** - Works on Tizen, webOS, and Android TV

## Installation

```bash
npm install @tablejs/core react react-dom
```

## Quick Start

```tsx
import { TableApp, defineRoutes } from '@tablejs/core'

const routes = defineRoutes([
  { path: '/', component: () => import('./app/page') },
  { path: '/movie/[id]', component: () => import('./app/movie/[id]/page') },
])

function App() {
  return <TableApp routes={routes} />
}
```

## Documentation

Visit [tablejs.dev](https://tablejs.dev) for full documentation.

## License

MIT
