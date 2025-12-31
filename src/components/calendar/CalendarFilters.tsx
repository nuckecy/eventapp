"use client";

import { CalendarFilters as FilterType, EventType } from "@/types/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
  filters: FilterType;
  departments?: { id: string; name: string }[];
  onFiltersChange: (filters: FilterType) => void;
}

// WCAG 1.4.1: Use of Color - Color is not the only visual means of conveying information
const eventTypeOptions: { value: EventType; label: string; color: string; icon: string }[] = [
  { value: "sunday", label: "Sunday Events", color: "bg-teal-500", icon: "⛪" },
  { value: "regional", label: "Regional Events", color: "bg-purple-500", icon: "🌍" },
  { value: "local", label: "Local Events", color: "bg-blue-500", icon: "📍" },
];

export function CalendarFilters({
  filters,
  departments = [],
  onFiltersChange,
}: CalendarFiltersProps) {
  const handleEventTypeToggle = (type: EventType) => {
    const newEventTypes = filters.eventTypes.includes(type)
      ? filters.eventTypes.filter((t) => t !== type)
      : [...filters.eventTypes, type];

    onFiltersChange({ ...filters, eventTypes: newEventTypes });
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    onFiltersChange({ ...filters, departmentId });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: "",
      eventTypes: ["sunday", "regional", "local"],
      departmentId: null,
    });
  };

  const hasActiveFilters =
    filters.eventTypes.length < 3 || filters.departmentId !== null || filters.search !== "";

  return (
    <div
      className="bg-muted/30 border rounded-lg pt-6 pb-4 px-4"
      role="region"
      aria-label="Event filters"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Event Types */}
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-3">Event Types</h3>
          <div className="grid grid-cols-2 gap-3">
            {eventTypeOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors",
                  "hover:bg-muted focus-within:ring-2 focus-within:ring-ring",
                  filters.eventTypes.includes(option.value)
                    ? "bg-background border-primary"
                    : "bg-background/50"
                )}
              >
                <input
                  type="checkbox"
                  checked={filters.eventTypes.includes(option.value)}
                  onChange={() => handleEventTypeToggle(option.value)}
                  className="sr-only"
                  aria-label={option.label}
                />
                <div
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                    filters.eventTypes.includes(option.value)
                      ? "bg-primary border-primary"
                      : "border-muted-foreground"
                  )}
                  aria-hidden="true"
                >
                  {filters.eventTypes.includes(option.value) && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  {/* WCAG 1.4.1: Icon + color + text ensures accessibility */}
                  <span className="text-base" role="img" aria-label={`${option.label} icon`}>
                    {option.icon}
                  </span>
                  <div className={cn(option.color, "w-3 h-3 rounded-full")} aria-hidden="true" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Right Side: Department and Clear */}
        <div className="lg:w-64 space-y-4">
          {/* Department Filter */}
          <div>
            <label htmlFor="department-filter" className="text-sm font-medium block mb-2">
              Department
            </label>
            <select
              id="department-filter"
              value={filters.departmentId || ""}
              onChange={(e) => handleDepartmentChange(e.target.value || null)}
              className={cn(
                "w-full px-3 py-2 rounded-md border border-input bg-background",
                "focus:outline-none focus:ring-2 focus:ring-ring",
                "text-sm"
              )}
              aria-label="Filter by department"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="w-full"
            aria-label="Clear all filters"
          >
            Clear Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
