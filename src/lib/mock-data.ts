import { CalendarEvent } from "@/types/calendar";

export interface Department {
  id: string;
  name: string;
  icon: string;
  color: string;
  leadName: string;
  leadEmail: string;
  leadPhone: string;
}

export const mockDepartments: Department[] = [
  {
    id: "dept-001",
    name: "Youth Ministry",
    icon: "Users",
    color: "blue",
    leadName: "Otobong Okoko",
    leadEmail: "otobong.okoko@church.com",
    leadPhone: "+234 801 234 5678",
  },
  {
    id: "dept-002",
    name: "Women's Fellowship",
    icon: "Heart",
    color: "purple",
    leadName: "Sister Mary Johnson",
    leadEmail: "mary.johnson@church.com",
    leadPhone: "+234 802 345 6789",
  },
  {
    id: "dept-003",
    name: "Worship Team",
    icon: "Music",
    color: "green",
    leadName: "Pastor John Emmanuel",
    leadEmail: "john.emmanuel@church.com",
    leadPhone: "+234 803 456 7890",
  },
  {
    id: "dept-004",
    name: "Community Outreach",
    icon: "HandHeart",
    color: "orange",
    leadName: "Brother David Thompson",
    leadEmail: "david.thompson@church.com",
    leadPhone: "+234 804 567 8901",
  },
  {
    id: "dept-005",
    name: "Prayer Team",
    icon: "Sparkles",
    color: "indigo",
    leadName: "Sister Grace Obi",
    leadEmail: "grace.obi@church.com",
    leadPhone: "+234 805 678 9012",
  },
  {
    id: "dept-006",
    name: "Senior Ministry",
    icon: "Users",
    color: "teal",
    leadName: "Elder Peter Adeyemi",
    leadEmail: "peter.adeyemi@church.com",
    leadPhone: "+234 806 789 0123",
  },
];

// Helper function to create dates for current and next month
const createDate = (daysFromNow: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

export const mockEvents: CalendarEvent[] = [
  // Current Month Events
  {
    id: "evt-001",
    title: "Sunday Worship Service",
    eventType: "sunday",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(0), // Today
    startTime: "09:00",
    endTime: "11:30",
    location: "Main Sanctuary",
    description: "Join us for our weekly worship service with praise, worship, and the Word.",
    expectedAttendance: 500,
  },
  {
    id: "evt-002",
    title: "Youth Conference 2025",
    eventType: "local",
    departmentId: "dept-001",
    departmentName: "Youth Ministry",
    eventDate: createDate(3),
    startTime: "15:00",
    endTime: "20:00",
    location: "Fellowship Hall",
    description: "An inspiring conference for young people with dynamic speakers and worship.",
    expectedAttendance: 150,
  },
  {
    id: "evt-003",
    title: "Women's Prayer Breakfast",
    eventType: "local",
    departmentId: "dept-002",
    departmentName: "Women's Fellowship",
    eventDate: createDate(5),
    startTime: "08:00",
    endTime: "10:00",
    location: "Church Hall",
    description: "Monthly prayer breakfast for all women in the church community.",
    expectedAttendance: 80,
  },
  {
    id: "evt-004",
    title: "Sunday Worship Service",
    eventType: "sunday",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(7),
    startTime: "09:00",
    endTime: "11:30",
    location: "Main Sanctuary",
    description: "Weekly worship service with Holy Communion.",
    expectedAttendance: 550,
  },
  {
    id: "evt-005",
    title: "Community Outreach - Food Drive",
    eventType: "local",
    departmentId: "dept-004",
    departmentName: "Community Outreach",
    eventDate: createDate(10),
    startTime: "10:00",
    endTime: "14:00",
    location: "Community Center",
    description: "Monthly food distribution program for families in need.",
    expectedAttendance: 200,
  },
  {
    id: "evt-006",
    title: "Regional Pastors Conference",
    eventType: "regional",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(12),
    startTime: "09:00",
    endTime: "17:00",
    location: "Conference Center",
    description: "Quarterly meeting for all regional church leaders and pastors.",
    expectedAttendance: 300,
  },
  {
    id: "evt-007",
    title: "Sunday Worship Service",
    eventType: "sunday",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(14),
    startTime: "09:00",
    endTime: "11:30",
    location: "Main Sanctuary",
    description: "Join us for worship and fellowship.",
    expectedAttendance: 520,
  },
  {
    id: "evt-008",
    title: "Prayer Night Vigil",
    eventType: "local",
    departmentId: "dept-005",
    departmentName: "Prayer Team",
    eventDate: createDate(17),
    startTime: "20:00",
    endTime: "23:00",
    location: "Prayer Chapel",
    description: "Monthly overnight prayer vigil for church and community needs.",
    expectedAttendance: 100,
  },
  {
    id: "evt-009",
    title: "Senior Citizens Lunch",
    eventType: "local",
    departmentId: "dept-006",
    departmentName: "Senior Ministry",
    eventDate: createDate(19),
    startTime: "12:00",
    endTime: "14:30",
    location: "Fellowship Hall",
    description: "Monthly fellowship lunch for senior members of our congregation.",
    expectedAttendance: 60,
  },
  {
    id: "evt-010",
    title: "Sunday Worship Service",
    eventType: "sunday",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(21),
    startTime: "09:00",
    endTime: "11:30",
    location: "Main Sanctuary",
    description: "Weekly worship service with baptism ceremony.",
    expectedAttendance: 580,
  },

  // Next Month Events
  {
    id: "evt-011",
    title: "Youth Talent Show",
    eventType: "local",
    departmentId: "dept-001",
    departmentName: "Youth Ministry",
    eventDate: createDate(24),
    startTime: "18:00",
    endTime: "21:00",
    location: "Main Sanctuary",
    description: "Showcase of talents from our youth department - music, drama, and more.",
    expectedAttendance: 250,
  },
  {
    id: "evt-012",
    title: "Regional Youth Retreat",
    eventType: "regional",
    departmentId: "dept-001",
    departmentName: "Youth Ministry",
    eventDate: createDate(28),
    startTime: "08:00",
    endTime: "18:00",
    location: "Mountain Retreat Center",
    description: "Annual regional youth retreat with team building and spiritual growth activities.",
    expectedAttendance: 400,
  },
  {
    id: "evt-013",
    title: "Sunday Worship Service",
    eventType: "sunday",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    eventDate: createDate(28),
    startTime: "09:00",
    endTime: "11:30",
    location: "Main Sanctuary",
    description: "Join us for praise and worship.",
    expectedAttendance: 510,
  },
  {
    id: "evt-014",
    title: "Women's Bible Study",
    eventType: "local",
    departmentId: "dept-002",
    departmentName: "Women's Fellowship",
    eventDate: createDate(31),
    startTime: "19:00",
    endTime: "21:00",
    location: "Room 204",
    description: "Weekly Bible study for women - studying the Book of Proverbs.",
    expectedAttendance: 45,
  },
  {
    id: "evt-015",
    title: "Community Health Fair",
    eventType: "local",
    departmentId: "dept-004",
    departmentName: "Community Outreach",
    eventDate: createDate(35),
    startTime: "09:00",
    endTime: "15:00",
    location: "Church Parking Lot",
    description: "Free health screenings, consultations, and wellness information for the community.",
    expectedAttendance: 350,
  },
];

// Helper function to get department by ID
export const getDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find(dept => dept.id === id);
};

