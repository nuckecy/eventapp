"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Mail, Phone, LucideIcon } from "lucide-react"

export interface DepartmentCardProps {
  name: string
  leadName: string
  email: string
  phone: string
  icon: LucideIcon
  color: "blue" | "purple" | "green" | "orange" | "indigo" | "teal"
}

const colorVariants = {
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950/30",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950/30",
    text: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-500",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950/30",
    text: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-500",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950/30",
    text: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-500",
  },
  indigo: {
    bg: "bg-indigo-100 dark:bg-indigo-950/30",
    text: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-500",
  },
  teal: {
    bg: "bg-teal-100 dark:bg-teal-950/30",
    text: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500",
  },
}

export function DepartmentCard({
  name,
  leadName,
  email,
  phone,
  icon: Icon,
  color,
}: DepartmentCardProps) {
  const variant = colorVariants[color]

  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      <CardContent className="p-6">
        {/* Icon */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className={cn(
              "p-3 rounded-full flex items-center justify-center",
              variant.iconBg
            )}
          >
            <Icon className="w-6 h-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{leadName}</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mt-4">
          {/* Email */}
          <a
            href={`mailto:${email}`}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              "hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm",
              variant.text
            )}
            aria-label={`Email ${leadName} at ${email}`}
          >
            <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="break-all">{email}</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className={cn(
              "flex items-center gap-2 text-sm transition-colors",
              "hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm",
              variant.text
            )}
            aria-label={`Call ${leadName} at ${phone}`}
          >
            <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>{phone}</span>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
