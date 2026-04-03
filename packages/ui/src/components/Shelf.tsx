import { FocusGroup } from '@table-js/core'

interface ShelfProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Shelf({ title, children, className = '' }: ShelfProps) {
  return (
    <section className={className}>
      {title && <h2 className="mb-4 px-16 text-2xl font-bold">{title}</h2>}
      <div className="overflow-x-auto overflow-y-hidden px-16 pb-4">
        <FocusGroup
          orientation="horizontal"
          loop={false}
          rememberFocus={false}
          className="min-w-full w-max gap-6"
        >
          {children}
        </FocusGroup>
      </div>
    </section>
  )
}
