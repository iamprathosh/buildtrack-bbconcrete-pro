import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const InventoryTransfer = () => {
  return (
    <AppLayout title="Inventory Transfer" subtitle="Transfer inventory between locations">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <ArrowRight className="h-5 w-5 text-primary" />
            Inventory Transfer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Inventory transfer coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default InventoryTransfer;