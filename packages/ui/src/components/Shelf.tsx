import { useRef, useEffect, useState } from 'react'
import { FocusGroup, useFocusContext } from '@table-js/core'

interface ShelfProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function Shelf({ title, children, className = '' }: ShelfProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const { manager } = useFocusContext()

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const update = () => {
      const focused = container.querySelector('[data-focused="true"]')
      if (!focused) return

      const rect = focused.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const itemWidth = rect.width + 24

      if (rect.left < containerRect.left) {
        setOffset((prev) => prev + itemWidth)
      } else if (rect.right > containerRect.right) {
        setOffset((prev) => prev - itemWidth)
      }
    }

    const id = manager.getFocusedId()
    if (id) update()

    const interval = setInterval(update, 100)
    return () => clearInterval(interval)
  }, [manager])

  return (
    <div className={className}>
      {title && <h2 className="mb-4 px-16 text-2xl font-bold">{title}</h2>}
      <div className="overflow-hidden px-16" ref={ref}>
        <FocusGroup orientation="horizontal" loop={false} rememberFocus={false}>
          <div
            className="flex gap-6 transition-transform duration-300"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {children}
          </div>
        </FocusGroup>
      </div>
    </div>
  )
}
