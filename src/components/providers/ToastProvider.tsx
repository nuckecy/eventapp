"use client"

import { Toaster } from "@/components/ui/toaster"

/**
 * Toast Provider Component
 *
 * This component provides toast notification functionality throughout the app.
 * It uses the Shadcn UI Toaster component to display notifications.
 *
 * Features:
 * - Success notifications (green)
 * - Error notifications (red)
 * - Warning notifications (yellow)
 * - Info notifications (blue)
 * - Auto-dismiss after configurable duration
 * - Manual dismiss option
 * - Responsive design
 *
 * Usage:
 * 1. Wrap your app with this provider (usually in root layout)
 * 2. Use the `useToast` hook from "@/hooks/use-toast" to show toasts
 *
 * Example:
 * ```tsx
 * import { useToast } from "@/hooks/use-toast"
 *
 * function MyComponent() {
 *   const { toast } = useToast()
 *
 *   const handleClick = () => {
 *     toast({
 *       title: "Success!",
 *       description: "Your changes have been saved.",
 *       variant: "default", // or "destructive"
 *     })
 *   }
 *
 *   return <button onClick={handleClick}>Save</button>
 * }
 * ```
 */

export function ToastProvider() {
  return <Toaster />
}
