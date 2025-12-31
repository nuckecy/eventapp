"use client";

import { useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { CalendarEvent, EventType } from "@/types/calendar";
import { EventCard } from "./EventCard";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  events: CalendarEvent[];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
}

const eventTypeColors: Record<EventType, string> = {
  sunday: "bg-teal-500",
  regional: "bg-purple-500",
  local: "bg-blue-500",
};

export function MonthView({ events, currentDate, onEventClick }: MonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const dateKey = format(event.eventDate, "yyyy-MM-dd");
      const existing = map.get(dateKey);
      if (existing) {
        existing.push(event);
      } else {
        map.set(dateKey, [event]);
      }
    });
    return map;
  }, [events]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    return eventsByDate.get(dateKey) || [];
  };

  // Get unique event types for a day (for dots)
  const getEventTypesForDay = (day: Date): EventType[] => {
    const dayEvents = getEventsForDay(day);
    const types = new Set<EventType>();
    dayEvents.forEach((event) => types.add(event.eventType));
    return Array.from(types);
  };

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedDate(isSameDay(day, selectedDate || new Date(0)) ? null : day);
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div className="bg-card border rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/50 border-b">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day);
            const eventTypes = getEventTypesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] p-2 border-b border-r text-left transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring",
                  !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                  isCurrentMonth && "hover:bg-muted/50",
                  isSelected && "bg-muted ring-2 ring-inset ring-primary",
                  hasEvents && "cursor-pointer",
                  !hasEvents && "cursor-default",
                  (index + 1) % 7 === 0 && "border-r-0"
                )}
                onClick={() => handleDayClick(day)}
                disabled={!hasEvents}
                aria-label={`${format(day, "MMMM d, yyyy")}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : ""}`}
                aria-pressed={isSelected}
              >
                <div className="flex flex-col h-full">
                  {/* Day Number */}
                  <div
                    className={cn(
                      "text-sm font-medium mb-1",
                      isCurrentDay &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  {/* Event Indicators (Dots) */}
                  {eventTypes.length > 0 && (
                    <div className="flex gap-1 mt-auto" aria-label={`Event types: ${eventTypes.map(t => t).join(", ")}`}>
                      {eventTypes.slice(0, 3).map((type) => (
                        <div
                          key={type}
                          className={cn(eventTypeColors[type], "w-2 h-2 rounded-full")}
                          aria-hidden="true"
                        />
                      ))}
                      {eventTypes.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{eventTypes.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="space-y-3" role="region" aria-label={`Events for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h3>
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setSelectedDate(null)}
              aria-label="Close event list"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {selectedDateEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant="card"
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
