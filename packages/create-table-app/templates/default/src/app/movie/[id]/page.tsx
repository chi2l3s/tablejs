import { Focusable, useParams, useRouter } from '@table-js/core'

interface MovieParams {
  id: string
}

export default function MoviePage() {
  const { id } = useParams<MovieParams>()
  const { back } = useRouter()

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-text-primary) p-16">
      <Focusable onSelect={back} autoFocus>
        {(focused) => (
          <button
            className={`
              px-6 py-3 rounded-(--radius-button) bg-(--color-surface) mb-8
              transition-colors duration-150
              ${focused ? 'bg-(--color-surface-hover) outline-3 outline-(--color-accent)' : ''}
            `}
          >
            ← Back
          </button>
        )}
      </Focusable>
      <h1 className="text-5xl font-bold">Movie #{id}</h1>
    </div>
  )
}
