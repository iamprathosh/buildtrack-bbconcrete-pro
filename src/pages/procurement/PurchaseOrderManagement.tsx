import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const PurchaseOrderManagement = () => {
  return (
    <AppLayout title="Purchase Orders" subtitle="Manage purchase orders">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Purchase Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Purchase order management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default PurchaseOrderManagement;