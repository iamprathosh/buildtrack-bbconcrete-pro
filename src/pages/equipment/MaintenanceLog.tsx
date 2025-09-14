import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

const MaintenanceLog = () => {
  return (
    <AppLayout title="Maintenance Log" subtitle="Equipment maintenance tracking">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Settings className="h-5 w-5 text-primary" />
            Maintenance Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Maintenance log coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default MaintenanceLog;