import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const UserManagement = () => {
  return (
    <AppLayout title="User Management" subtitle="Manage system users">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Users className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">User management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default UserManagement;