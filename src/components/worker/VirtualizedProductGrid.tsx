import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useMemo, useCallback } from 'react';
import ProductCard from './ProductCard';

interface ProductWithCategory {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  unit_of_measure: string;
  category: string;
  image_url?: string;
  mauc: number;
}

interface VirtualizedProductGridProps {
  products: ProductWithCategory[];
  selectedProducts: ProductWithCategory[];
  quantities: { [key: string]: string };
  currentAction: "pull" | "receive" | "return" | null;
  onToggleSelection: (product: ProductWithCategory) => void;
  onQuantityChange: (productId: string, value: string) => void;
}

const VirtualizedProductGrid = ({ 
  products, 
  selectedProducts, 
  quantities, 
  currentAction,
  onToggleSelection, 
  onQuantityChange 
}: VirtualizedProductGridProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  // Calculate items per row based on screen size
  const itemsPerRow = useMemo(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1280) return 4; // xl
      if (width >= 1024) return 3; // lg
      if (width >= 640) return 2;  // sm
      return 1; // base
    }
    return 4;
  }, []);

  // Group products into rows
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < products.length; i += itemsPerRow) {
      result.push(products.slice(i, i + itemsPerRow));
    }
    return result;
  }, [products, itemsPerRow]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Approximate height of a product card row
    overscan: 5, // Render 5 extra items for smooth scrolling
  });

  const memoizedToggleSelection = useCallback((product: ProductWithCategory) => {
    onToggleSelection(product);
  }, [onToggleSelection]);

  const memoizedQuantityChange = useCallback((productId: string, value: string) => {
    onQuantityChange(productId, value);
  }, [onQuantityChange]);

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
      style={{
        contain: 'strict',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-2">
              {rows[virtualRow.index]?.map((product) => {
                const isSelected = selectedProducts.some(p => p.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={isSelected}
                    currentAction={currentAction}
                    quantity={quantities[product.id] || ''}
                    onToggleSelection={memoizedToggleSelection}
                    onQuantityChange={memoizedQuantityChange}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualizedProductGrid;