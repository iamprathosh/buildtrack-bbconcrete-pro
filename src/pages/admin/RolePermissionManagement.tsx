import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const RolePermissionManagement = () => {
  return (
    <AppLayout title="Roles & Permissions" subtitle="Manage user roles and permissions">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Shield className="h-5 w-5 text-primary" />
            Role & Permission Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Role permission management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default RolePermissionManagement;