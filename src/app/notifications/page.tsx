"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Bell as BellIcon, 
  CheckCheck, 
  CreditCard, 
  FileText, 
  Trophy, 
  XCircle, 
  CheckCircle,
  Loader2
} from "lucide-react";
import { resolveRoute } from "@/lib/notifications/route-resolver";
import { getNotificationText } from "@/lib/notifications/message-catalog";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
  // New normalized fields (optional for backward compatibility)
  messageKey?: string | null;
  routeKey?: string | null;
  routeParams?: Record<string, string> | null;
  role?: string | null;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const res = await fetch("/api/notifications?limit=100");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [session?.user?.id]);

  // Reuse icon logic
  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case "NEW_LEAD":
        return <BellIcon className={iconClass} />;
      case "LEAD_PURCHASED":
        return <CreditCard className={iconClass} />;
      case "LEAD_APPROVED":
        return <CheckCircle className={iconClass} />;
      case "BID_SUBMITTED":
        return <FileText className={iconClass} />;
      case "BID_WON":
        return <Trophy className={iconClass} />;
      case "BID_LOST":
        return <XCircle className={iconClass} />;
      case "NEW_QUOTE":
        return <FileText className={iconClass} />;
      case "QUOTE_ACCEPTED":
        return <CheckCircle className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const getNotificationCategory = (type: string): "success" | "error" | "info" | "accent" => {
    switch (type) {
      case "BID_WON":
      case "QUOTE_ACCEPTED":
      case "LEAD_APPROVED":
        return "success";
      case "BID_LOST":
        return "error";
      case "LEAD_PURCHASED":
        return "accent";
      default:
        return "info";
    }
  };

  const getIconContainerClasses = (category: "success" | "error" | "info" | "accent") => {
    const baseClasses = "flex items-center justify-center w-12 h-12 rounded-card flex-shrink-0";
    switch (category) {
      case "success":
        return `${baseClasses} bg-success/10 text-success`;
      case "error":
        return `${baseClasses} bg-error/10 text-error`;
      case "accent":
        return `${baseClasses} bg-accent/10 text-accent`;
      case "info":
      default:
        return `${baseClasses} bg-primary/10 text-primary`;
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => n.id === notificationId ? { ...n, isRead: true } : n));
    try {
      await fetch(`/api/notifications/${notificationId}/read`, { method: "PATCH" });
    } catch {}
  };

  // Get notification destination (prefer normalized fields, fallback to legacy actionUrl)
  const getNotificationDestination = (notification: Notification): string | null => {
    if (notification.routeKey) {
      try {
        return resolveRoute(notification.routeKey as any, notification.routeParams || undefined);
      } catch (error) {
        console.error('[NotificationCenter] Route resolver failed:', error);
        // Fallback to legacy actionUrl if resolver fails
        return notification.actionUrl;
      }
    }
    // Legacy notifications without routeKey
    return notification.actionUrl;
  };

  // Get display text (prefer normalized messageKey, fallback to legacy title/message)
  const getNotificationDisplayText = (notification: Notification) => {
    if (notification.messageKey) {
      try {
        return getNotificationText(notification.messageKey as any);
      } catch {
        // Fallback to legacy fields if catalog lookup fails
        return { title: notification.title, message: notification.message };
      }
    }
    return { title: notification.title, message: notification.message };
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    const destination = getNotificationDestination(notification);
    if (destination) {
      window.location.href = destination;
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-heading-1 font-heading-bold mb-6 text-foreground">All Notifications</h1>
      <div className="bg-surface rounded-modal shadow-modal border border-border">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <BellIcon className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground text-body-small">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const displayText = getNotificationDisplayText(notification);
              const destination = getNotificationDestination(notification);
              
              return (
                <div
                  key={notification.id}
                  className={`relative transition-all duration-200 cursor-pointer ${
                    !notification.isRead 
                      ? "bg-surface border-l-4 border-primary hover:shadow-card hover:scale-[1.01]" 
                      : "bg-surface opacity-70 hover:opacity-90"
                  }`}
                  tabIndex={0}
                  role="button"
                  aria-label={displayText.title}
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleNotificationClick(notification);
                  }}
                >
                  <div className="p-4 flex gap-3">
                    <div className={getIconContainerClasses(getNotificationCategory(notification.type))} aria-hidden="true">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="text-heading-3 font-heading-semibold text-foreground flex-1">{displayText.title}</h4>
                        <span className="text-caption text-muted-foreground whitespace-nowrap">{getRelativeTime(notification.createdAt)}</span>
                      </div>
                      <p className="text-body-small text-foreground-secondary mb-3">{displayText.message}</p>
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                            className="px-3 py-1.5 text-caption font-caption-medium rounded-button border border-primary text-primary bg-transparent hover:bg-surface-hover transition-colors flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Mark this notification as read"
                          >
                            <CheckCheck className="h-3 w-3" />
                            <span>Mark as read</span>
                          </button>
                        )}
                        {destination && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); if (destination) window.location.href = destination; }}
                            className="px-3 py-1.5 text-caption font-caption-medium rounded-button border border-primary text-primary bg-transparent hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label={`View details for ${displayText.title}`}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
