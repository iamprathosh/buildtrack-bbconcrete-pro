import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const ProductDetail = () => {
  return (
    <AppLayout title="Product Details" subtitle="Detailed product information">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Package className="h-5 w-5 text-primary" />
            Product Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Product detail page coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ProductDetail;