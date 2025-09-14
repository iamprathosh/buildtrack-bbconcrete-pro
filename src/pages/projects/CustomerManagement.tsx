import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const CustomerManagement = () => {
  return (
    <AppLayout title="Customer Management" subtitle="Manage client relationships">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Users className="h-5 w-5 text-primary" />
            Customer Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Customer management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CustomerManagement;