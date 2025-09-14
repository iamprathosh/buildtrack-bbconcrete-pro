import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const SystemSettings = () => {
  return (
    <AppLayout title="System Settings" subtitle="Configure application settings">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Settings className="h-5 w-5 text-primary" />
            System Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">System settings coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SystemSettings;