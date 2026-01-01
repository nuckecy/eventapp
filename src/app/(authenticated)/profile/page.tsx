"use client"

import * as React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Mail, Shield, Building2, Key, Bell, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

/**
 * User Profile Page
 *
 * Displays and manages user profile information:
 * - Basic user information (read-only)
 * - Change password form (placeholder)
 * - Notification preferences (placeholder)
 *
 * Features:
 * - Displays current user details from session
 * - Role badge with appropriate styling
 * - Department information (for leads)
 * - Placeholder forms for future features
 * - Mobile responsive layout
 */
export default function ProfilePage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Notification preferences state (placeholder)
  const [notifications, setNotifications] = useState({
    emailOnSubmit: true,
    emailOnReview: true,
    emailOnApproval: true,
    emailOnReturn: true,
    emailWeeklySummary: false,
  })

  // Handle password change (placeholder)
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    // Placeholder implementation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Feature coming soon",
      description: "Password change functionality will be available in a future update.",
    })

    setIsChangingPassword(false)
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  // Handle notification preference change (placeholder)
  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }))

    toast({
      title: "Preference updated",
      description: "Your notification preferences will be saved in a future update.",
    })
  }

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "superadmin":
        return "default"
      case "admin":
        return "secondary"
      case "lead":
        return "outline"
      default:
        return "outline"
    }
  }

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "superadmin":
        return "Super Administrator"
      case "admin":
        return "Administrator"
      case "lead":
        return "Department Lead"
      case "member":
        return "Member"
      default:
        return role
    }
  }

  // Show loading skeleton
  if (status === "loading") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* User Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Your account details and role information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="flex items-start gap-3">
              <User className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            </div>

            <Separator />

            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium">Email Address</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator />

            {/* Role */}
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <div className="flex-1 space-y-1">
                <Label className="text-sm font-medium">Role</Label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Department (for leads) */}
            {user.role === "lead" && user.departmentId && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <div className="flex-1 space-y-1">
                    <Label className="text-sm font-medium">Department</Label>
                    <p className="text-sm text-muted-foreground">
                      Department ID: {user.departmentId}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" aria-hidden="true" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  required
                  minLength={8}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Notification Preferences Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" aria-hidden="true" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive notifications about your requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email on Submit */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnSubmit" className="text-base">
                  Request Submitted
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when a request is submitted
                </p>
              </div>
              <Switch
                id="emailOnSubmit"
                checked={notifications.emailOnSubmit}
                onCheckedChange={(checked) => handleNotificationChange("emailOnSubmit", checked)}
              />
            </div>

            <Separator />

            {/* Email on Review */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnReview" className="text-base">
                  Under Review
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when a request is being reviewed
                </p>
              </div>
              <Switch
                id="emailOnReview"
                checked={notifications.emailOnReview}
                onCheckedChange={(checked) => handleNotificationChange("emailOnReview", checked)}
              />
            </div>

            <Separator />

            {/* Email on Approval */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnApproval" className="text-base">
                  Request Approved
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when a request is approved
                </p>
              </div>
              <Switch
                id="emailOnApproval"
                checked={notifications.emailOnApproval}
                onCheckedChange={(checked) => handleNotificationChange("emailOnApproval", checked)}
              />
            </div>

            <Separator />

            {/* Email on Return */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailOnReturn" className="text-base">
                  Request Returned
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when a request is returned with feedback
                </p>
              </div>
              <Switch
                id="emailOnReturn"
                checked={notifications.emailOnReturn}
                onCheckedChange={(checked) => handleNotificationChange("emailOnReturn", checked)}
              />
            </div>

            <Separator />

            {/* Weekly Summary */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailWeeklySummary" className="text-base">
                  Weekly Summary
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive weekly summary of all your requests
                </p>
              </div>
              <Switch
                id="emailWeeklySummary"
                checked={notifications.emailWeeklySummary}
                onCheckedChange={(checked) =>
                  handleNotificationChange("emailWeeklySummary", checked)
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