// Helper function to get events by department
export const getEventsByDepartment = (departmentId: string): CalendarEvent[] => {
  return mockEvents.filter(event => event.departmentId === departmentId);
};

// Helper function to get events by type
export const getEventsByType = (eventType: "sunday" | "regional" | "local"): CalendarEvent[] => {
  return mockEvents.filter(event => event.eventType === eventType);
};

// Mock Event Requests
export interface MockEventRequest {
  id: string;
  requestNumber: string;
  title: string;
  eventType: "sunday" | "regional" | "local";
  departmentId: string;
  departmentName: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  location: string;
  description?: string;
  expectedAttendance?: number;
  budget?: number;
  specialRequirements?: string;
  status: "draft" | "submitted" | "under_review" | "ready_for_approval" | "approved" | "returned" | "deleted";
  adminId?: string;
  adminName?: string;
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const mockRequests: MockEventRequest[] = [
  {
    id: "req-001",
    requestNumber: "REQ-001",
    title: "Youth Summer Camp 2025",
    eventType: "local",
    departmentId: "dept-001",
    departmentName: "Youth Ministry",
    creatorId: "user-lead-001",
    creatorName: "Otobong Okoko",
    creatorEmail: "otobong.okoko@church.com",
    eventDate: createDate(45),
    startTime: "09:00",
    endTime: "17:00",
    location: "Camp Grounds",
    description: "Annual youth summer camp with activities, worship, and team building.",
    expectedAttendance: 120,
    budget: 5000,
    specialRequirements: "Transportation needed for 120 youth",
    status: "submitted",
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-002",
    requestNumber: "REQ-002",
    title: "Women's Leadership Conference",
    eventType: "regional",
    departmentId: "dept-002",
    departmentName: "Women's Fellowship",
    creatorId: "user-lead-002",
    creatorName: "Sister Mary Johnson",
    creatorEmail: "mary.johnson@church.com",
    eventDate: createDate(60),
    startTime: "10:00",
    endTime: "16:00",
    location: "Convention Center",
    description: "Regional conference empowering women in leadership roles.",
    expectedAttendance: 300,
    budget: 10000,
    status: "under_review",
    adminId: "user-admin-001",
    adminName: "Admin User",
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-003",
    requestNumber: "REQ-003",
    title: "Worship Night Special",
    eventType: "local",
    departmentId: "dept-003",
    departmentName: "Worship Team",
    creatorId: "user-lead-003",
    creatorName: "Pastor John Emmanuel",
    creatorEmail: "john.emmanuel@church.com",
    eventDate: createDate(30),
    startTime: "18:00",
    endTime: "21:00",
    location: "Main Sanctuary",
    description: "Special worship night with guest worship leaders.",
    expectedAttendance: 400,
    budget: 3000,
    status: "ready_for_approval",
    adminId: "user-admin-001",
    adminName: "Admin User",
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-004",
    requestNumber: "REQ-004",
    title: "Community Food Distribution",
    eventType: "local",
    departmentId: "dept-004",
    departmentName: "Community Outreach",
    creatorId: "user-lead-004",
    creatorName: "Brother David Thompson",
    creatorEmail: "david.thompson@church.com",
    eventDate: createDate(40),
    startTime: "08:00",
    endTime: "13:00",
    location: "Parking Lot",
    description: "Monthly food distribution for families in need.",
    expectedAttendance: 200,
    budget: 2500,
    status: "draft",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "req-005",
    requestNumber: "REQ-005",
    title: "Prayer Retreat Weekend",
    eventType: "local",
    departmentId: "dept-005",
    departmentName: "Prayer Team",
    creatorId: "user-lead-005",
    creatorName: "Sister Grace Obi",
    creatorEmail: "grace.obi@church.com",
    eventDate: createDate(50),
    startTime: "18:00",
    endTime: "12:00",
    location: "Mountain Retreat Center",
    description: "Weekend prayer retreat for intensive intercession and spiritual growth.",
    expectedAttendance: 80,
    budget: 4000,
    specialRequirements: "Accommodation for 80 people, meals included",
    status: "submitted",
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

// Mock Notifications
export interface MockNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  resourceType?: string;
  resourceId?: string;
  readAt?: Date;
  createdAt: Date;
}

export const mockNotifications: MockNotification[] = [
  {
    id: "notif-001",
    userId: "user-admin-001",
    title: "New Event Request",
    message: "Otobong Okoko submitted a new event request: Youth Summer Camp 2025",
    type: "info",
    resourceType: "event_request",
    resourceId: "req-001",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "notif-002",
    userId: "user-admin-001",
    title: "New Event Request",
    message: "Sister Grace Obi submitted a new event request: Prayer Retreat Weekend",
    type: "info",
    resourceType: "event_request",
    resourceId: "req-005",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "notif-003",
    userId: "user-lead-002",
    title: "Request Under Review",
    message: "Your event request 'Women's Leadership Conference' is now under review by Admin User",
    type: "info",
    resourceType: "event_request",
    resourceId: "req-002",
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "notif-004",
    userId: "user-superadmin-001",
    title: "Request Ready for Approval",
    message: "Admin User forwarded event request 'Worship Night Special' for your approval",
    type: "success",
    resourceType: "event_request",
    resourceId: "req-003",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

// Mock Audit Logs
export interface MockAuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: any;
  reason?: string;
  ipAddress?: string;
  createdAt: Date;
}

export const mockAuditLogs: MockAuditLog[] = [
  {
    id: "audit-001",
    userId: "user-lead-001",
    userName: "Otobong Okoko",
    userRole: "lead",
    action: "create_request",
    resourceType: "event_request",
    resourceId: "req-001",
    changes: { status: "draft" },
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "audit-002",
    userId: "user-lead-001",
    userName: "Otobong Okoko",
    userRole: "lead",
    action: "submit_request",
    resourceType: "event_request",
    resourceId: "req-001",
    changes: { status: { from: "draft", to: "submitted" } },
    ipAddress: "192.168.1.100",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "audit-003",
    userId: "user-admin-001",
    userName: "Admin User",
    userRole: "admin",
    action: "claim_request",
    resourceType: "event_request",
    resourceId: "req-002",
    changes: { status: { from: "submitted", to: "under_review" }, adminId: "user-admin-001" },
    ipAddress: "192.168.1.50",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "audit-004",
    userId: "user-admin-001",
    userName: "Admin User",
    userRole: "admin",
    action: "update_request",
    resourceType: "event_request",
    resourceId: "req-002",
    changes: {
      budget: { from: 8000, to: 10000 },
      description: { from: "Regional conference", to: "Regional conference empowering women in leadership roles." }
    },
    ipAddress: "192.168.1.50",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "audit-005",
    userId: "user-admin-001",
    userName: "Admin User",
    userRole: "admin",
    action: "forward_request",
    resourceType: "event_request",
    resourceId: "req-003",
    changes: { status: { from: "under_review", to: "ready_for_approval" } },
    ipAddress: "192.168.1.50",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];
