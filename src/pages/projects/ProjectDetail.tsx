import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

const ProjectDetail = () => {
  return (
    <AppLayout title="Project Details" subtitle="Detailed project information">
      <Card className="gradient-card border-0 shadow-brand">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-montserrat">
            <Building2 className="h-5 w-5 text-primary" />
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-inter text-muted-foreground">Project detail page coming soon...</p>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default ProjectDetail;