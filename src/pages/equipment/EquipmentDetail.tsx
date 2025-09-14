import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

const EquipmentDetail = () => {
  return (
    <AppLayout title="Equipment Details" subtitle="Detailed equipment information">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Wrench className="h-5 w-5 text-primary" />
            Equipment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Equipment detail page coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default EquipmentDetail;