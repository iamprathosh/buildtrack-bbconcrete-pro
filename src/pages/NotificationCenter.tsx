import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, Info, Package, Building2, Users, Truck } from "lucide-react";

const NotificationCenter = () => {
  const notifications = [
    {
      id: 1,
      type: "warning",
      title: "Low Stock Alert",
      message: "Rebar #4 is running low (5 units remaining)",
      time: "2 hours ago",
      icon: AlertTriangle,
      color: "warning",
      unread: true
    },
    {
      id: 2,
      type: "success",
      title: "Delivery Completed",
      message: "Concrete delivery to Downtown Office Complex completed successfully",
      time: "4 hours ago",
      icon: CheckCircle,
      color: "success",
      unread: true
    },
    {
      id: 3,
      type: "info",
      title: "New Purchase Order",
      message: "PO #12345 has been created and sent to ABC Supply Co.",
      time: "6 hours ago",
      icon: Package,
      color: "info",
      unread: false
    },
    {
      id: 4,
      type: "info",
      title: "Project Update",
      message: "Highway Bridge Repair project status changed to 90% complete",
      time: "1 day ago",
      icon: Building2,
      color: "info",
      unread: false
    },
    {
      id: 5,
      type: "info",
      title: "New Team Member",
      message: "Sarah Johnson has been added to the Downtown Office Complex project",
      time: "2 days ago",
      icon: Users,
      color: "info",
      unread: false
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case "warning": return "text-warning";
      case "success": return "text-success";
      case "info": return "text-info";
      default: return "text-muted-foreground";
    }
  };

  const getBadgeClass = (color: string) => {
    switch (color) {
      case "warning": return "bg-warning/20 text-warning border-warning/30";
      case "success": return "bg-success/20 text-success border-success/30";
      case "info": return "bg-info/20 text-info border-info/30";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;
  const allNotifications = notifications;
  const unreadNotifications = notifications.filter(n => n.unread);

  return (
    <AppLayout title="Notifications" subtitle="Stay updated with your construction operations">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              {unreadCount} Unread
            </Badge>
          </div>
          <Button variant="outline">
            Mark All as Read
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Notifications ({allNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {allNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card 
                  key={notification.id} 
                  className={`gradient-card border-0 shadow-brand transition-all hover:shadow-lg ${
                    notification.unread ? 'ring-2 ring-primary/20' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${notification.color}/10`}>
                          <Icon className={`h-5 w-5 ${getIconColor(notification.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-montserrat font-semibold">
                              {notification.title}
                            </CardTitle>
                            {notification.unread && (
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                            )}
                          </div>
                          <CardDescription className="font-inter text-sm">
                            {notification.message}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getBadgeClass(notification.color)}>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-inter">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="unread" className="space-y-4 mt-6">
            {unreadNotifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <Card 
                  key={notification.id} 
                  className="gradient-card border-0 shadow-brand transition-all hover:shadow-lg ring-2 ring-primary/20"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-${notification.color}/10`}>
                          <Icon className={`h-5 w-5 ${getIconColor(notification.color)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-montserrat font-semibold">
                              {notification.title}
                            </CardTitle>
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                          <CardDescription className="font-inter text-sm">
                            {notification.message}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getBadgeClass(notification.color)}>
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground font-inter">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          Mark as Read
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default NotificationCenter;