import { forwardRef } from 'react'
import { Focusable } from '@table-js/core'
import type { UseFocusableOptions } from '@table-js/core'

interface ButtonProps extends UseFocusableOptions {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className = '', ...focus }, ref) => {
    const base = 'rounded-lg font-semibold transition-all duration-150'

    const variants = {
      primary: 'bg-indigo-600 text-white',
      secondary: 'bg-zinc-700 text-white',
      ghost: 'bg-transparent text-white',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    }

    return (
      <Focusable {...focus}>
        {(focused) => (
          <button
            ref={ref as never}
            className={` ${base} ${variants[variant]} ${sizes[size]} ${focused ? 'scale-105 ring-4 ring-white' : ''} ${className} `}
          >
            {children}
          </button>
        )}
      </Focusable>
    )
  },
)

Button.displayName = 'Button'
