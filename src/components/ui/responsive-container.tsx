"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Prevent horizontal scrolling */
  noHorizontalScroll?: boolean
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Padding configuration */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Gap between child elements */
  gap?: 'none' | 'sm' | 'md' | 'lg'
}

const ResponsiveContainer = React.forwardRef<HTMLDivElement, ResponsiveContainerProps>(
  ({ 
    children, 
    className, 
    noHorizontalScroll = true,
    maxWidth = 'full',
    padding = 'none',
    gap = 'none',
    ...props 
  }, ref) => {
    const maxWidthClasses = {
      'sm': 'max-w-sm',
      'md': 'max-w-md', 
      'lg': 'max-w-lg',
      'xl': 'max-w-xl',
      '2xl': 'max-w-2xl',
      'full': 'max-w-full'
    }

    const paddingClasses = {
      'none': '',
      'sm': 'p-2',
      'md': 'p-4',
      'lg': 'p-6'
    }

    const gapClasses = {
      'none': '',
      'sm': 'gap-2',
      'md': 'gap-4',
      'lg': 'gap-6'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          gapClasses[gap],
          noHorizontalScroll && "overflow-x-hidden",
          "min-w-0", // Prevents flex/grid children from overflowing
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveContainer.displayName = "ResponsiveContainer"

interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Number of columns at different breakpoints */
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  /** Gap between grid items */
  gap?: 'none' | 'sm' | 'md' | 'lg'
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    children, 
    className,
    cols = { default: 1, sm: 2, md: 3, lg: 4 },
    gap = 'md',
    ...props 
  }, ref) => {
    const gapClasses = {
      'none': 'gap-0',
      'sm': 'gap-2',
      'md': 'gap-4', 
      'lg': 'gap-6'
    }

    const getColumnClasses = () => {
      const classes = ['grid']
      
      if (cols.default) classes.push(`grid-cols-${cols.default}`)
      if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`)
      if (cols.md) classes.push(`md:grid-cols-${cols.md}`)
      if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`)
      if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`)
      
      return classes
    }

    return (
      <div
        ref={ref}
        className={cn(
          ...getColumnClasses(),
          gapClasses[gap],
          "w-full max-w-full overflow-x-hidden min-w-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = "ResponsiveGrid"

interface ResponsiveFlexProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Flex direction */
  direction?: 'row' | 'col'
  /** Flex wrap */
  wrap?: boolean
  /** Gap between flex items */
  gap?: 'none' | 'sm' | 'md' | 'lg'
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch'
}

const ResponsiveFlex = React.forwardRef<HTMLDivElement, ResponsiveFlexProps>(
  ({ 
    children, 
    className,
    direction = 'row',
    wrap = true,
    gap = 'md',
    justify = 'start',
    align = 'start',
    ...props 
  }, ref) => {
    const gapClasses = {
      'none': 'gap-0',
      'sm': 'gap-2',
      'md': 'gap-4',
      'lg': 'gap-6'
    }

    const justifyClasses = {
      'start': 'justify-start',
      'center': 'justify-center', 
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly'
    }

    const alignClasses = {
      'start': 'items-start',
      'center': 'items-center',
      'end': 'items-end', 
      'stretch': 'items-stretch'
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          direction === 'col' ? 'flex-col' : 'flex-row',
          wrap && 'flex-wrap',
          gapClasses[gap],
          justifyClasses[justify],
          alignClasses[align],
          "w-full max-w-full overflow-x-hidden min-w-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveFlex.displayName = "ResponsiveFlex"

export { ResponsiveContainer, ResponsiveGrid, ResponsiveFlex }