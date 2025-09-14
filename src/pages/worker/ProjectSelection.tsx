import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Building2, MapPin, Calendar, Search, Users } from "lucide-react";
import BBLogo from "@/assets/bb-logo.svg";

const WorkerProjectSelection = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const projects = [
    {
      id: 1,
      name: "Downtown Office Complex",
      location: "123 Main Street, Downtown",
      status: "Active",
      progress: 75,
      startDate: "2024-01-15",
      team: 12
    },
    {
      id: 2,
      name: "Residential Building A",
      location: "456 Oak Avenue, Westside",
      status: "Active",
      progress: 45,
      startDate: "2024-02-01",
      team: 8
    },
    {
      id: 3,
      name: "Highway Bridge Repair",
      location: "Route 95, Mile Marker 42",
      status: "Active",
      progress: 90,
      startDate: "2023-11-20",
      team: 15
    }
  ];

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={BBLogo} alt="BuildTrack" className="h-8 brightness-0 invert" />
            <div>
              <h1 className="font-montserrat font-bold text-xl">Select Project</h1>
              <p className="font-inter text-sm opacity-90">Choose your assigned project</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-inter"
            />
          </div>

          {/* Project Cards */}
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <Card 
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-lg gradient-card border-0 shadow-brand ${
                  selectedProject === project.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="font-montserrat font-bold text-lg text-foreground">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <CardDescription className="font-inter text-sm">
                          {project.location}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-inter text-muted-foreground">Progress</span>
                      <span className="text-sm font-inter font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground">
                        Started {new Date(project.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-inter text-muted-foreground">
                        {project.team} team members
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedProject && (
            <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto">
              <Button 
                className="w-full" 
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/worker/inventory'}
              >
                Continue to Inventory
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerProjectSelection;