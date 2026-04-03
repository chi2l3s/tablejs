# @tablejs/ui

UI components for Table.js Smart TV applications.

## Installation

```bash
npm install @tablejs/ui @tablejs/core
```

## Components

- **Button** - Focusable button with variants
- **Card** - Content card with image and text
- **Shelf** - Netflix-style horizontal scrolling shelf
- **Modal** - Overlay modal with focus trap

## Usage

```tsx
import { Button, Card, Shelf } from '@tablejs/ui'

function HomePage() {
  return (
    <Shelf title="Popular Movies">
      <Card title="Inception" image="/inception.jpg" />
      <Card title="Interstellar" image="/interstellar.jpg" />
    </Shelf>
  )
}
```

## License

MIT
