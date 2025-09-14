import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, Info, Package } from "lucide-react";

interface Notification {
  id: number;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
  icon: any;
  color: string;
  unread: boolean;
}

interface NotificationCenterProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead
}) => {
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          {unreadCount} Unread
        </Badge>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={onMarkAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => {
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
                  <div className="flex gap-2">
                    {notification.unread && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onMarkAsRead?.(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};