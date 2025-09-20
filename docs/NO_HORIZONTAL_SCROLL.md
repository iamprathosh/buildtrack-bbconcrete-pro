# No Horizontal Scroll Rules

This document outlines the comprehensive system implemented to prevent horizontal scrolling throughout the BuildTrack application.

## Overview

Horizontal scrolling is disabled at the application level to ensure a consistent user experience, **except for data tables** which can scroll horizontally when needed to maintain data readability and usability.

### Scrolling Policy
- **Application Level**: No horizontal scroll (prevents page-wide horizontal scrollbars)
- **Tables**: Horizontal scroll allowed within table containers to preserve data integrity
- **Content Areas**: All content must fit within viewport width
- **Text**: Proper wrapping and truncation to prevent overflow

## Global CSS Rules

### Applied to All Elements
```css
/* Global container constraints */
html, body {
  overflow-x: hidden;
  max-width: 100%;
}

/* Root layout container */
#__next {
  overflow-x: hidden;
  max-width: 100%;
}

/* Box sizing for all elements */
* {
  box-sizing: border-box;
}
```

### Container Classes
All container elements are constrained:
```css
.container,
.max-w-full,
.w-full,
[class*="container"],
[class*="max-w"],
[class*="w-full"] {
  overflow-x: hidden;
}
```

### Flex and Grid Containers
```css
.flex, [class*="flex"] {
  min-width: 0;
}

.grid, [class*="grid"] {
  min-width: 0;
}
```

### Text Handling
```css
p, span, div, h1, h2, h3, h4, h5, h6 {
  break-words: break-word;
  word-wrap: break-word;
  hyphens: auto;
}
```

## Layout Components

### Root Layout (`layout.tsx`)
```tsx
<html lang="en" className="overflow-x-hidden">
  <body className="overflow-x-hidden max-w-full">
    {children}
  </body>
</html>
```

### Dashboard Layout
```tsx
<SidebarInset className="flex flex-col h-screen overflow-x-hidden">
  <main className="overflow-y-auto overflow-x-hidden w-full max-w-full">
    <div className="p-4 w-full max-w-full">
      <div className="overflow-x-hidden w-full max-w-full">
        {children}
      </div>
    </div>
  </main>
</SidebarInset>
```

### Header Component
```tsx
<header className="w-full max-w-full overflow-x-hidden">
  <div className="w-full max-w-full min-w-0">
    <div className="min-w-0 flex-1">
      <h1 className="truncate">{title}</h1>
    </div>
  </div>
</header>
```

## Component-Level Rules

### Tables
Tables are allowed to scroll horizontally within their containers to maintain data readability:

**Basic Table Container:**
```tsx
<div className="table-container rounded-md border">
  <Table className="w-full" style={{ minWidth: '800px' }}>
    {/* table content */}
  </Table>
</div>
```

**Advanced Responsive Table:**
```tsx
import { DataTable } from '@/components/ui/responsive-table'

<DataTable 
  minWidth={1000}
  maxHeight="600px"
  showScrollIndicators={true}
>
  <TableHeader>
    {/* table headers */}
  </TableHeader>
  <TableBody>
    {/* table content */}
  </TableBody>
</DataTable>
```

### Grid Layouts
All grids use responsive breakpoints:
```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full max-w-full">
  {/* grid items */}
</div>
```

### View Containers
Main view containers are constrained:
```tsx
<div className="space-y-6 w-full max-w-full overflow-x-hidden">
  {/* view content */}
</div>
```

## Utility Components

### ResponsiveContainer
```tsx
import { ResponsiveContainer } from '@/components/ui/responsive-container'

<ResponsiveContainer noHorizontalScroll={true}>
  {/* content that should never overflow horizontally */}
</ResponsiveContainer>
```

### ResponsiveGrid
```tsx
import { ResponsiveGrid } from '@/components/ui/responsive-container'

<ResponsiveGrid cols={{ default: 1, sm: 2, md: 3, lg: 4 }}>
  {/* grid items */}
</ResponsiveGrid>
```

### ResponsiveFlex
```tsx
import { ResponsiveFlex } from '@/components/ui/responsive-container'

<ResponsiveFlex wrap={true} gap="md">
  {/* flex items */}
</ResponsiveFlex>
```

### DataTable (for tables with horizontal scrolling)
```tsx
import { DataTable } from '@/components/ui/responsive-table'

<DataTable
  minWidth={1200}
  maxHeight="500px"
  showScrollIndicators={true}
  containerClassName="border-2"
>
  <TableHeader>
    <TableRow>
      {/* headers */}
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* table rows */}
  </TableBody>
</DataTable>
```

