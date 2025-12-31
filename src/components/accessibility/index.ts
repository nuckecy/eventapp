/**
 * Accessibility Components
 *
 * A collection of reusable accessibility-focused components that help
 * meet WCAG 2.1 AA compliance standards.
 *
 * Components:
 * - SkipLink: Skip to main content (WCAG 2.4.1)
 * - VisuallyHidden: Screen reader only text (WCAG 1.1.1, 4.1.2)
 * - LiveRegion: Dynamic content announcements (WCAG 4.1.3)
 * - FocusTrap: Trap focus for modals (WCAG 2.1.2, 2.4.3)
 */

export { SkipLink } from "./SkipLink";
export { VisuallyHidden } from "./VisuallyHidden";
export {
  LiveRegion,
  StatusMessage,
  AlertMessage
} from "./LiveRegion";
export { FocusTrap } from "./FocusTrap";
