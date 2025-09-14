import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

const InventoryOverview = () => {
  return (
    <AppLayout title="Inventory Overview" subtitle="Manage your inventory">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Package className="h-5 w-5 text-primary" />
            Inventory Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Inventory overview coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default InventoryOverview;