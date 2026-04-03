import React, { forwardRef } from 'react'
import type { JSX } from 'react'
import { useFocusable, useFocusGroup } from './hooks'
import type { UseFocusableOptions, UseFocusGroupOptions } from './hooks'

interface FocusableProps extends UseFocusableOptions {
  children: React.ReactNode | ((focused: boolean) => React.ReactNode)
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
}

export const Focusable = forwardRef<HTMLElement, FocusableProps>(
  ({ children, as: Tag = 'div', className, style, ...options }, _ref) => {
    const { ref, focused, focusableProps } = useFocusable(options)

    return (
      <Tag
        ref={ref as never}
        className={className}
        style={style}
        {...focusableProps}
      >
        {typeof children === 'function' ? children(focused) : children}
      </Tag>
    )
  },
)

Focusable.displayName = 'Focusable'

interface FocusGroupProps extends UseFocusGroupOptions {
  children: React.ReactNode
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
}

export function FocusGroup({
  children,
  as: Tag = 'div',
  className,
  style,
  ...options
}: FocusGroupProps) {
  const { groupId } = useFocusGroup(options)
  const css =
    options.orientation === 'grid'
      ? style
      : {
          display: 'flex',
          flexDirection: options.orientation === 'vertical' ? 'column' : 'row',
          ...style,
        }

  return (
    <Tag
      className={className}
      style={css}
      data-focus-group={groupId}
    >
      {children}
    </Tag>
  )
}
