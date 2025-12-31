/**
 * Dashboard Components
 *
 * This module exports all dashboard-related components for the
 * Church Event Management System.
 */

export { StatCard, type StatCardProps } from "./StatCard"
export {
  StatusBadge,
  getStatusLabel,
  getAllStatuses,
  type StatusBadgeProps,
  type RequestStatus,
} from "./StatusBadge"
export {
  RequestsTable,
  type RequestsTableProps,
  type EventRequest,
} from "./RequestsTable"
export { QuickActions, type QuickActionsProps } from "./QuickActions"
