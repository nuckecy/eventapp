import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * VisuallyHidden - Screen Reader Only Text
 *
 * Hides content visually while keeping it accessible to screen readers.
 * Uses the sr-only Tailwind utility which implements best practices for
 * visually hidden but screen reader accessible content.
 *
 * WCAG 2.1 AA Compliance:
 * - 1.1.1 Non-text Content (Level A)
 * - 1.3.1 Info and Relationships (Level A)
 * - 4.1.2 Name, Role, Value (Level A)
 *
 * @example
 * ```tsx
 * <button>
 *   <SearchIcon />
 *   <VisuallyHidden>Search</VisuallyHidden>
 * </button>
 * ```
 */
export function VisuallyHidden({
  children,
  className,
  as: Component = "span"
}: VisuallyHiddenProps) {
  return (
    <Component className={cn("sr-only", className)}>
      {children}
    </Component>
  );
}
