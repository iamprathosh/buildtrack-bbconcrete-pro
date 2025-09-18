import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Skeleton for action selection cards
export function ActionSelectionSkeleton() {
  return (
    <div className="flex justify-center items-center mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl w-full px-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full animate-pulse">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
              <Skeleton className="w-20 h-20 rounded-2xl mb-6" />
              <Skeleton className="h-8 w-32 mb-3" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Skeleton for product cards grid
export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card 
          key={i} 
          className="animate-pulse" 
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="w-4 h-4 rounded" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            
            <div className="text-center mb-3">
              <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-2" />
              <Skeleton className="h-5 w-24 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
              
              <div className="flex items-center justify-center gap-1 mt-2">
                <Skeleton className="h-4 w-16" />
              </div>
              
              <Skeleton className="h-6 w-20 mx-auto mt-1 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Skeleton for transaction history
export function TransactionHistorySkeleton() {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {Array.from({ length: 8 }).map((_, i) => (
        <div 
          key={i}
          className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-3 h-3 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for filter section
export function FilterSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 flex-1" />
      </div>
    </div>
  );
}

// Skeleton for project header info
export function ProjectHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-8 h-8" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-6 w-64 mb-2" />
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <Skeleton className="h-12 w-40" />
    </div>
  );
}

// Skeleton for the entire worker operations page with exact layout matching
export function WorkerOperationsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/10 relative overflow-hidden animate-in fade-in duration-500">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Welcome Section - exact same spacing */}
        <div className="text-center space-y-6 mb-12">
          <Skeleton className="h-[54px] w-[400px] mx-auto" /> {/* text-4xl height */}
          <Skeleton className="h-[28px] w-[500px] mx-auto" /> {/* text-xl height */}
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Action Selection Skeleton - maintain exact layout */}
        <div className="flex justify-center items-center mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl w-full px-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-full opacity-60">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[280px]">
                  <Skeleton className="w-20 h-20 rounded-2xl mb-6" />
                  <Skeleton className="h-8 w-32 mb-3" />
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
