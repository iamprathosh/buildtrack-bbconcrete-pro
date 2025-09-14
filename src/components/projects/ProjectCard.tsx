import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, MapPin } from "lucide-react";

interface ProjectCardProps {
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

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, getStatusBadge }) => {
  const statusBadge = getStatusBadge(project.status);
  const budgetUsed = project.budget ? (project.spent / project.budget) * 100 : 0;

  return (
    <Card className="gradient-card border-0 shadow-brand hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="font-montserrat font-bold text-lg text-foreground">
              {project.name}
            </CardTitle>
            <CardDescription className="font-inter text-sm mt-1">
              {project.job_number} • {project.client}
            </CardDescription>
          </div>
          <Badge 
            variant={statusBadge.variant as any}
            className="ml-2"
          >
            {statusBadge.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="font-inter text-sm text-muted-foreground">
          {project.description || "No description available"}
        </p>
        
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-inter text-muted-foreground">Progress</span>
            <span className="text-sm font-inter font-medium">{Math.round(project.progress)}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Budget */}
        {project.budget && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-inter text-muted-foreground">Budget Used</span>
              <span className="text-sm font-inter font-medium">{budgetUsed.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-inter">
              <span className="text-muted-foreground">
                ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
          {project.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-inter text-muted-foreground truncate">
                {project.location}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-inter text-muted-foreground">
              {project.teamSize} members
            </span>
          </div>
          {project.end_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-inter text-muted-foreground">
                {new Date(project.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-inter text-muted-foreground truncate">
              {project.manager}
            </span>
          </div>
        </div>

        <Button variant="outline" className="w-full">
          View Details
        </Button>
      </CardContent>
    </Card>
  );
};