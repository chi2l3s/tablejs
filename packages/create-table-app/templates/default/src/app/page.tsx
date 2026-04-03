import { useRouter } from '@table-js/core'
import { Card, Shelf } from '@table-js/ui'

const rows = [
  {
    title: 'Trending',
    items: [
      { id: '1', title: 'Inception' },
      { id: '2', title: 'Interstellar' },
      { id: '3', title: 'The Dark Knight' },
      { id: '4', title: 'Tenet' },
      { id: '5', title: 'Dune' },
      { id: '6', title: 'Arrival' },
    ],
  },
  {
    title: 'Continue Watching',
    items: [
      { id: '7', title: 'Severance' },
      { id: '8', title: 'Silo' },
      { id: '9', title: 'Foundation' },
      { id: '10', title: 'Dark' },
      { id: '11', title: 'Andor' },
      { id: '12', title: 'Shogun' },
    ],
  },
  {
    title: 'Recommended',
    items: [
      { id: '13', title: 'The Matrix' },
      { id: '14', title: 'Blade Runner 2049' },
      { id: '15', title: 'The Creator' },
      { id: '16', title: 'Mad Max: Fury Road' },
      { id: '17', title: 'Edge of Tomorrow' },
      { id: '18', title: 'Ex Machina' },
    ],
  },
]

export default function HomePage() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-(--color-background) py-16 text-(--color-text-primary)">
      <header className="mb-12 px-16">
        <h1 className="mb-3 text-4xl font-bold">My TV App</h1>
        <p className="max-w-3xl text-lg text-(--color-text-secondary)">
          Auto-routed pages, TV focus navigation, and shelves that follow the active item.
        </p>
      </header>

      <div className="space-y-10 pb-16">
        {rows.map((row, rowIndex) => (
          <Shelf key={row.title} title={row.title}>
            {row.items.map((item, itemIndex) => (
              <Card
                key={item.id}
                title={item.title}
                subtitle="Open details"
                className="h-72 w-48 shrink-0"
                autoFocus={rowIndex === 0 && itemIndex === 0}
                onSelect={() => navigate(`/movie/${item.id}`)}
              />
            ))}
          </Shelf>
        ))}
      </div>
    </div>
  )
}
