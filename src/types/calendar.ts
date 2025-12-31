export type EventType = "sunday" | "regional" | "local";

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: EventType;
  departmentId: string;
  departmentName?: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  expectedAttendance?: number;
}

export interface CalendarFilters {
  search: string;
  eventTypes: EventType[];
  departmentId: string | null;
}

export type ViewMode = "list" | "month";
