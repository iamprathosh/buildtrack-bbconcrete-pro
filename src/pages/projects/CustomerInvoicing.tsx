import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const CustomerInvoicing = () => {
  return (
    <AppLayout title="Customer Invoicing" subtitle="Generate and track invoices">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <FileText className="h-5 w-5 text-primary" />
            Customer Invoicing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Customer invoicing coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CustomerInvoicing;