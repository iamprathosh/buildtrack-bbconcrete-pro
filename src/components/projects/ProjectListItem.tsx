import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, Users, MapPin, Building2, Edit, Eye } from "lucide-react";

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
    customer_id?: string;
    project_manager_id?: string;
  };
  getStatusBadge: (status: string) => { variant: string; label: string };
  onEdit?: (project: any) => void;
}

export const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, getStatusBadge, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);
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

          {/* Right section - Action buttons */}
          <div className="ml-6 flex-shrink-0 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(project)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Project Details Dialog - Same as ProjectCard */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Project Details - {project.name}
            </DialogTitle>
            <DialogDescription>
              Complete project information and statistics
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Project Name</Label>
                <p className="font-medium">{project.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Job Number</Label>
                <p className="font-medium">{project.job_number}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Client</Label>
                <p className="font-medium">{project.client}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Project Manager</Label>
                <p className="font-medium">{project.manager}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div>
                  <Badge variant={statusBadge.variant as any}>
                    {statusBadge.label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Team Size</Label>
                <p className="font-medium">{project.teamSize} members</p>
              </div>
            </div>
            
            {/* Description */}
            {project.description && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm mt-1">{project.description}</p>
              </div>
            )}
            
            {/* Location */}
            {project.location && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="text-sm mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {project.location}
                </p>
              </div>
            )}
            
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              {project.start_date && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(project.start_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {project.end_date && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {new Date(project.end_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                <span className="text-sm font-medium">{Math.round(project.progress)}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            
            {/* Budget */}
            {project.budget && (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Label className="text-sm font-medium text-muted-foreground">Budget</Label>
                  <p className="text-lg font-bold text-primary">
                    ${project.budget.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium text-muted-foreground">Spent</Label>
                  <p className="text-lg font-bold text-warning">
                    ${project.spent.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <Label className="text-sm font-medium text-muted-foreground">Remaining</Label>
                  <p className="text-lg font-bold text-success">
                    ${(project.budget - project.spent).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {onEdit && (
              <Button onClick={() => {
                setShowDetails(false);
                onEdit(project);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
