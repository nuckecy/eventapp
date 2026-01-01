"use client";

import { useEffect, useRef, ReactNode } from "react";

interface FocusTrapProps {
  /**
   * The content to trap focus within
   */
  children: ReactNode;
  /**
   * Whether the focus trap is active
   */
  active?: boolean;
  /**
   * Initial element to focus (defaults to first focusable element)
   */
  initialFocus?: HTMLElement | null;
  /**
   * Callback when escape key is pressed
   */
  onEscape?: () => void;
  /**
   * Additional class name for the wrapper
   */
  className?: string;
}

// Query selector for all focusable elements
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
].join(',');

/**
 * FocusTrap - Trap keyboard focus within a container
 *
 * Ensures that keyboard navigation (Tab/Shift+Tab) stays within a specific
 * container, typically used for modals and dialogs.
 *
 * WCAG 2.1 AA Compliance:
 * - 2.1.2 No Keyboard Trap (Level A) - Provides escape mechanism
 * - 2.4.3 Focus Order (Level A) - Maintains logical focus order
 * - Supports modal dialogs (ARIA best practices)
 *
 * @example
 * ```tsx
 * <FocusTrap active={isModalOpen} onEscape={closeModal}>
 *   <div role="dialog">
 *     <h2>Modal Title</h2>
 *     <button>Action</button>
 *     <button onClick={closeModal}>Close</button>
 *   </div>
 * </FocusTrap>
 * ```
 */
export function FocusTrap({
  children,
  active = true,
  initialFocus,
  onEscape,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;

    // Store the currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
      ).filter((el) => {
        // Additional check: element must be visible
        return el.offsetParent !== null;
      });
    };

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocus) {
      initialFocus.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle escape key
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Only trap Tab key
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift + Tab: Move backwards
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: Move forwards
      else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Attach event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup: Restore focus to previous element
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, initialFocus, onEscape]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
