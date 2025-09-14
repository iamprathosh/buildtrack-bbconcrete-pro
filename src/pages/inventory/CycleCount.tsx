import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";

const CycleCount = () => {
  return (
    <AppLayout title="Cycle Count" subtitle="Physical inventory auditing">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <CheckSquare className="h-5 w-5 text-primary" />
            Cycle Count & Auditing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Cycle count interface coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default CycleCount;