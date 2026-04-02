import { Focusable, FocusGroup, useRouter } from '@table/core'

const movies = [
  { id: '1', title: 'Inception' },
  { id: '2', title: 'Interstellar' },
  { id: '3', title: 'The Dark Knight' },
]

export default function HomePage() {
  const { navigate } = useRouter()

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-text-primary) p-16">
      <h1 className="text-4xl font-bold mb-12">My TV App</h1>
      <FocusGroup orientation="horizontal" loop>
        {movies.map((movie) => (
          <Focusable
            key={movie.id}
            onSelect={() => navigate(`/movie/${movie.id}`)}
          >
            {(focused) => (
              <div
                className={`
                  w-48 h-72 rounded-(--radius-card) bg-(--color-surface)
                  flex items-end p-4 mr-6 transition-transform duration-150
                  ${focused ? 'scale-105 outline-3 outline-(--color-accent)' : ''}
                `}
              >
                <span className="font-semibold">{movie.title}</span>
              </div>
            )}
          </Focusable>
        ))}
      </FocusGroup>
    </div>
  )
}