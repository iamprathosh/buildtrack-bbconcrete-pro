import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const ForecastingDashboard = () => {
  return (
    <AppLayout title="Forecasting" subtitle="Predictive analytics dashboard">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <TrendingUp className="h-5 w-5 text-primary" />
            Forecasting Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Forecasting dashboard coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ForecastingDashboard;