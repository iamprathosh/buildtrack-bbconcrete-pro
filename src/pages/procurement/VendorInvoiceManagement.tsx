import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt } from "lucide-react";

const VendorInvoiceManagement = () => {
  return (
    <AppLayout title="Vendor Invoices" subtitle="Manage vendor invoices">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Receipt className="h-5 w-5 text-primary" />
            Vendor Invoice Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Vendor invoice management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default VendorInvoiceManagement;