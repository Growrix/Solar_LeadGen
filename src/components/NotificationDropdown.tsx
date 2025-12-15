"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bell as BellIcon, 
  CheckCheck, 
  CreditCard, 
  FileText, 
  Trophy, 
  XCircle, 
  CheckCircle,
  Loader2,
  // T354: Add new unique icons
  Briefcase,      // BID_SUBMITTED
  FileCheck,      // NEW_QUOTE
  DollarSign,     // PAYMENT_RECEIVED
  AlertCircle,    // PAYMENT_FAILED
  MessageSquare,  // NEW_MESSAGE
  ClipboardCheck, // LEAD_ASSIGNED
  Info            // SYSTEM
} from 'lucide-react';
import { useNotifications } from '@/lib/hooks/usePusher';
import { resolveRoute, validateRouteKey, RouteKey, RouteParams } from '@/lib/notifications/route-resolver';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  // Legacy field
  actionUrl: string | null;
  // New normalized fields
  messageKey?: string | null;
  routeKey?: string | null;
  routeParams?: RouteParams | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Extract user role for conditional UI rendering
  const userRole = session?.user?.role || 'HOMEOWNER';

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Subscribe to real-time notifications via Pusher
  useNotifications(session?.user?.id || '', (notification) => {
    // Add new notification to the top
    setNotifications((prev) => [notification, ...prev].slice(0, 10));
    setUnreadCount((prev) => prev + 1);
  });

  // Initial fetch
  useEffect(() => {
    if (isOpen && session?.user?.id) {
      fetchNotifications();
    }
  }, [isOpen, session?.user?.id, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setMarkingAsRead(notificationId);
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Get notification destination (new normalized approach)
  const getNotificationDestination = (notification: Notification): string => {
    // Prefer new normalized fields
    if (notification.routeKey && validateRouteKey(notification.routeKey)) {
      return resolveRoute(notification.routeKey as RouteKey, notification.routeParams || undefined);
    }

    // Fallback to legacy actionUrl
    if (notification.actionUrl) {
      const cleanUrl = notification.actionUrl.trim();
      if (cleanUrl.startsWith('/')) {
        return cleanUrl;
      }
    }

    // Default fallback based on role
    const userRole = session?.user?.role || 'HOMEOWNER';
    if (userRole === 'INSTALLER') return '/installer/leads';
    if (userRole === 'ADMIN') return '/admin/dashboard';
    return '/homeowner/dashboard';
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    const destination = getNotificationDestination(notification);
    router.push(destination);
    setIsOpen(false);
  };

  // Handle view button click
  const handleViewClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    const destination = getNotificationDestination(notification);
    router.push(destination);
    setIsOpen(false);
  };

  // T354: Get notification icon based on type (unique icons for each type)
  const getNotificationIcon = (type: string) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'NEW_LEAD':
        return <BellIcon className={iconClass} />;
      case 'LEAD_PURCHASED':
        return <CreditCard className={iconClass} />;
      case 'LEAD_ASSIGNED':
        return <ClipboardCheck className={iconClass} />;
      case 'LEAD_APPROVED':
        return <CheckCircle className={iconClass} />;
      case 'BID_SUBMITTED':
        return <Briefcase className={iconClass} />;
      case 'BID_WON':
        return <Trophy className={iconClass} />;
      case 'BID_LOST':
        return <XCircle className={iconClass} />;
      case 'NEW_QUOTE':
        return <FileCheck className={iconClass} />;
      case 'QUOTE_ACCEPTED':
        return <CheckCheck className={iconClass} />;
      case 'NEW_MESSAGE':
        return <MessageSquare className={iconClass} />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign className={iconClass} />;
      case 'PAYMENT_FAILED':
        return <AlertCircle className={iconClass} />;
      case 'SYSTEM':
        return <Info className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  // T355: Get notification priority for color coding
  type NotificationPriority = 'urgent' | 'high' | 'medium' | 'low' | 'info';

  const getNotificationPriority = (type: string): NotificationPriority => {
    switch (type) {
      // URGENT (Red) - Immediate action required
      case 'PAYMENT_FAILED':
      case 'BID_LOST':
        return 'urgent';
      
      // HIGH (Orange/Accent) - Time-sensitive
      case 'BID_WON':
      case 'LEAD_ASSIGNED':
      case 'NEW_MESSAGE':
        return 'high';
      
      // MEDIUM (Blue/Primary) - Standard notifications
      case 'NEW_LEAD':
      case 'BID_SUBMITTED':
      case 'NEW_QUOTE':
      case 'LEAD_PURCHASED':
        return 'medium';
      
      // LOW (Green) - Positive confirmations
      case 'LEAD_APPROVED':
      case 'QUOTE_ACCEPTED':
      case 'PAYMENT_RECEIVED':
        return 'low';
      
      // INFO (Gray) - System messages
      case 'SYSTEM':
      case 'LEAD_RESOLD':
      default:
        return 'info';
    }
  };

  // T355: Get icon container classes based on priority
  const getIconContainerClasses = (priority: NotificationPriority) => {
    const baseClasses = "flex items-center justify-center w-12 h-12 rounded-card flex-shrink-0";
    
    switch (priority) {
      case 'urgent':
        return `${baseClasses} bg-error/10 text-error`;
      case 'high':
        return `${baseClasses} bg-accent/10 text-accent`;
      case 'medium':
        return `${baseClasses} bg-primary/10 text-primary`;
      case 'low':
        return `${baseClasses} bg-success/10 text-success`;
      case 'info':
        return `${baseClasses} bg-muted/10 text-muted-foreground`;
    }
  };

  // T356: Get type label for badge
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'NEW_LEAD': return 'Lead';
      case 'LEAD_ASSIGNED': return 'Assigned';
      case 'LEAD_PURCHASED': return 'Purchase';
      case 'BID_SUBMITTED': return 'Bid';
      case 'BID_WON': return 'Winner';
      case 'BID_LOST': return 'Closed';
      case 'NEW_QUOTE': return 'Quote';
      case 'QUOTE_ACCEPTED': return 'Accepted';
      case 'NEW_MESSAGE': return 'Message';
      case 'PAYMENT_RECEIVED': return 'Paid';
      case 'PAYMENT_FAILED': return 'Failed';
      case 'SYSTEM': return 'System';
      default: return type;
    }
  };

  // T356: Get type badge classes based on priority
  const getTypeBadgeClasses = (priority: NotificationPriority): string => {
    switch (priority) {
      case 'urgent':
        return 'bg-error/20 text-error';
      case 'high':
        return 'bg-accent/20 text-accent';
      case 'medium':
        return 'bg-primary/20 text-primary';
      case 'low':
        return 'bg-success/20 text-success';
      case 'info':
        return 'bg-muted/20 text-muted-foreground';
    }
  };

  // T357: Get smart action button for notification
  const getSmartActionButton = (notification: Notification) => {
    const baseClasses = "px-3 py-1.5 text-button rounded-button border border-primary text-primary bg-transparent hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
    
    switch (notification.type) {
      case 'BID_WON':
        return (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
            disabled={!notification.actionUrl}
          >
            Proceed to Payment
          </button>
        );
      
      case 'BID_SUBMITTED':
        return (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
            disabled={!notification.actionUrl}
          >
            Review Bids
          </button>
        );
      
      case 'NEW_LEAD':
      case 'LEAD_ASSIGNED':
        return (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
            disabled={!notification.actionUrl}
          >
            View Lead
          </button>
        );
      
      case 'NEW_MESSAGE':
        return (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
            disabled={!notification.actionUrl}
          >
            Reply
          </button>
        );
      
      case 'PAYMENT_FAILED':
        return (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
            disabled={!notification.actionUrl}
          >
            Retry Payment
          </button>
        );
      
      default:
        return notification.actionUrl ? (
          <button
            onClick={(e) => handleViewClick(notification, e)}
            className={baseClasses}
          >
            View
          </button>
        ) : null;
    }
  };

  // Get notification styling category
  const getNotificationCategory = (type: string): 'success' | 'error' | 'info' | 'accent' => {
    switch (type) {
      case 'BID_WON':
      case 'QUOTE_ACCEPTED':
      case 'LEAD_APPROVED':
        return 'success';
      case 'BID_LOST':
        return 'error';
      case 'LEAD_PURCHASED':
        return 'accent';
      default:
        return 'info';
    }
  };

  // Get relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative dashboard-header__action-btn"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-caption text-foreground ring-2 ring-surface">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-modal bg-surface shadow-modal border border-border z-50 overflow-hidden"
          role="dialog"
          aria-label="Notifications panel"
          aria-live="polite"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4 bg-surface">
            <h3 className="text-heading-3 text-foreground">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-label text-primary hover:text-primary-hover transition-colors"
                title="Mark all as read"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto bg-background">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <BellIcon className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
                <p className="text-muted-foreground text-body-small">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const priority = getNotificationPriority(notification.type);
                  const iconContainerClasses = getIconContainerClasses(priority);
                  const typeBadgeClasses = getTypeBadgeClasses(priority);
                  
                  return (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onView={handleViewClick}
                      markingAsRead={markingAsRead}
                      getIcon={getNotificationIcon}
                      iconContainerClasses={iconContainerClasses}
                      typeBadgeClasses={typeBadgeClasses}
                      typeLabel={getTypeLabel(notification.type)}
                      getRelativeTime={getRelativeTime}
                      smartActionButton={getSmartActionButton(notification)}
                      userRole={userRole}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-border p-3 bg-surface">
              <button
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-label text-primary hover:text-primary-hover transition-colors"
                aria-label="View all notifications page"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Notification Card Component
interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string, e?: React.MouseEvent) => void;
  onView: (notification: Notification, e: React.MouseEvent) => void;
  markingAsRead: string | null;
  getIcon: (type: string) => React.ReactNode;
  iconContainerClasses: string;
  typeBadgeClasses: string;
  typeLabel: string;
  getRelativeTime: (dateString: string) => string;
  smartActionButton: React.ReactNode;
  userRole?: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onView,
  markingAsRead,
  getIcon,
  iconContainerClasses,
  typeBadgeClasses,
  typeLabel,
  getRelativeTime,
  smartActionButton,
  userRole,
}) => {
  const isMarkingThis = markingAsRead === notification.id;

  return (
    <div
      className={`relative transition-all duration-200 ${
        !notification.isRead 
          ? 'bg-surface border-l-4 border-primary hover:shadow-card hover:scale-[1.01]' 
          : 'bg-surface opacity-70 hover:opacity-90'
      }`}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {/* Icon Container */}
          <div className={iconContainerClasses} aria-hidden="true">
            {getIcon(notification.type)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* T356: Title + Type Badge (hidden for homeowners) + Timestamp */}
            <div className="flex justify-between items-start gap-2 mb-1">
              <div className="flex items-center gap-2 flex-1">
                <h4 className="text-heading-4 text-foreground">
                  {notification.title}
                </h4>
                {/* Only show type badge for Admin and Installer - hide for Homeowners */}
                {userRole !== 'HOMEOWNER' && (
                  <span className={`px-2 py-0.5 text-caption rounded-full ${typeBadgeClasses}`}>
                    {typeLabel}
                  </span>
                )}
              </div>
              <span className="text-caption text-muted-foreground whitespace-nowrap">
                {getRelativeTime(notification.createdAt)}
              </span>
            </div>

            {/* Message (full text, no truncation) */}
            <p className="text-body-small text-foreground-secondary mb-3">
              {notification.message}
            </p>

            {/* T357: Smart Action Buttons */}
            <div className="flex gap-2 flex-wrap">
                {!notification.isRead && (
                  <button
                    onClick={(e) => onMarkAsRead(notification.id, e)}
                    disabled={isMarkingThis}
                    className="px-3 py-1.5 text-button rounded-button border border-primary text-primary bg-transparent hover:bg-surface-hover transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Mark this notification as read"
                  >
                    {isMarkingThis ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Marking...</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="h-3 w-3" />
                        <span>Mark as read</span>
                      </>
                    )}
                  </button>
                )}
                {smartActionButton}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
