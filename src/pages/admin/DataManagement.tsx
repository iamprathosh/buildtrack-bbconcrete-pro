import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

const DataManagement = () => {
  return (
    <AppLayout title="Data Management" subtitle="Import/export and data operations">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Data management coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default DataManagement;