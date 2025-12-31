import { Metadata } from "next";
import { CalendarView } from "@/components/calendar/CalendarView";
import { mockEvents, mockDepartments } from "@/lib/mock-data";

// WCAG 2.4.2: Page titled - Provides descriptive page title
export const metadata: Metadata = {
  title: "Church Events Calendar | Church Event Management System",
  description: "Discover upcoming church events and activities. View our complete calendar of services, meetings, and community events.",
};

export default function PublicCalendarPage() {
  // In the future, this will fetch from API
  // const events = await fetch('/api/events').then(res => res.json())
  // const departments = await fetch('/api/departments').then(res => res.json())

  // For now, using mock data
  const events = mockEvents;
  const departments = mockDepartments.map(dept => ({
    id: dept.id,
    name: dept.name,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Church Events Calendar</h1>
        <p className="text-muted-foreground">
          Discover upcoming events and activities in our church community.
          For event submissions, please{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact your department lead
          </a>
          .
        </p>
      </div>

      {/* Calendar View */}
      <CalendarView events={events} departments={departments} />
    </div>
  );
}
