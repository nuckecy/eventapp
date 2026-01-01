"use client";

import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink - WCAG 2.4.1 Bypass Blocks (Level A)
 *
 * Provides a "Skip to main content" link that's visually hidden until focused.
 * This allows keyboard users to bypass repetitive navigation and jump directly
 * to the main content area.
 *
 * @example
 * ```tsx
 * <SkipLink href="#main-content">
 *   Skip to main content
 * </SkipLink>
 * ```
 */
export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Position off-screen by default
        "absolute left-0 top-0 z-[100]",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "font-medium text-sm",
        // Transform off-screen
        "-translate-y-full",
        // Focus styles - bring on screen
        "focus:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Smooth transition
        "transition-transform duration-200",
        className
      )}
    >
      {children}
    </a>
  );
}