### ResponsiveTableWrapper (advanced table container)
```tsx
import { ResponsiveTableWrapper, ResponsiveTable } from '@/components/ui/responsive-table'

<ResponsiveTableWrapper 
  minWidth={1000}
  showScrollIndicators={true}
  className="border rounded-lg"
>
  <ResponsiveTable fixedLayout={false}>
    {/* table content */}
  </ResponsiveTable>
</ResponsiveTableWrapper>
```

## Utility Classes

### CSS Utilities
- `.no-horizontal-scroll` - Applies `overflow-x: hidden` and `max-width: 100%`
- `.break-anywhere` - Forces text to break at any character
- `.table-responsive` - Makes tables horizontally scrollable with smooth scrolling
- `.table-container` - Table wrapper that prevents page-level overflow while allowing table scrolling
- `.flex-safe` - Safe flex container with `min-width: 0`
- `.grid-safe` - Safe grid container with `min-width: 0`

### Tailwind Classes
- `overflow-x-hidden` - Hide horizontal overflow
- `max-w-full` - Maximum width of 100%
- `min-w-0` - Minimum width of 0 (prevents flex/grid overflow)
- `truncate` - Truncate text with ellipsis
- `break-words` - Break long words
- `flex-shrink-0` - Prevent flex items from shrinking

## Responsive Breakpoints

All layouts use mobile-first responsive design:

- `grid-cols-1` (default/mobile)
- `sm:grid-cols-2` (≥640px)
- `md:grid-cols-3` (≥768px)  
- `lg:grid-cols-4` (≥1024px)
- `xl:grid-cols-6` (≥1280px)

## Text Handling Rules

### Long Text
- Use `truncate` class for single-line text
- Use `line-clamp-2` or `line-clamp-3` for multi-line text
- Apply `break-words` for word breaking
- Use `hyphens: auto` for better text flow

### Code Blocks
```css
pre, code {
  max-width: 100%;
  overflow-x: auto;
  word-break: break-all;
}
```

## Testing Checklist

When adding new components, ensure:

1. ✅ Container has `w-full max-w-full overflow-x-hidden`
2. ✅ Flex/Grid containers have `min-w-0`
3. ✅ Text content uses `truncate` or `break-words`
4. ✅ Tables use `.table-container` class or `DataTable` component for proper horizontal scrolling
5. ✅ Grid layouts use responsive breakpoints
6. ✅ Long content is handled appropriately
7. ✅ Component works on mobile (375px width)
8. ✅ Component works on tablet (768px width)
9. ✅ Component works on desktop (1024px+ width)

## Browser Support

These rules are compatible with:
- Chrome/Edge 88+
- Firefox 84+
- Safari 14+
- iOS Safari 14+
- Chrome Mobile 88+

## Performance Considerations

- Minimal CSS footprint through utility classes
- Hardware acceleration for transforms
- Efficient text rendering with proper typography settings
- Optimized responsive grid calculations

## Troubleshooting

### Common Issues

**Problem**: Content still overflowing horizontally
**Solution**: Check if element has fixed width or if parent container lacks `overflow-x-hidden`

**Problem**: Text not wrapping properly  
**Solution**: Apply `min-w-0` to flex/grid containers and `break-words` to text elements

**Problem**: Table causing horizontal scroll
**Solution**: Wrap table in `.table-responsive` container or use horizontal scroll intentionally

**Problem**: Grid items not responsive
**Solution**: Use mobile-first responsive breakpoints starting with `grid-cols-1`

**Problem**: Table causing page-wide horizontal scroll
**Solution**: Wrap table in `.table-container` class or use `DataTable` component

**Problem**: Table content gets cut off on mobile
**Solution**: Set appropriate `minWidth` on table and ensure horizontal scrolling is enabled

**Problem**: Table scrolling not smooth
**Solution**: Add `scroll-behavior: smooth` to table container or use `DataTable` component

### Debug Tools

1. Browser DevTools - check for elements with `overflow-x: scroll` or fixed widths
2. Responsive Design Mode - test at different screen sizes
3. CSS Grid/Flexbox inspector - visualize layout issues
4. Performance Monitor - check for layout thrashing

## Maintenance

This system should be:
- Reviewed when adding new components
- Updated when ShadCN UI components are updated
- Tested after major Tailwind CSS updates
- Validated during responsive design reviews

Remember: **No horizontal scrolling should ever occur in the application.**