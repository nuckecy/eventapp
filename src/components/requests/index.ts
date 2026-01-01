/**
 * Request Components
 *
 * This module exports all components related to event request management,
 * including forms, details views, actions, and audit trails.
 */

// Form Component
export { RequestForm } from "./RequestForm"
export type { RequestFormProps, Department } from "./RequestForm"

// Details Component
export { RequestDetails } from "./RequestDetails"
export type { RequestDetailsProps } from "./RequestDetails"

// Actions Component
export { RequestActions } from "./RequestActions"
export type { RequestActionsProps, UserRole } from "./RequestActions"

// Feedback and Delete Dialogs
export { FeedbackDialog, DeleteDialog } from "./FeedbackDialog"
export type {
  FeedbackDialogProps,
  DeleteDialogProps,
} from "./FeedbackDialog"

// Audit Trail Component
export { AuditTrail } from "./AuditTrail"
export type { AuditTrailProps, AuditEntry } from "./AuditTrail"
