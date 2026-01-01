import * as React from "react"
import Link from "next/link"
import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { DepartmentGrid, GeneralContact } from "@/components/contact"
import { ArrowLeft, Users, Heart, Music, Handshake, Cross, UserCheck } from "lucide-react"

// WCAG 2.4.2: Page titled - Provides descriptive page title
export const metadata: Metadata = {
  title: "Contact Us | Church Event Management System",
  description: "Contact our department leads to submit event requests or reach out for general inquiries about church activities.",
};

export default function ContactPage() {
  const departments = [
    {
      name: "Youth Ministry",
      leadName: "Otobong Okoko",
      email: "otobong.okoko@church.com",
      phone: "+234 801 234 5678",
      icon: Users,
      color: "blue" as const,
    },
    {
      name: "Women's Fellowship",
      leadName: "Sister Mary Johnson",
      email: "mary.johnson@church.com",
      phone: "+234 802 345 6789",
      icon: Heart,
      color: "purple" as const,
    },
    {
      name: "Worship Team",
      leadName: "Pastor John Emmanuel",
      email: "john.emmanuel@church.com",
      phone: "+234 803 456 7890",
      icon: Music,
      color: "green" as const,
    },
    {
      name: "Community Outreach",
      leadName: "Brother David Thompson",
      email: "david.thompson@church.com",
      phone: "+234 804 567 8901",
      icon: Handshake,
      color: "orange" as const,
    },
    {
      name: "Prayer Team",
      leadName: "Sister Grace Obi",
      email: "grace.obi@church.com",
      phone: "+234 805 678 9012",
      icon: Cross,
      color: "indigo" as const,
    },
    {
      name: "Senior Ministry",
      leadName: "Elder Peter Adeyemi",
      email: "peter.adeyemi@church.com",
      phone: "+234 806 789 0123",
      icon: UserCheck,
      color: "teal" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Calendar Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Back to Calendar</span>
            </Link>
          </Button>
        </div>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Need to submit an event request or have questions about upcoming
            activities? Reach out to the relevant department lead below. For
            general inquiries, use our main office contact information.
          </p>
        </div>

        {/* Department Leads Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Department Leads
            </h2>
            <p className="text-muted-foreground">
              Contact the appropriate department lead to discuss your event request
            </p>
          </div>
          <DepartmentGrid departments={departments} />
        </section>

        {/* General Contact Information */}
        <section>
          <div className="max-w-2xl">
            <GeneralContact
              email="info@church.com"
              phone="+234 800 000 0000"
              address="123 Church Street, Lagos, Nigeria"
              officeHours={[
                "Monday - Friday: 9:00 AM - 5:00 PM",
                "Saturday: 10:00 AM - 2:00 PM",
                "Sunday: Closed (Worship Services)",
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
