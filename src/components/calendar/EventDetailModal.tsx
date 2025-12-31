"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent, EventType } from "@/types/calendar";
import { X, Calendar, Clock, MapPin, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FocusTrap } from "@/components/accessibility";
import { cn } from "@/lib/utils";

interface EventDetailModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

const eventTypeColors: Record<EventType, { bg: string; text: string; label: string }> = {
  sunday: {
    bg: "bg-teal-500",
    text: "text-teal-700",
    label: "Sunday Event",
  },
  regional: {
    bg: "bg-purple-500",
    text: "text-purple-700",
    label: "Regional Event",
  },
  local: {
    bg: "bg-blue-500",
    text: "text-blue-700",
    label: "Local Event",
  },
};

export function EventDetailModal({ event, isOpen, onClose }: EventDetailModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = eventTypeColors[event.eventType];
  const formattedDate = format(event.eventDate, "EEEE, MMMM d, yyyy");
  const timeRange = `${event.startTime} - ${event.endTime}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-modal-title"
      aria-describedby="event-modal-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* WCAG 2.1.2 & 2.4.3: FocusTrap ensures keyboard navigation stays within modal */}
      <FocusTrap active={isOpen} onEscape={onClose}>
        <div
          className={cn(
            "relative bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto",
            "animate-in fade-in zoom-in-95 duration-200"
          )}
        >
        {/* Header with Color Bar */}
        <div className={cn(colors.bg, "h-2 rounded-t-lg")} aria-hidden="true" />

        <div className="p-6 space-y-6">
          {/* Close Button */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2
                id="event-modal-title"
                className="text-2xl font-bold text-foreground pr-8"
              >
                {event.title}
              </h2>
              <div className="mt-2">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
                    "bg-muted",
                    colors.text
                  )}
                >
                  {colors.label}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Event Details */}
          <div id="event-modal-description" className="space-y-4">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-medium">{formattedDate}</div>
              </div>
            </div>

            {/* Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
              <div>
                <div className="font-medium">{timeRange}</div>
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-medium">{event.location}</div>
                </div>
              </div>
            )}

            {/* Department */}
            {event.departmentName && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Department</div>
                  <div className="font-medium">{event.departmentName}</div>
                </div>
              </div>
            )}

            {/* Expected Attendance */}
            {event.expectedAttendance && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <div className="text-sm text-muted-foreground">Expected Attendance</div>
                  <div className="font-medium">{event.expectedAttendance} people</div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t flex justify-end">
            <Button onClick={onClose} aria-label="Close event details modal">
              Close
            </Button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
