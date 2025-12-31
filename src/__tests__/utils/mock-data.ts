import { CalendarEvent, EventType } from '@/types/calendar'

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Sunday Service',
    date: '2024-03-10',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Main Sanctuary',
    eventType: 'sunday' as EventType,
    departmentName: 'Worship',
    description: 'Regular Sunday morning service',
  },
  {
    id: '2',
    title: 'Regional Conference',
    date: '2024-03-15',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    location: 'Conference Center',
    eventType: 'regional' as EventType,
    departmentName: 'Administration',
    description: 'Annual regional conference',
  },
  {
    id: '3',
    title: 'Youth Group Meeting',
    date: '2024-03-20',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    location: 'Youth Hall',
    eventType: 'local' as EventType,
    departmentName: 'Youth Ministry',
    description: 'Weekly youth group meeting',
  },
]

export const mockRequest = {
  id: '1',
  eventName: 'Easter Service',
  eventDate: '2024-04-01',
  startTime: '09:00',
  endTime: '11:00',
  location: 'Main Sanctuary',
  estimatedAttendance: 500,
  description: 'Easter Sunday celebration',
  status: 'draft' as const,
  departmentId: '1',
  createdBy: 'user1',
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01'),
}

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'LEAD' as const,
  departmentId: '1',
}

export const mockAdmin = {
  id: '2',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'ADMIN' as const,
  departmentId: '1',
}

export const mockSuperAdmin = {
  id: '3',
  name: 'Super Admin',
  email: 'superadmin@example.com',
  role: 'SUPER_ADMIN' as const,
  departmentId: null,
}

export const mockDepartment = {
  id: '1',
  name: 'Worship',
  description: 'Worship department',
  contactEmail: 'worship@example.com',
  contactPhone: '555-0100',
  isActive: true,
}

export const mockNotification = {
  id: '1',
  userId: '1',
  title: 'Request Approved',
  message: 'Your request has been approved',
  type: 'info' as const,
  isRead: false,
  createdAt: new Date('2024-03-01'),
}

export const mockAuditLog = {
  id: '1',
  requestId: '1',
  userId: '1',
  action: 'CREATED' as const,
  details: 'Request created',
  createdAt: new Date('2024-03-01'),
}

export const mockFeedback = {
  id: '1',
  requestId: '1',
  userId: '2',
  feedback: 'Please add more details about the event setup',
  createdAt: new Date('2024-03-01'),
}
