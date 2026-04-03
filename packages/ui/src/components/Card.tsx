import { forwardRef } from 'react'
import { Focusable } from '@table-js/core'
import type { UseFocusableOptions } from '@table-js/core'

interface CardProps extends UseFocusableOptions {
  title?: string
  subtitle?: string
  image?: string
  children?: React.ReactNode
  className?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ title, subtitle, image, children, className = '', ...focus }, ref) => {
    return (
      <Focusable {...focus}>
        {(focused) => (
          <div
            ref={ref as never}
            className={`overflow-hidden rounded-xl bg-zinc-800 transition-transform duration-150 ${focused ? 'scale-105 ring-4 ring-white' : ''} ${className} `}
          >
            {image && (
              <div className="aspect-video w-full overflow-hidden">
                <img src={image} alt={title} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="p-4">
              {title && <h3 className="mb-1 text-lg font-bold">{title}</h3>}
              {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
              {children}
            </div>
          </div>
        )}
      </Focusable>
    )
  },
)

Card.displayName = 'Card'
