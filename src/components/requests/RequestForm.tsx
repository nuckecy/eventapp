"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { AlertMessage } from "@/components/accessibility"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  createRequestSchema,
  type CreateRequestInput,
  type EventRequest,
} from "@/lib/validators/request"

export interface Department {
  id: string
  name: string
  color?: string
}

export interface RequestFormProps {
  /**
   * Existing request for editing (optional)
   */
  request?: EventRequest
  /**
   * Available departments
   */
  departments: Department[]
  /**
   * Whether the form is in edit mode
   */
  isEdit?: boolean
  /**
   * Callback when form is submitted
   */
  onSubmit: (data: CreateRequestInput, isDraft: boolean) => Promise<void>
  /**
   * Callback when cancel is clicked
   */
  onCancel?: () => void
  /**
   * Current user's default department ID (for leads)
   */
  defaultDepartmentId?: string
}

export function RequestForm({
  request,
  departments,
  isEdit = false,
  onSubmit,
  onCancel,
  defaultDepartmentId,
}: RequestFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDraftSave, setIsDraftSave] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: request
      ? {
          title: request.title,
          eventType: request.eventType,
          departmentId: request.departmentId,
          eventDate: request.eventDate,
          startTime: request.startTime,
          endTime: request.endTime,
          location: request.location,
          description: request.description || "",
          expectedAttendance: request.expectedAttendance,
          budget: request.budget ? Number(request.budget) : undefined,
          specialRequirements: request.specialRequirements || "",
        }
      : {
          title: "",
          eventType: "local",
          departmentId: defaultDepartmentId || "",
          eventDate: new Date(),
          startTime: "09:00",
          endTime: "17:00",
          location: "",
          description: "",
          expectedAttendance: undefined,
          budget: undefined,
          specialRequirements: "",
        },
  })

  const handleFormSubmit = async (data: CreateRequestInput, isDraft: boolean) => {
    try {
      setIsSubmitting(true)
      setIsDraftSave(isDraft)
      setFormError(null)
      await onSubmit(data, isDraft)
    } catch (error) {
      console.error("Form submission error:", error)
      setFormError("Failed to submit the form. Please check your entries and try again.")
    } finally {
      setIsSubmitting(false)
      setIsDraftSave(false)
    }
  }

  const handleSaveDraft = () => {
    // For draft, we don't validate the form strictly
    const values = form.getValues()
    handleFormSubmit(values, true)
  }

  const handleSubmitForReview = form.handleSubmit((data) => {
    handleFormSubmit(data, false)
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Event Request" : "Create Event Request"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update the event details below"
            : "Fill in the details for your event request"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* WCAG 4.1.3 & 3.3.1: Announce form errors to screen readers */}
        {formError && (
          <AlertMessage className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive rounded-md">
            {formError}
          </AlertMessage>
        )}

        {Object.keys(form.formState.errors).length > 0 && (
          <AlertMessage className="mb-4 p-3 bg-destructive/10 text-destructive border border-destructive rounded-md">
            Please fix the errors below before submitting.
          </AlertMessage>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmitForReview} className="space-y-6" noValidate>
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Youth Conference 2025"
                      {...field}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive title for your event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Type and Department - Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Event Type */}
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      aria-required="true"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sunday">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-teal-500" />
                            <span>Sunday Events</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="regional">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-purple-500" />
                            <span>Regional Events</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="local">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500" />
                            <span>Local Events</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Department */}
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      aria-required="true"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date and Time - Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Event Date */}
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Event Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            aria-required="true"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Fellowship Hall, Main Sanctuary"
                      {...field}
                      aria-required="true"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of the event..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Provide additional details about the event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expected Attendance and Budget - Row */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Expected Attendance */}
              <FormField
                control={form.control}
                name="expectedAttendance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Attendance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value, 10) : undefined)
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated number of attendees
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget */}
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 5000.00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseFloat(value) : undefined)
                        }}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimated budget in your local currency
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Special Requirements */}
            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Audio/visual equipment, catering, parking arrangements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Any special requirements or notes
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isDraftSave && isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save as Draft"
                )}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {!isDraftSave && isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Review"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
