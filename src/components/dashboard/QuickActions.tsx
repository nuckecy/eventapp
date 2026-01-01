"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Users } from "lucide-react"

export interface QuickActionsProps {
  onCreateActivity?: () => void
  onCreateEvent?: () => void
  className?: string
}

export function QuickActions({
  onCreateActivity,
  onCreateEvent,
  className,
}: QuickActionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)} role="group" aria-label="Quick actions">
      {onCreateActivity && (
        <Button
          onClick={onCreateActivity}
          className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
          size="lg"
          aria-label="Create a new activity request"
        >
          <Users className="w-5 h-5" aria-hidden="true" />
          Create Activity Request
        </Button>
      )}
      {onCreateEvent && (
        <Button
          onClick={onCreateEvent}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          size="lg"
          aria-label="Create a new event request"
        >
          <Calendar className="w-5 h-5" aria-hidden="true" />
          Create Event Request
        </Button>
      )}
    </div>
  )
}
