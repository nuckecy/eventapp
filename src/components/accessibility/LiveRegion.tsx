"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface LiveRegionProps {
  children: React.ReactNode;
  /**
   * The politeness level of the live region
   * - "polite": Announces when user is idle (default)
   * - "assertive": Interrupts user immediately
   * - "off": Disables announcements
   */
  politeness?: "polite" | "assertive" | "off";
  /**
   * Whether the entire region should be announced or just changes
   */
  atomic?: boolean;
  /**
   * Whether changes should be announced
   */
  relevant?: "additions" | "removals" | "text" | "all";
  className?: string;
  /**
   * If true, the content is visually hidden (sr-only)
   */
  visuallyHidden?: boolean;
}

/**
 * LiveRegion - Dynamic Content Announcements for Screen Readers
 *
 * Creates an ARIA live region that announces dynamic content changes to screen readers.
 * Use for status messages, loading states, form validation, and other dynamic updates.
 *
 * WCAG 2.1 AA Compliance:
 * - 4.1.3 Status Messages (Level AA)
 * - Helps with 3.3.1 Error Identification (Level A)
 *
 * @example
 * ```tsx
 * // Status message (visually hidden)
 * <LiveRegion politeness="polite" visuallyHidden>
 *   {statusMessage}
 * </LiveRegion>
 *
 * // Error message (visible)
 * <LiveRegion politeness="assertive" className="text-red-600">
 *   {errorMessage}
 * </LiveRegion>
 * ```
 */
export function LiveRegion({
  children,
  politeness = "polite",
  atomic = false,
  relevant = "additions text",
  className,
  visuallyHidden = false,
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Force screen readers to re-read the content when it changes
    // This is a workaround for screen readers that don't always
    // announce changes in live regions
    if (regionRef.current && children) {
      const region = regionRef.current;
      const currentContent = region.textContent;

      // Temporarily clear and restore content to trigger announcement
      region.textContent = "";
      setTimeout(() => {
        region.textContent = currentContent;
      }, 100);
    }
  }, [children]);

  return (
    <div
      ref={regionRef}
      role={politeness === "assertive" ? "alert" : "status"}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn(
        visuallyHidden && "sr-only",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * StatusMessage - Convenience component for polite status announcements
 */
export function StatusMessage({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <LiveRegion
      politeness="polite"
      visuallyHidden
      className={className}
    >
      {children}
    </LiveRegion>
  );
}

/**
 * AlertMessage - Convenience component for assertive error/warning announcements
 */
export function AlertMessage({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string
}) {
  return (
    <LiveRegion
      politeness="assertive"
      className={className}
    >
      {children}
    </LiveRegion>
  );
}
