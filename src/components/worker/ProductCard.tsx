import { memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, AlertCircle } from "lucide-react";

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

interface ProductCardProps {
  product: ProductWithCategory;
  isSelected: boolean;
  currentAction: "pull" | "receive" | "return" | null;
  quantity: string;
  onToggleSelection: (product: ProductWithCategory) => void;
  onQuantityChange: (productId: string, value: string) => void;
}

const ProductCard = memo(({ 
  product, 
  isSelected, 
  currentAction, 
  quantity, 
  onToggleSelection, 
  onQuantityChange 
}: ProductCardProps) => {
  const handleCardClick = useCallback(() => {
    onToggleSelection(product);
  }, [product, onToggleSelection]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onQuantityChange(product.id, e.target.value);
  }, [product.id, onQuantityChange]);

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const stockStatus = useMemo(() => {
    if (product.current_stock >= 25) {
      return { className: 'bg-green-100 text-green-700', text: '✓ Good' };
    } else if (product.current_stock >= 10) {
      return { className: 'bg-yellow-100 text-yellow-700', text: '⚠ Low' };
    } else {
      return { className: 'bg-red-100 text-red-700', text: '⚠ Critical' };
    }
  }, [product.current_stock]);

  const hasStockWarning = product.current_stock < 10;
  const hasQuantityError = currentAction === "pull" && quantity && 
    parseInt(quantity) > product.current_stock;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
          : 'hover:shadow-lg hover:border-primary/30'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Checkbox 
            checked={isSelected}
            onChange={handleCardClick}
          />
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
        </div>
        
        <div className="text-center mb-3">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg mx-auto mb-2"
              loading="lazy"
            />
          ) : (
            <div className="bg-gray-100 rounded-lg p-3 mb-2 w-12 h-12 mx-auto flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
          )}
          
          <h4 className="font-bold text-sm mb-1">{product.name}</h4>
          <p className="text-xs text-gray-600">SKU: {product.sku}</p>
          
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="text-sm font-medium">
              {product.current_stock} {product.unit_of_measure}
            </span>
            {hasStockWarning && (
              <AlertCircle className="h-3 w-3 text-red-500" />
            )}
          </div>
          
          <div className={`text-xs px-2 py-1 rounded-full mt-1 ${stockStatus.className}`}>
            {stockStatus.text}
          </div>
        </div>

        {isSelected && (
          <div className="border-t pt-3">
            <Label className="text-xs font-medium mb-1 block">
              Quantity ({product.unit_of_measure})
            </Label>
            <Input
              type="number"
              min="1"
              max={currentAction === "pull" ? product.current_stock : undefined}
              value={quantity || ""}
              onChange={handleQuantityChange}
              placeholder="0"
              className="h-8 text-sm"
              onClick={handleInputClick}
            />
            {hasQuantityError && (
              <p className="text-xs text-red-600 mt-1">
                Max: {product.current_stock}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;