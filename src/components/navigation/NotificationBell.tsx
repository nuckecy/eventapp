"use client"

import { useState } from "react"
import { Bell, Check, X } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  resourceType?: string
  resourceId?: string
  createdAt: Date
  readAt?: Date | null
}

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (notificationId: string) => void
  onMarkAllAsRead?: () => void
  onDismiss?: (notificationId: string) => void
}

const getNotificationColor = (type: Notification["type"]) => {
  const colors = {
    info: "text-blue-600 bg-blue-50 border-blue-200",
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
    error: "text-red-600 bg-red-50 border-red-200",
  }
  return colors[type]
}

// Mock notifications for demonstration (replace with real data)
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Event Request Approved",
    message: "Your Youth Conference 2025 event request has been approved!",
    type: "success",
    resourceType: "event_request",
    resourceId: "REQ-001",
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    readAt: null,
  },
  {
    id: "2",
    title: "New Event Request",
    message: "Youth Ministry has submitted a new event request.",
    type: "info",
    resourceType: "event_request",
    resourceId: "REQ-002",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    readAt: null,
  },
  {
    id: "3",
    title: "Request Needs Revision",
    message: "Your event request has been returned for more details.",
    type: "warning",
    resourceType: "event_request",
    resourceId: "REQ-003",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    readAt: new Date(),
  },
]

export function NotificationBell({
  notifications = mockNotifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismiss,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Filter unread notifications
  const unreadNotifications = notifications.filter((n) => !n.readAt)
  const unreadCount = unreadNotifications.length

  const handleMarkAsRead = (notificationId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId)
    } else {
      // Default behavior - can be replaced with actual API call
      console.log("Mark as read:", notificationId)
    }
  }

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead()
    } else {
      // Default behavior
      console.log("Mark all as read")
    }
  }

  const handleDismiss = (notificationId: string) => {
    if (onDismiss) {
      onDismiss(notificationId)
    } else {
      // Default behavior
      console.log("Dismiss notification:", notificationId)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-red-600 p-0 text-[10px] font-bold text-white border-2 border-background"
              aria-label={`${unreadCount} unread notifications`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
              aria-label="Mark all notifications as read"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative p-4 transition-colors hover:bg-muted/50",
                    !notification.readAt && "bg-blue-50/50"
                  )}
                  role="article"
                  aria-label={`Notification: ${notification.title}`}
                >
                  {/* Unread indicator */}
                  {!notification.readAt && (
                    <div
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary"
                      aria-label="Unread"
                    />
                  )}

                  {/* Content */}
                  <div className={cn("space-y-1", !notification.readAt && "pl-4")}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-none">
                        {notification.title}
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={() => handleDismiss(notification.id)}
                        aria-label={`Dismiss notification: ${notification.title}`}
                      >
                        <X className="h-3 w-3" aria-hidden="true" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                      {!notification.readAt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                          onClick={() => handleMarkAsRead(notification.id)}
                          aria-label={`Mark "${notification.title}" as read`}
                        >
                          <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                setIsOpen(false)
                // Navigate to notifications page
                window.location.href = "/notifications"
              }}
              aria-label="View all notifications"
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
