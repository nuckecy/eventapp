"use client";

import { CalendarEvent, EventType } from "@/types/calendar";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CalendarEvent;
  variant?: "pill" | "card" | "compact";
  onClick?: () => void;
}

const eventTypeColors: Record<EventType, { bg: string; hover: string; text: string }> = {
  sunday: {
    bg: "bg-teal-500",
    hover: "hover:bg-teal-600",
    text: "text-white",
  },
  regional: {
    bg: "bg-purple-500",
    hover: "hover:bg-purple-600",
    text: "text-white",
  },
  local: {
    bg: "bg-blue-500",
    hover: "hover:bg-blue-600",
    text: "text-white",
  },
};

const eventTypeLabels: Record<EventType, string> = {
  sunday: "Sunday Event",
  regional: "Regional Event",
  local: "Local Event",
};

export function EventCard({ event, variant = "pill", onClick }: EventCardProps) {
  const colors = eventTypeColors[event.eventType];
  const typeLabel = eventTypeLabels[event.eventType];

  const timeRange = `${event.startTime} - ${event.endTime}`;

  // WCAG 2.1.1: Keyboard accessible - handle Enter and Space keys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (variant === "pill") {
    return (
      <button
        type="button"
        className={cn(
          colors.bg,
          colors.hover,
          colors.text,
          "rounded-full px-4 py-3 w-full text-left",
          "cursor-pointer transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`${event.title}, ${typeLabel}, ${timeRange}${event.location ? `, at ${event.location}` : ""}. Click to view details.`}
      >
        <div className="font-medium text-sm sm:text-base">{event.title}</div>
        <div className="text-xs sm:text-sm opacity-90 mt-1 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {timeRange}
          </span>
          {event.location && (
            <>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {event.location}
              </span>
            </>
          )}
        </div>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        className={cn(
          "w-full text-left p-2 rounded-md transition-colors",
          "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`${event.title}, ${typeLabel}, ${timeRange}. Click to view details.`}
      >
        <div className="flex items-start gap-2">
          <div
            className={cn(colors.bg, "w-1 h-full min-h-[40px] rounded-full flex-shrink-0")}
            aria-label={typeLabel}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{event.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{timeRange}</div>
            {event.location && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Card variant
  return (
    <button
      type="button"
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring",
        "bg-card"
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${event.title}, ${typeLabel}, ${timeRange}${event.location ? `, at ${event.location}` : ""}. Click to view details.`}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(colors.bg, "w-1 h-full min-h-[60px] rounded-full flex-shrink-0")}
          aria-label={typeLabel}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base mb-2">{event.title}</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>{timeRange}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{event.location}</span>
              </div>
            )}
            {event.departmentName && (
              <div className="text-xs text-muted-foreground mt-2">
                {event.departmentName}
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
