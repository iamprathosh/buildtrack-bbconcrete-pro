import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '@/hooks/useGlobalSearch';
import { 
  Package, 
  FolderOpen, 
  Users, 
  Truck, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onResultClick?: () => void;
  selectedIndex?: number;
  onMouseEnter?: (index: number) => void;
}

const getTypeIcon = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return Package;
    case 'project':
      return FolderOpen;
    case 'customer':
      return Users;
    case 'vendor':
      return Truck;
    case 'purchase_order':
      return FileText;
    default:
      return FileText;
  }
};

const getTypeLabel = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return 'Product';
    case 'project':
      return 'Project';
    case 'customer':
      return 'Customer';
    case 'vendor':
      return 'Vendor';
    case 'purchase_order':
      return 'Purchase Order';
    default:
      return 'Item';
  }
};

const getTypeColor = (type: SearchResult['type']) => {
  switch (type) {
    case 'product':
      return 'text-blue-500';
    case 'project':
      return 'text-green-500';
    case 'customer':
      return 'text-purple-500';
    case 'vendor':
      return 'text-orange-500';
    case 'purchase_order':
      return 'text-indigo-500';
    default:
      return 'text-gray-500';
  }
};

export function SearchResults({ 
  results, 
  isLoading, 
  onResultClick, 
  selectedIndex = -1,
  onMouseEnter
}: SearchResultsProps) {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    onResultClick?.();
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50">
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">No results found</p>
        </div>
      </div>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result, index) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push({ ...result, index });
    return acc;
  }, {} as Record<string, (SearchResult & { index: number })[]>);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="py-2">
        {Object.entries(groupedResults).map(([type, items]) => {
          const Icon = getTypeIcon(type as SearchResult['type']);
          const typeLabel = getTypeLabel(type as SearchResult['type']);
          const typeColor = getTypeColor(type as SearchResult['type']);

          return (
            <div key={type} className="mb-2 last:mb-0">
              <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border/50">
                <div className="flex items-center space-x-2">
                  <Icon className={cn("h-3 w-3", typeColor)} />
                  <span>{typeLabel}s</span>
                </div>
              </div>
              <div className="py-1">
                {items.map((result) => (
                  <button
                    key={result.id}
                    className={cn(
                      "w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group",
                      selectedIndex === result.index && "bg-muted"
                    )}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => onMouseEnter?.(result.index)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Icon className={cn("h-4 w-4 flex-shrink-0", typeColor)} />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm text-foreground truncate">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </div>
                          )}
                          {result.description && (
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {result.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}