import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck } from "lucide-react";

const VendorDetail = () => {
  return (
    <AppLayout title="Vendor Details" subtitle="Detailed vendor information">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Truck className="h-5 w-5 text-primary" />
            Vendor Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Vendor detail page coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default VendorDetail;