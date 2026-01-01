"use client";

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { ListView } from "./ListView";
import { MonthView } from "./MonthView";
import { CalendarFilters } from "./CalendarFilters";
import { EventDetailModal } from "./EventDetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarEvent, CalendarFilters as FilterType, ViewMode } from "@/types/calendar";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
  departments?: { id: string; name: string }[];
}

export function CalendarView({ events, departments = [] }: CalendarViewProps) {
  const [view, setView] = useState<ViewMode>("list");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [filters, setFilters] = useState<FilterType>({
    search: "",
    eventTypes: ["sunday", "regional", "local"],
    departmentId: null,
  });

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Search filter
      if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Event type filter
      if (!filters.eventTypes.includes(event.eventType)) {
        return false;
      }

      // Department filter
      if (filters.departmentId && event.departmentId !== filters.departmentId) {
        return false;
      }

      return true;
    });
  }, [events, filters]);

  // Navigate months
  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  const currentMonthLabel = format(currentDate, "MMMM yyyy");
  const todayLabel = format(new Date(), "EEE, d MMM yyyy");

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* View Toggle */}
        <div className="flex gap-2" role="group" aria-label="Calendar view toggle">
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
          >
            List
          </Button>
          <Button
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
            aria-pressed={view === "month"}
            aria-label="Month view"
          >
            Month
          </Button>
        </div>

        {/* Navigation and Search */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Month Navigation */}
          <div className="flex items-center gap-2" role="navigation" aria-label="Month navigation">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span
              className="font-semibold min-w-[140px] text-center"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentMonthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleToday}
              className={cn(isToday(currentDate) && "border-primary")}
              aria-label={`Go to today: ${todayLabel}`}
            >
              Today
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="w-48 pl-9"
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search events"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label={showFilters ? "Hide filters" : "Show filters"}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <CalendarFilters
          filters={filters}
          departments={departments}
          onFiltersChange={setFilters}
        />
      )}

      {/* Calendar View */}
      {view === "list" ? (
        <ListView
          events={filteredEvents}
          currentDate={currentDate}
          onEventClick={handleEventClick}
        />
      ) : (
        <MonthView
          events={filteredEvents}
          currentDate={currentDate}
          onEventClick={handleEventClick}
        />
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
