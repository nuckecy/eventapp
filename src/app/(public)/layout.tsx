import { NavBar } from "@/components/navigation/NavBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <NavBar user={null} />

      {/* Main Content - WCAG 2.4.1: Skip link target */}
      <main id="main-content" className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
