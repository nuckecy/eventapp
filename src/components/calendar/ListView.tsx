"use client";

import { useMemo } from "react";
import { format, isSameDay, startOfDay } from "date-fns";
import { CalendarEvent, EventType } from "@/types/calendar";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface ListViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

interface GroupedEvents {
  date: Date;
  events: CalendarEvent[];
}

export function ListView({ events, currentDate, onEventClick }: ListViewProps) {
  // Group events by date and sort
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, GroupedEvents>();

    // Sort events by date and time
    const sortedEvents = [...events].sort((a, b) => {
      const dateCompare = a.eventDate.getTime() - b.eventDate.getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    // Group by date
    sortedEvents.forEach((event) => {
      const dateKey = format(startOfDay(event.eventDate), "yyyy-MM-dd");
      const existing = groups.get(dateKey);

      if (existing) {
        existing.events.push(event);
      } else {
        groups.set(dateKey, {
          date: startOfDay(event.eventDate),
          events: [event],
        });
      }
    });

    return Array.from(groups.values());
  }, [events]);

  const isCurrentDay = (date: Date) => {
    return isSameDay(date, new Date());
  };

  if (groupedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No events found</p>
        <p className="text-muted-foreground text-sm mt-2">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1" role="list" aria-label="Events list">
      {groupedEvents.map((group) => (
        <div key={group.date.toISOString()} className="space-y-1">
          {group.events.map((event, index) => (
            <div
              key={event.id}
              className="flex py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              role="listitem"
            >
              {/* Date Column - Only show for first event of the day */}
              {index === 0 ? (
                <div
                  className={cn(
                    "w-16 text-center flex-shrink-0",
                    isCurrentDay(group.date) && "text-primary font-bold"
                  )}
                  aria-label={format(group.date, "EEEE, MMMM d, yyyy")}
                >
                  <div className="text-xs text-muted-foreground uppercase">
                    {format(group.date, "EEE")}
                  </div>
                  <div
                    className={cn(
                      "text-2xl font-medium",
                      isCurrentDay(group.date) && "text-primary"
                    )}
                  >
                    {format(group.date, "d")}
                  </div>
                </div>
              ) : (
                <div className="w-16 flex-shrink-0" aria-hidden="true" />
              )}

              {/* Event Card */}
              <div className="flex-1 ml-4">
                <EventCard
                  event={event}
                  variant="pill"
                  onClick={() => onEventClick(event)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
