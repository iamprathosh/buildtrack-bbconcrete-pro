import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

const ReportBuilder = () => {
  return (
    <AppLayout title="Report Builder" subtitle="Create custom reports">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <BarChart3 className="h-5 w-5 text-primary" />
            Custom Report Builder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Report builder interface coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ReportBuilder;