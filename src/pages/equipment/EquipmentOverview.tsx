import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

const EquipmentOverview = () => {
  return (
    <AppLayout title="Equipment Overview" subtitle="Manage equipment and assets">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Wrench className="h-5 w-5 text-primary" />
            Equipment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Equipment overview coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default EquipmentOverview;