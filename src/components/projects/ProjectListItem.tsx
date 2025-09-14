import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, MapPin, Building2 } from "lucide-react";

interface ProjectListItemProps {
  project: {
    id: string;
    name: string;
    job_number: string;
    description?: string;
    status: string;
    progress: number;
    budget?: number;
    spent: number;
    start_date?: string;
    end_date?: string;
    location?: string;
    teamSize: number;
    client: string;
    manager: string;
  };
  getStatusBadge: (status: string) => { variant: string; label: string };
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, getStatusBadge }) => {
  const statusBadge = getStatusBadge(project.status);
  const budgetUsed = project.budget ? (project.spent / project.budget) * 100 : 0;

  return (
    <Card className="gradient-card border-0 shadow-brand hover:shadow-lg transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Left section - Project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-montserrat font-bold text-lg text-foreground truncate">
                  {project.name}
                </h3>
                <p className="font-inter text-sm text-muted-foreground">
                  {project.job_number} • {project.client}
                </p>
                {project.description && (
                  <p className="font-inter text-sm text-muted-foreground mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </div>
              <Badge 
                variant={statusBadge.variant as any}
                className="ml-4 flex-shrink-0"
              >
                {statusBadge.label}
              </Badge>
            </div>

            {/* Progress and Budget row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-inter text-muted-foreground">Progress</span>
                  <span className="text-sm font-inter font-medium">{Math.round(project.progress)}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Budget */}
              {project.budget && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-inter text-muted-foreground">Budget Used</span>
                    <span className="text-sm font-inter font-medium">{budgetUsed.toFixed(1)}%</span>
                  </div>
                  <div className="text-sm font-inter text-muted-foreground">
                    ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Details row */}
            <div className="flex flex-wrap gap-4 text-sm">
              {project.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-inter text-muted-foreground truncate max-w-[200px]">
                    {project.location}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-inter text-muted-foreground">
                  {project.teamSize} members
                </span>
              </div>
              {project.end_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-inter text-muted-foreground">
                    Due: {new Date(project.end_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-inter text-muted-foreground">
                  {project.manager}
                </span>
              </div>
            </div>
          </div>

          {/* Right section - Action button */}
          <div className="ml-6 flex-shrink-0">
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};