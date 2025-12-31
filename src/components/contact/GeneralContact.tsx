"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface GeneralContactProps {
  email?: string
  phone?: string
  address?: string
  officeHours?: string[]
}

export function GeneralContact({
  email = "info@church.com",
  phone = "+234 800 000 0000",
  address = "123 Church Street, Lagos, Nigeria",
  officeHours = [
    "Monday - Friday: 9:00 AM - 5:00 PM",
    "Saturday: 10:00 AM - 2:00 PM",
    "Sunday: Closed (Worship Services)",
  ],
}: GeneralContactProps) {
  return (
    <div className="space-y-6">
      {/* General Inquiries Section */}
      <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">General Inquiries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Email
              </p>
              <a
                href={`mailto:${email}`}
                className={cn(
                  "text-base text-foreground transition-colors",
                  "hover:text-primary hover:underline",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                )}
                aria-label={`Email us at ${email}`}
              >
                {email}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Phone
              </p>
              <a
                href={`tel:${phone}`}
                className={cn(
                  "text-base text-foreground transition-colors",
                  "hover:text-primary hover:underline",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                )}
                aria-label={`Call us at ${phone}`}
              >
                {phone}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Address
              </p>
              <p className="text-base text-foreground">{address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Hours Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted flex-shrink-0">
              <Clock className="w-5 h-5 text-foreground" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">Office Hours</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2" role="list">
            {officeHours.map((hours, index) => (
              <li key={index} className="text-base text-muted-foreground">
                {hours}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
