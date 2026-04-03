import { useParams, useRouter } from '@table-js/core'
import { Button } from '@table-js/ui'

interface MovieParams {
  id: string
}

export default function MoviePage() {
  const { id } = useParams<MovieParams>()
  const { back } = useRouter()

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-text-primary) p-16">
      <Button className="mb-8" variant="secondary" onSelect={back} autoFocus>
        ← Back
      </Button>
      <h1 className="text-5xl font-bold">Movie #{id}</h1>
    </div>
  )
}
