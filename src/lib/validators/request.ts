import { z } from "zod"

/**
 * Event Type enum schema
 */
export const eventTypeSchema = z.enum(["sunday", "regional", "local"], {
  required_error: "Event type is required",
  invalid_type_error: "Invalid event type",
})

/**
 * Request Status enum schema
 */
export const requestStatusSchema = z.enum([
  "draft",
  "submitted",
  "under_review",
  "ready_for_approval",
  "approved",
  "returned",
  "deleted",
])

/**
 * Base event request schema with all fields
 */
const baseRequestSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters"),

  eventType: eventTypeSchema,

  departmentId: z
    .string({ required_error: "Department is required" })
    .uuid("Invalid department ID"),

  eventDate: z.coerce.date({
    required_error: "Event date is required",
    invalid_type_error: "Invalid date format",
  }),

  startTime: z
    .string({ required_error: "Start time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

  endTime: z
    .string({ required_error: "End time is required" })
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),

  location: z
    .string({ required_error: "Location is required" })
    .min(2, "Location must be at least 2 characters")
    .max(255, "Location must not exceed 255 characters"),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),

  expectedAttendance: z
    .number({
      invalid_type_error: "Expected attendance must be a number",
    })
    .int("Expected attendance must be a whole number")
    .positive("Expected attendance must be positive")
    .optional(),

  budget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .nonnegative("Budget cannot be negative")
    .optional(),

  specialRequirements: z
    .string()
    .max(1000, "Special requirements must not exceed 1000 characters")
    .optional(),
})

/**
 * Schema for creating a new event request
 * Includes validation for time constraints
 */
export const createRequestSchema = baseRequestSchema
  .refine(
    (data) => {
      // Validate that event date is not in the past
      const eventDate = new Date(data.eventDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return eventDate >= today
    },
    {
      message: "Event date cannot be in the past",
      path: ["eventDate"],
    }
  )
  .refine(
    (data) => {
      // Validate that end time is after start time
      const [startHour, startMin] = data.startTime.split(":").map(Number)
      const [endHour, endMin] = data.endTime.split(":").map(Number)
      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      return endMinutes > startMinutes
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )

/**
 * Schema for updating an existing event request
 * All fields are optional for partial updates
 */
export const updateRequestSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must not exceed 255 characters")
    .optional(),

  eventType: eventTypeSchema.optional(),

  departmentId: z.string().uuid("Invalid department ID").optional(),

  eventDate: z.coerce.date({
    invalid_type_error: "Invalid date format",
  }).optional(),

  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),

  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(255, "Location must not exceed 255 characters")
    .optional(),

  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional(),

  expectedAttendance: z
    .number({
      invalid_type_error: "Expected attendance must be a number",
    })
    .int("Expected attendance must be a whole number")
    .positive("Expected attendance must be positive")
    .optional(),

  budget: z
    .number({ invalid_type_error: "Budget must be a number" })
    .nonnegative("Budget cannot be negative")
    .optional(),

  specialRequirements: z
    .string()
    .max(1000, "Special requirements must not exceed 1000 characters")
    .optional(),
})

/**
 * Schema for returning a request with feedback
 */
export const returnRequestSchema = z.object({
  feedback: z
    .string({ required_error: "Feedback is required" })
    .min(10, "Feedback must be at least 10 characters")
    .max(1000, "Feedback must not exceed 1000 characters"),
})

/**
 * Schema for deleting a request (Super Admin only)
 */
export const deleteRequestSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must not exceed 500 characters")
    .optional(),
})

/**
 * TypeScript types inferred from schemas
 */
export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>
export type ReturnRequestInput = z.infer<typeof returnRequestSchema>
export type DeleteRequestInput = z.infer<typeof deleteRequestSchema>
export type EventType = z.infer<typeof eventTypeSchema>
export type RequestStatus = z.infer<typeof requestStatusSchema>

/**
 * Full event request type (from database)
 */
export interface EventRequest extends CreateRequestInput {
  id: string
  requestNumber: string
  creatorId: string
  status: RequestStatus
  adminId?: string | null
  submittedAt?: Date | null
  reviewedAt?: Date | null
  approvedAt?: Date | null
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Event request with relations
 */
export interface EventRequestWithRelations extends EventRequest {
  department?: {
    id: string
    name: string
    color?: string
  }
  creator?: {
    id: string
    name: string
    email: string
  }
  admin?: {
    id: string
    name: string
    email: string
  } | null
  feedback?: Array<{
    id: string
    userId: string
    userRole: string
    action: string
    feedback: string | null
    createdAt: Date
  }>
  changes?: Array<{
    id: string
    userId: string
    fieldName: string
    oldValue: string | null
    newValue: string | null
    createdAt: Date
  }>
}
