"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Table } from "@/components/ui/table"

interface ResponsiveTableWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Minimum width for the table to maintain readability */
  minWidth?: string | number
  /** Maximum height for the table container */
  maxHeight?: string | number
  /** Show scroll indicators */
  showScrollIndicators?: boolean
}

const ResponsiveTableWrapper = React.forwardRef<HTMLDivElement, ResponsiveTableWrapperProps>(
  ({ 
    children, 
    className, 
    minWidth = 800,
    maxHeight = "600px",
    showScrollIndicators = true,
    ...props 
  }, ref) => {
    const [showLeftIndicator, setShowLeftIndicator] = React.useState(false)
    const [showRightIndicator, setShowRightIndicator] = React.useState(false)
    const scrollContainerRef = React.useRef<HTMLDivElement>(null)

    const checkScrollIndicators = React.useCallback(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const { scrollLeft, scrollWidth, clientWidth } = container
      setShowLeftIndicator(scrollLeft > 0)
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 1)
    }, [])

    React.useEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      // Check initial state
      checkScrollIndicators()

      const handleScroll = () => checkScrollIndicators()
      const handleResize = () => checkScrollIndicators()

      container.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleResize)

      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    }, [checkScrollIndicators])

    const minWidthStyle = typeof minWidth === 'number' ? `${minWidth}px` : minWidth

    return (
      <div 
        ref={ref}
        className={cn(
          "relative w-full max-w-full",
          className
        )}
        {...props}
      >
        {/* Left scroll indicator */}
        {showScrollIndicators && showLeftIndicator && (
          <div className="absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        )}

        {/* Right scroll indicator */}
        {showScrollIndicators && showRightIndicator && (
          <div className="absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        )}

        {/* Scrollable table container */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto overflow-y-hidden"
          style={{ 
            maxHeight,
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth'
          }}
        >
          <div style={{ minWidth: minWidthStyle }}>
            {children}
          </div>
        </div>
      </div>
    )
  }
)

ResponsiveTableWrapper.displayName = "ResponsiveTableWrapper"

interface ResponsiveTableProps extends React.ComponentProps<typeof Table> {
  /** Minimum width for the table */
  minWidth?: string | number
  /** Whether columns should have fixed or flexible widths */
  fixedLayout?: boolean
}

const ResponsiveTable = React.forwardRef<
  React.ElementRef<typeof Table>,
  ResponsiveTableProps
>(({ className, minWidth = 800, fixedLayout = false, style, ...props }, ref) => {
  const minWidthStyle = typeof minWidth === 'number' ? `${minWidth}px` : minWidth

  return (
    <Table
      ref={ref}
      className={cn(
        "w-full",
        fixedLayout && "table-fixed",
        className
      )}
      style={{
        minWidth: minWidthStyle,
        ...style
      }}
      {...props}
    />
  )
})

ResponsiveTable.displayName = "ResponsiveTable"

interface DataTableProps {
  children: React.ReactNode
  /** Minimum width for the table */
  minWidth?: string | number
  /** Maximum height for the container */
  maxHeight?: string | number
  /** Whether to show scroll indicators */
  showScrollIndicators?: boolean
  /** Whether columns should have fixed layout */
  fixedLayout?: boolean
  /** Container class name */
  containerClassName?: string
  /** Table class name */
  tableClassName?: string
}

const DataTable = ({
  children,
  minWidth = 800,
  maxHeight = "600px",
  showScrollIndicators = true,
  fixedLayout = false,
  containerClassName,
  tableClassName
}: DataTableProps) => {
  return (
    <ResponsiveTableWrapper
      minWidth={minWidth}
      maxHeight={maxHeight}
      showScrollIndicators={showScrollIndicators}
      className={cn("rounded-md border", containerClassName)}
    >
      <ResponsiveTable
        minWidth={minWidth}
        fixedLayout={fixedLayout}
        className={tableClassName}
      >
        {children}
      </ResponsiveTable>
    </ResponsiveTableWrapper>
  )
}

export { ResponsiveTableWrapper, ResponsiveTable, DataTable }