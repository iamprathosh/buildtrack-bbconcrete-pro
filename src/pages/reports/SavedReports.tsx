import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const SavedReports = () => {
  return (
    <AppLayout title="Saved Reports" subtitle="Access your saved reports">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <FileText className="h-5 w-5 text-primary" />
            Saved Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Saved reports interface coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default SavedReports;