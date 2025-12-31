"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps {
  label: string
  value: number | string
  color?: "default" | "warning" | "success" | "error"
  icon?: LucideIcon
  onClick?: () => void
}

const colorVariants = {
  default: {
    text: "text-foreground",
    bg: "bg-background",
    hover: "hover:bg-muted/50",
  },
  warning: {
    text: "text-yellow-600",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    hover: "hover:bg-yellow-100 dark:hover:bg-yellow-950/30",
  },
  success: {
    text: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/20",
    hover: "hover:bg-green-100 dark:hover:bg-green-950/30",
  },
  error: {
    text: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/20",
    hover: "hover:bg-red-100 dark:hover:bg-red-950/30",
  },
}

export function StatCard({
  label,
  value,
  color = "default",
  icon: Icon,
  onClick,
}: StatCardProps) {
  const variant = colorVariants[color]
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        variant.bg,
        isClickable && [
          "cursor-pointer",
          variant.hover,
          "hover:shadow-md",
          "active:scale-[0.98]",
        ]
      )}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      aria-label={isClickable ? `${label}: ${value}. Click to view details` : undefined}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "text-3xl font-bold mt-2 tabular-nums",
                variant.text
              )}
            >
              {value}
            </p>
          </div>
          {Icon && (
            <div className={cn("p-2 rounded-lg", variant.bg)}>
              <Icon
                className={cn("w-5 h-5", variant.text)}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
