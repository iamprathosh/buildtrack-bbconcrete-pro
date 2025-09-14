import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const SystemAuditLog = () => {
  return (
    <AppLayout title="System Audit Log" subtitle="View system activity logs">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <FileText className="h-5 w-5 text-primary" />
            System Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">System audit log coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SystemAuditLog;