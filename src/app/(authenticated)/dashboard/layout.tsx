/**
 * Dashboard Layout
 *
 * This layout provides a consistent structure for all dashboard pages
 * including Lead, Admin, and Super Admin dashboards.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Dashboard Container with proper padding and spacing */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
