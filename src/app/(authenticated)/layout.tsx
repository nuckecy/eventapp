import { NavBar } from "@/components/navigation/NavBar";
import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

/**
 * Authenticated Layout
 *
 * This layout wraps all authenticated routes and ensures:
 * 1. User is authenticated (redirects to login if not)
 * 2. Displays navigation bar with user session
 * 3. Provides consistent layout for all authenticated pages
 */
export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current user session server-side
  const user = await getCurrentUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar with User Session */}
      <NavBar user={user} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Church Event Management System. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="/contact"
                className="hover:text-foreground transition-colors"
                aria-label="Contact us"
              >
                Contact Us
              </a>
              <span aria-hidden="true">•</span>
              <a
                href="/privacy"
                className="hover:text-foreground transition-colors"
                aria-label="Privacy policy"
              >
                Privacy
              </a>
              <span aria-hidden="true">•</span>
              <a
                href="/terms"
                className="hover:text-foreground transition-colors"
                aria-label="Terms of service"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
