import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive } from "lucide-react";

const BackupRecovery = () => {
  return (
    <AppLayout title="Backup & Recovery" subtitle="System backup and recovery management">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <HardDrive className="h-5 w-5 text-primary" />
            Backup & Recovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Backup recovery management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default BackupRecovery;