# Product Requirements Document (PRD)
## Church Event Management System

**Version**: 2.0  
**Last Updated**: December 31, 2025  
**Document Owner**: Product Team  
**Status**: Updated with Technical Stack & Implementation Details

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Technology Stack](#technology-stack)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [Features and Requirements](#features-and-requirements)
6. [User Flows](#user-flows)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Component Architecture](#component-architecture)
10. [UI/UX Specifications](#uiux-specifications)
11. [Success Metrics](#success-metrics)
12. [Implementation Timeline](#implementation-timeline)

---

## Executive Summary

The Church Event Management System is a Next.js-based web application that streamlines event planning, approval, and communication within church communities. Built with Shadcn UI (Lime theme, Nova style) and modern web technologies, it implements a hierarchical four-tier approval workflow ensuring proper oversight while maintaining efficiency.

**Key Value Propositions**:
- Public calendar-first experience for immediate event discovery
- Structured 4-tier approval workflow (Member → Lead → Administrator → Super Admin)
- Real-time search and filtering by event type, department, and keywords
- Google Calendar-style list view for optimal mobile experience
- Complete audit trail for governance and compliance
- Role-based access with dynamic navigation

---

## Product Overview

### Product Vision
Create a unified, public-first platform where anyone can discover church events, members can request event submissions through department leads, and church leadership maintains strategic oversight through a clean, modern interface.

### Target Users
- **Public Users**: Anyone browsing the church calendar (no login required)
- **Members**: Church members with view-only access after login
- **Leads**: Department heads who submit event requests (8-10 per church)
- **Administrators**: Staff who review and forward requests (2-3 per church)
- **Super Admins**: Senior leadership with final approval authority (1-2 per church)

### Core Functionality
A role-based event management platform featuring:
- Public calendar with Google Calendar-style list view
- Advanced search and filtering system
- Multi-stage approval workflow with tracked changes
- Department-specific contact directory
- Mobile-first responsive design
- Real-time notifications

---

## Technology Stack

### Frontend Framework
```bash
# Initialize with Shadcn UI Lime Theme
npx shadcn@latest create --preset "https://ui.shadcn.com/init?base=radix&style=nova&baseColor=neutral&theme=lime&iconLibrary=lucide&font=inter&menuAccent=subtle&menuColor=default&radius=default&template=next" --template next
```

**Core Technologies**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **UI Components**: Shadcn UI (Nova style, Lime theme)
- **Styling**: Tailwind CSS 3+ (organized, semantic classes)
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **Date Handling**: date-fns
- **Calendar**: Custom implementation with date-fns

### Backend
- **API**: Next.js API Routes (App Router)
- **Database**: PostgreSQL 15+
- **ORM**: Prisma 5+
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Session Management**: JWT tokens
- **Email Service**: Resend
- **File Storage**: Vercel Blob (for event attachments)

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Vercel Postgres
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry (optional)

### Development Tools
- **Package Manager**: pnpm
- **Code Quality**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright

### Shadcn UI Lime Theme Configuration

**Color System** (Nova style with Lime primary):
```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 83 77% 46%; /* Lime-600 */
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 83 77% 46%;
    --radius: 0.5rem;
  }
}
```

**Event Type Colors**:
- Sunday Events: Teal (`bg-teal-500`)
- Regional Events: Purple (`bg-purple-500`)
- Local Events: Blue (`bg-blue-500`)

---

## User Roles and Permissions

### 1. Public User (No Login)
**Access**:
- ✅ View public calendar (List view default)
- ✅ Search and filter events
- ✅ View Contact Us page with department leads
- ✅ Access login page
- ❌ No event submission capability

### 2. Member (Authenticated)
**Access**:
- ✅ All public user capabilities
- ✅ "Calendar" button in navigation (quick access)
- ✅ Profile management
- ❌ Cannot submit events directly
- ℹ️ Must contact department leads for event requests

**Navigation**: Shows user name, role badge, notifications, logout

### 3. Lead (Department Head)
**Capabilities**:
- ✅ Create event requests for their department
- ✅ View all requests they've submitted
- ✅ Edit draft requests
- ✅ Withdraw submitted requests
- ✅ View request status and feedback
- ✅ Receive notifications on status changes
- ❌ Cannot approve requests
- ❌ Cannot see other departments' requests

**Dashboard**: 4-column stats (Total, Pending, Approved, Rejected)

### 4. Administrator
**Capabilities**:
- ✅ Review all submitted event requests
- ✅ Forward requests to Super Admin
- ✅ Return requests to Leads with feedback (reject)
- ✅ Modify request details before forwarding
- ✅ Track changes with audit log
- ✅ View calendar conflicts
- ✅ Bulk operations on requests
- ❌ Cannot approve requests
- ❌ Cannot permanently delete requests

**Dashboard**: 5-column stats (Total Pending, Submitted, Under Review, Forwarded, Avg Processing Time)

**Request Statuses Admin Manages**:
- Submitted → Under Review (Admin claims request)
- Under Review → Returned (Reject back to Lead)
- Under Review → Ready for Approval (Forward to Super Admin)

### 5. Super Admin
**Capabilities**:
- ✅ Final approval authority for all events
- ✅ View all requests at all stages (read-only for early stages)
- ✅ Approve events to publish to calendar
- ✅ Edit and approve events
- ✅ Send events back to Admin for further review
- ✅ **Delete events permanently** (exclusive authority, logged)
- ✅ View comprehensive analytics
- ✅ Manage user roles
- ✅ System configuration

**Dashboard**: Flat tab navigation (Submitted, Under Review, Ready for Approval, Analytics)

**Request Statuses Super Admin Manages**:
- Ready for Approval → Approved (Publish to calendar)
- Ready for Approval → Returned to Admin (Request changes)
- Ready for Approval → Deleted (Permanent removal, logged)

**Critical Authority**:
- **DELETE EVENTS**: Super Admin can permanently delete event requests from the database
- This is NOT rejection (which returns to workflow)
- Used for: duplicates, inappropriate content, policy violations
- Always logged in audit trail with Super Admin attribution

---

## Features and Requirements

### FR-1: Public Calendar (Default Landing)

**Description**: Public-first calendar accessible without login, featuring Google Calendar-style list view.

**Requirements**:
- **FR-1.1**: Page loads directly to public calendar (no login screen)
- **FR-1.2**: List view is default (not month view)
- **FR-1.3**: Events displayed with left date column (day abbreviation + number) and right event card
- **FR-1.4**: Event cards styled as rounded pills with color coding
- **FR-1.5**: Navigation bar always visible with "Contact Us" and "Login" buttons
- **FR-1.6**: Mobile responsive with horizontal scroll for tables

**Event Color Coding**:
- Sunday Events: Teal background (`bg-teal-500`)
- Regional Events: Purple background (`bg-purple-500`)
- Local Events: Blue background (`bg-blue-500`)

**Calendar Views**:
- ✅ List View (default)
- ✅ Month View
- ❌ Week View (removed)

**Acceptance Criteria**:
- [ ] Calendar loads in <2 seconds
- [ ] List view shows events in chronological order
- [ ] Event cards show: title, time, location
- [ ] Color coding correctly applied
- [ ] Mobile responsive (stacks date + event vertically on small screens)

---

### FR-2: Search and Filter System

**Description**: Advanced filtering allowing users to find events by type, department, and keywords.

**Requirements**:
- **FR-2.1**: Search field in calendar controls (text input, real-time filtering)
- **FR-2.2**: "Filters" toggle button to show/hide filter panel
- **FR-2.3**: Filter panel with padding (pt-6, pb-4, px-4)
- **FR-2.4**: Event Type checkboxes (2-column grid layout)
  - Sunday Events (Teal indicator)
  - Regional Events (Purple indicator)
  - Local Events (Blue indicator)
- **FR-2.5**: Department dropdown (right-aligned)
- **FR-2.6**: Clear Filters button (right-aligned)
- **FR-2.7**: Real-time filtering (no submit button)
- **FR-2.8**: "No results" message when no events match

**Filter Logic**:
- Combines all active filters (AND logic)
- Search matches event title (case-insensitive)
- Department filter matches exact department name
- Event type checkboxes control visibility

**Acceptance Criteria**:
- [ ] Search results update as user types
- [ ] Checkboxes instantly show/hide events
- [ ] Clear Filters resets all filters and shows all events
- [ ] No results message displays when appropriate
- [ ] Filter panel properly aligned (Event Type left, Department/Clear right)

---

### FR-3: Contact Us Page

**Description**: Full-page view showing department leads with contact information.

**Requirements**:
- **FR-3.1**: Dedicated page (not modal) accessible via "Contact Us" button
- **FR-3.2**: Back to Calendar button at top
- **FR-3.3**: Page title: "Contact Us"
- **FR-3.4**: Subtitle explaining event request process
- **FR-3.5**: Department Leads section with 3-column responsive grid (6 departments)
- **FR-3.6**: Each department card includes:
  - Department icon (colored, rounded background)
  - Department name
  - Lead's name
  - Clickable email (mailto: link)
  - Clickable phone (tel: link)
- **FR-3.7**: General Inquiries section (gradient background)
  - Main office email, phone, address
- **FR-3.8**: Office Hours section
- **FR-3.9**: Hover effects on department cards

**Department Leads**:
1. Youth Ministry (Blue) - Otobong Okoko
2. Women's Fellowship (Purple) - Sister Mary Johnson
3. Worship Team (Green) - Pastor John Emmanuel
4. Community Outreach (Orange) - Brother David Thompson
5. Prayer Team (Indigo) - Sister Grace Obi
6. Senior Ministry (Teal) - Elder Peter Adeyemi

**Acceptance Criteria**:
- [ ] Page accessible from public navigation
- [ ] Back button returns to calendar
- [ ] All email/phone links functional
- [ ] Mobile responsive (3 → 2 → 1 column)
- [ ] Hover effects smooth

---

### FR-4: Dynamic Navigation

**Description**: Navigation bar that adapts based on authentication status.

**Public View (Not Logged In)**:
```
Church Events    [Contact Us]  [Login]
```

**Member View (Logged In)**:
```
Church Events  [Contact Us]  [Calendar]  John Doe  [Member]  🔔  [Logout]
```

**Staff View (Lead/Admin/Super Admin)**:
```
Church Events  [Contact Us]  [Name]  [Role Badge]  🔔  [Logout]
```

**Requirements**:
- **FR-4.1**: Navigation always visible (not hidden on public view)
- **FR-4.2**: Church Events logo clickable (returns to calendar)
- **FR-4.3**: Contact Us always visible
- **FR-4.4**: Login button hidden after authentication
- **FR-4.5**: Calendar button only visible for logged-in Members
- **FR-4.6**: User name, role badge, notifications only visible when logged in
- **FR-4.7**: Logout replaces Login when authenticated

**Role Badges**:
- Member: Blue (`bg-blue-100 text-blue-800`)
- Lead: Green (`bg-green-100 text-green-800`)
- Administrator: Yellow (`bg-yellow-100 text-yellow-800`)
- Super Admin: Red (`bg-red-100 text-red-800`)

**Acceptance Criteria**:
- [ ] Correct buttons shown/hidden based on auth state
- [ ] Transitions smooth (no flash of wrong content)
- [ ] Mobile responsive (condensed spacing)

---

### FR-5: Event Request Workflow

**Description**: 4-tier hierarchical approval workflow with tracked changes.

**Workflow Stages**:

1. **Draft** (Lead)
   - Lead creates request
   - Can edit, save as draft, or submit
   - Not visible to other roles

2. **Submitted** (Admin Review)
   - Lead submits request
   - Admin receives notification
   - Admin can: Claim, Return to Lead (reject)
   - Super Admin has read-only visibility

3. **Under Review** (Admin Processing)
   - Admin claimed request
   - Admin can: Edit details, Return to Lead, Forward to Super Admin
   - Changes tracked in audit log
   - Super Admin has read-only visibility

4. **Ready for Approval** (Super Admin Decision)
   - Admin forwarded request
   - Super Admin can: Approve, Edit & Approve, Send Back to Admin, Delete
   - Final approval publishes to public calendar

5. **Approved** (Published)
   - Event visible on public calendar
   - Notifications sent to all stakeholders
   - Event details locked (edits require new request)

6. **Returned** (Feedback Loop)
   - Admin returned to Lead OR Super Admin returned to Admin
   - Includes feedback/reasoning
   - Recipient can revise and resubmit

7. **Deleted** (Permanent Removal)
   - Super Admin permanently deleted request
   - Removed from database
   - Logged in audit trail
   - Lead and Admin notified

**Request Properties**:
- Event Title
- Event Type (Sunday, Regional, Local)
- Department
- Date & Time
- Duration
- Location/Venue
- Description
- Expected Attendance
- Budget (optional)
- Special Requirements
- Attachments (optional)

**Acceptance Criteria**:
- [ ] Status transitions follow defined workflow
- [ ] Notifications sent at each stage
- [ ] Audit log captures all changes
- [ ] Users can only perform actions appropriate to their role
- [ ] Delete action requires confirmation

---

### FR-6: Lead Dashboard

**Description**: Department Lead interface for managing event requests.

**Layout**:
- Header with dashboard title and subtitle
- 2 action buttons: "+ Create Activity Request" (green), "+ Create Event Request" (blue)
- 4-column stats grid (responsive: 4 → 2 columns on mobile)
- Requests table with search

**Stats Cards** (4 columns on desktop):
1. Total Requests (count)
2. Pending Review (yellow, count)
3. Approved (green, count)
4. Rejected (red, count)

**Requests Table**:
- Columns: Request ID, Title, Status, Submitted Date, Actions
- Search functionality
- Status badges color-coded
- Actions: View, Edit (drafts only), Withdraw

**Acceptance Criteria**:
- [ ] Stats update in real-time
- [ ] Table searchable
- [ ] Mobile responsive (4 → 2 columns for stats)
- [ ] Action buttons prominent and accessible

---

### FR-7: Administrator Dashboard

**Description**: Administrator interface for reviewing and processing requests.

**Layout**:
- Dashboard title
- 5-column stats (responsive: 5 → 3 → 2 columns)
- Tabbed view: New Requests, Under Review, Forwarded
- Request cards with action buttons

**Stats Cards** (5 columns):
1. Total Pending
2. Submitted (blue)
3. Under Review (yellow)
4. Forwarded (green)
5. Avg Processing Time

**Tabs**:
- **New Requests**: Submitted requests awaiting review
- **Under Review**: Requests Admin is actively processing
- **Forwarded**: Requests sent to Super Admin

**Request Card Actions**:
- Claim Request (Submitted → Under Review)
- Edit Details
- Return to Lead (with feedback)
- Forward to Super Admin

**Acceptance Criteria**:
- [ ] Tabs switch without page reload
- [ ] Action buttons disabled appropriately
- [ ] Processing time calculated correctly
- [ ] Mobile responsive

---

### FR-8: Super Admin Dashboard

**Description**: Super Admin interface with final approval authority and analytics.

**Layout**:
- Summary cards (always visible, 4 columns)
  - Submitted (blue, 5 requests)
  - Under Review (yellow, 7 requests)
  - Ready for Approval (green, 7 requests, ACTION REQUIRED badge)
  - This Week (stats, 23 processed, avg 28h)
- Flat tab navigation (no nested tabs)
  - 📋 Submitted (5)
  - 🔍 Under Review (7)
  - ✅ Ready for Approval (7) [ACTION REQUIRED]
  - Analytics

**Tab Content**:

1. **Submitted Tab** (View Only):
   - Blue background on items
   - "View" button only
   - Lock icon with warning: "This request is with the Administrator. You can view details but cannot take action until it's forwarded."

2. **Under Review Tab** (View + Progress):
   - Yellow background
   - Shows Administrator's progress notes
   - View button only
   - Info message: "Administrator is reviewing this request."

3. **Ready for Approval Tab** (Full Actions):
   - Green styling
   - ACTION REQUIRED badge
   - Buttons: Approve, Edit & Approve, Send Back to Admin, **Delete Event**
   - Full request details visible

4. **Analytics Tab**:
   - Placeholder for metrics dashboard

**Delete Event Authority**:
- **Button Label**: "Delete Event" (not "Reject Request")
- **Confirmation Dialog**: "⚠️ WARNING: Delete Event Request? This will permanently delete this event request from the system. This action cannot be undone."
- **Action**: Permanent database removal
- **Logging**: Logged in audit trail with Super Admin ID, timestamp, reason
- **Notifications**: Lead and Administrator notified
- **Use Cases**: Duplicates, inappropriate content, policy violations

**Acceptance Criteria**:
- [ ] Summary cards clickable for quick navigation
- [ ] Tabs show correct permissions
- [ ] Delete requires confirmation
- [ ] Audit log captures deletions
- [ ] Analytics tab displays metrics

---

### FR-9: Notification System

**Description**: Real-time notifications for status changes and actions.

**Notification Triggers**:
- Lead submits request → Admin notified
- Admin returns to Lead → Lead notified
- Admin forwards to Super Admin → Super Admin notified
- Super Admin approves → Lead, Admin, all members notified
- Super Admin returns to Admin → Admin notified
- Super Admin deletes → Lead and Admin notified

**Notification Channels**:
- In-app (bell icon with count badge)
- Email (Resend)

**Notification Content**:
- Action taken
- Who took action
- Request ID and title
- Link to request/event
- Timestamp

**Acceptance Criteria**:
- [ ] Notifications sent within 5 seconds
- [ ] Badge count accurate
- [ ] Email contains all relevant info
- [ ] Links in emails functional

---

### FR-10: Audit Trail

**Description**: Complete logging of all actions for governance.

**Logged Actions**:
- Request creation
- Status changes
- Content modifications (with before/after diff)
- User assignments
- Approval/rejection with reasoning
- **Event deletions** (with Super Admin attribution)

**Audit Log Fields**:
- Timestamp
- User ID and role
- Action type
- Request ID
- Changes made (JSON diff)
- Reason/notes (if provided)
- IP address

**Retention**:
- Minimum 2 years
- Deletions retained permanently

**Acceptance Criteria**:
- [ ] All actions logged
- [ ] Logs immutable
- [ ] Searchable by request, user, date range
- [ ] Export functionality

---

## User Flows

### Flow 1: Public User Discovers Events

```
1. User visits site
   └─> Public calendar loads (List view default)
   
2. User sees events in chronological order
   └─> Left: Date (Thu, 5)
   └─> Right: Event card (teal/purple/blue pill)
   
3. User applies filters
   └─> Click "Filters" button
   └─> Check/uncheck event types
   └─> Select department
   └─> Type in search field
   └─> Events update in real-time
   
4. User wants to submit event
   └─> Click "Contact Us"
   └─> View department leads
   └─> Email/call relevant lead
```

### Flow 2: Member Browses After Login

```
1. Member clicks "Login" button
   └─> Login screen displays
   
2. Member logs in
   └─> Returns to public calendar
   └─> "Calendar" button appears in nav
   └─> User name and "Member" badge visible
   
3. Member browses events
   └─> Same as public user
   
4. Member wants to submit event
   └─> Click "Contact Us"
   └─> Contact department lead
   
5. Member logs out
   └─> Returns to public calendar
   └─> "Login" button reappears
```

### Flow 3: Lead Submits Event Request

```
1. Lead logs in
   └─> Redirected to Lead Dashboard
   
2. Lead sees stats (4 columns)
   └─> Total: 12, Pending: 3, Approved: 8, Rejected: 1
   
3. Lead clicks "+ Create Event Request"
   └─> Form opens
   
4. Lead fills form
   └─> Event Title: "Youth Conference 2025"
   └─> Event Type: Local
   └─> Department: Youth Ministry
   └─> Date/Time/Location
   └─> Description, attendance, budget
   
5. Lead submits
   └─> Status: Submitted
   └─> Notification sent to Admin
   └─> Confirmation message displayed
   
6. Lead views request in table
   └─> Status badge: "Pending Review" (yellow)
```

### Flow 4: Administrator Reviews Request

```
1. Admin logs in
   └─> Redirected to Admin Dashboard
   
2. Admin sees notification (3 new requests)
   └─> Stats: Total Pending: 15, Submitted: 5
   
3. Admin opens "New Requests" tab
   └─> Sees "Youth Conference 2025"
   
4. Admin clicks "Review"
   └─> Request details displayed
   └─> Calendar conflict check shown
   
5. Admin has 3 options:
   
   Option A: Return to Lead
   └─> Click "Return to Lead"
   └─> Enter feedback: "Please provide budget breakdown"
   └─> Confirm
   └─> Lead receives notification
   
   Option B: Edit and Forward
   └─> Click "Edit Details"
   └─> Modify: Change date to avoid conflict
   └─> Changes tracked in audit log
   └─> Click "Forward to Super Admin"
   └─> Super Admin receives notification
   
   Option C: Forward As-Is
   └─> Click "Forward to Super Admin"
   └─> Super Admin receives notification
```

### Flow 5: Super Admin Makes Final Decision

```
1. Super Admin logs in
   └─> Redirected to Super Admin Dashboard
   
2. Super Admin sees summary cards
   └─> Ready for Approval: 7 (ACTION REQUIRED badge)
   
3. Super Admin clicks green card or "Ready for Approval" tab
   └─> 7 requests displayed
   └─> Green styling indicates full authority
   
4. Super Admin reviews "Youth Conference 2025"
   └─> View request details
   └─> See Admin's changes in audit log
   
5. Super Admin has 4 options:
   
   Option A: Approve
   └─> Click "Approve"
   └─> Confirm approval
   └─> Event publishes to public calendar
   └─> Notifications sent to Lead, Admin, all members
   
   Option B: Edit & Approve
   └─> Click "Edit & Approve"
   └─> Make final adjustments
   └─> Approve
   └─> Event published with changes
   
   Option C: Send Back to Admin
   └─> Click "Send Back to Admin"
   └─> Enter feedback: "Need more detail on speakers"
   └─> Admin receives notification
   └─> Request returns to Under Review
   
   Option D: Delete Event
   └─> Click "Delete Event" (red button)
   └─> Warning dialog: "⚠️ WARNING: Delete Event Request? This will permanently delete..."
   └─> Confirm deletion
   └─> Request permanently removed from database
   └─> Logged in audit trail
   └─> Lead and Admin notified
```

### Flow 6: Event Published and Visible

```
1. Event approved
   └─> Status: Approved
   
2. Event appears on public calendar
   └─> Visible in List view
   └─> Color: Blue (Local event)
   └─> Shows: "Youth Conference 2025, 3:00 PM - 8:00 PM • Fellowship Hall"
   
3. Public users can filter
   └─> Search: "youth"
   └─> Event appears
   └─> Click event → Details modal
   
4. Event is immutable
   └─> Details locked
   └─> Edits require new request
```

---

## Database Schema

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'lead', 'admin', 'superadmin')),
  department_id UUID REFERENCES departments(id),
  hashed_password TEXT NOT NULL,
  email_verified TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### 2. departments
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(50),
  lead_name VARCHAR(255),
  lead_email VARCHAR(255),
  lead_phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO departments (name, color, lead_name, lead_email, lead_phone) VALUES
('Youth Ministry', 'blue', 'Otobong Okoko', 'otobong.okoko@church.com', '+234 801 234 5678'),
('Women''s Fellowship', 'purple', 'Sister Mary Johnson', 'mary.johnson@church.com', '+234 802 345 6789'),
('Worship Team', 'green', 'Pastor John Emmanuel', 'john.emmanuel@church.com', '+234 803 456 7890'),
('Community Outreach', 'orange', 'Brother David Thompson', 'david.thompson@church.com', '+234 804 567 8901'),
('Prayer Team', 'indigo', 'Sister Grace Obi', 'grace.obi@church.com', '+234 805 678 9012'),
('Senior Ministry', 'teal', 'Elder Peter Adeyemi', 'peter.adeyemi@church.com', '+234 806 789 0123');
```

#### 3. event_requests
```sql
CREATE TABLE event_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number VARCHAR(50) UNIQUE NOT NULL, -- REQ-001, REQ-002, etc.
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('sunday', 'regional', 'local')),
  department_id UUID NOT NULL REFERENCES departments(id),
  creator_id UUID NOT NULL REFERENCES users(id),
  
  -- Event Details
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  expected_attendance INTEGER,
  budget DECIMAL(10, 2),
  special_requirements TEXT,
  
  -- Workflow Status
  status VARCHAR(50) NOT NULL CHECK (status IN (
    'draft', 'submitted', 'under_review', 'ready_for_approval', 
    'approved', 'returned', 'deleted'
  )),
  admin_id UUID REFERENCES users(id), -- Admin processing request
  
  -- Timestamps
  submitted_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  approved_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_requests_status ON event_requests(status);
CREATE INDEX idx_requests_creator ON event_requests(creator_id);
CREATE INDEX idx_requests_department ON event_requests(department_id);
CREATE INDEX idx_requests_date ON event_requests(event_date);
```

#### 4. request_feedback
```sql
CREATE TABLE request_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  user_role VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'returned', 'forwarded', 'approved', 'deleted'
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_feedback_request ON request_feedback(request_id);
```

#### 5. request_changes
```sql
CREATE TABLE request_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES event_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_changes_request ON request_changes(request_id);
```

#### 6. events (Published Events)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID UNIQUE NOT NULL REFERENCES event_requests(id),
  title VARCHAR(255) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255),
  description TEXT,
  expected_attendance INTEGER,
  
  published_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_department ON events(department_id);
```

#### 7. audit_log
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  user_role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL, -- 'event_request', 'event', 'user'
  resource_id UUID NOT NULL,
  changes JSONB, -- JSON diff of changes
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

#### 8. notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'info', 'success', 'warning', 'error'
  resource_type VARCHAR(50),
  resource_id UUID,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### Prisma Schema

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(uuid())
  email           String    @unique
  name            String
  role            Role
  departmentId    String?   @map("department_id")
  hashedPassword  String    @map("hashed_password")
  emailVerified   DateTime? @map("email_verified")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  department      Department?      @relation(fields: [departmentId], references: [id])
  createdRequests EventRequest[]   @relation("RequestCreator")
  processedRequests EventRequest[] @relation("RequestAdmin")
  feedback        RequestFeedback[]
  changes         RequestChange[]
  auditLogs       AuditLog[]
  notifications   Notification[]

  @@index([email])
  @@index([role])
  @@map("users")
}

model Department {
  id        String   @id @default(uuid())
  name      String   @unique
  icon      String?
  color     String?
  leadName  String   @map("lead_name")
  leadEmail String   @map("lead_email")
  leadPhone String   @map("lead_phone")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users    User[]
  requests EventRequest[]
  events   Event[]

  @@map("departments")
}

model EventRequest {
  id              String   @id @default(uuid())
  requestNumber   String   @unique @map("request_number")
  title           String
  eventType       EventType @map("event_type")
  departmentId    String   @map("department_id")
  creatorId       String   @map("creator_id")
  
  eventDate       DateTime @map("event_date") @db.Date
  startTime       DateTime @map("start_time") @db.Time
  endTime         DateTime @map("end_time") @db.Time
  location        String?
  description     String?
  expectedAttendance Int?  @map("expected_attendance")
  budget          Decimal? @db.Decimal(10, 2)
  specialRequirements String? @map("special_requirements")
  
  status          RequestStatus
  adminId         String?  @map("admin_id")
  
  submittedAt     DateTime? @map("submitted_at")
  reviewedAt      DateTime? @map("reviewed_at")
  approvedAt      DateTime? @map("approved_at")
  deletedAt       DateTime? @map("deleted_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  department      Department       @relation(fields: [departmentId], references: [id])
  creator         User             @relation("RequestCreator", fields: [creatorId], references: [id])
  admin           User?            @relation("RequestAdmin", fields: [adminId], references: [id])
  feedback        RequestFeedback[]
  changes         RequestChange[]
  event           Event?

  @@index([status])
  @@index([creatorId])
  @@index([departmentId])
  @@index([eventDate])
  @@map("event_requests")
}

model RequestFeedback {
  id        String   @id @default(uuid())
  requestId String   @map("request_id")
  userId    String   @map("user_id")
  userRole  String   @map("user_role")
  action    String
  feedback  String?
  createdAt DateTime @default(now()) @map("created_at")

  request   EventRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user      User         @relation(fields: [userId], references: [id])

  @@index([requestId])
  @@map("request_feedback")
}

model RequestChange {
  id        String   @id @default(uuid())
  requestId String   @map("request_id")
  userId    String   @map("user_id")
  fieldName String   @map("field_name")
  oldValue  String?  @map("old_value")
  newValue  String?  @map("new_value")
  createdAt DateTime @default(now()) @map("created_at")

  request   EventRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user      User         @relation(fields: [userId], references: [id])

  @@index([requestId])
  @@map("request_changes")
}

model Event {
  id              String   @id @default(uuid())
  requestId       String   @unique @map("request_id")
  title           String
  eventType       EventType @map("event_type")
  departmentId    String   @map("department_id")
  
  eventDate       DateTime @map("event_date") @db.Date
  startTime       DateTime @map("start_time") @db.Time
  endTime         DateTime @map("end_time") @db.Time
  location        String?
  description     String?
  expectedAttendance Int?  @map("expected_attendance")
  
  publishedAt     DateTime @default(now()) @map("published_at")
  createdAt       DateTime @default(now()) @map("created_at")

  request         EventRequest @relation(fields: [requestId], references: [id])
  department      Department   @relation(fields: [departmentId], references: [id])

  @@index([eventDate])
  @@index([eventType])
  @@index([departmentId])
  @@map("events")
}

model AuditLog {
  id           String   @id @default(uuid())
  userId       String?  @map("user_id")
  userRole     String?  @map("user_role")
  action       String
  resourceType String   @map("resource_type")
  resourceId   String   @map("resource_id")
  changes      Json?
  reason       String?
  ipAddress    String?  @map("ip_address")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User?    @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([resourceType, resourceId])
  @@index([createdAt])
  @@map("audit_log")
}

model Notification {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  title        String
  message      String
  type         String
  resourceType String?  @map("resource_type")
  resourceId   String?  @map("resource_id")
  readAt       DateTime? @map("read_at")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id])

  @@index([userId, readAt])
  @@index([createdAt])
  @@map("notifications")
}

enum Role {
  member
  lead
  admin
  superadmin
}

enum EventType {
  sunday
  regional
  local
}

enum RequestStatus {
  draft
  submitted
  under_review
  ready_for_approval
  approved
  returned
  deleted
}
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
GET    /api/auth/session
POST   /api/auth/verify-email
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Public Calendar

```
GET    /api/events
       Query params: ?startDate=2025-01-01&endDate=2025-12-31&type=sunday,local&department=Youth
       Response: Array of published events

GET    /api/events/:id
       Response: Single event details
```

### Departments

```
GET    /api/departments
       Response: Array of all departments with lead contact info
```

### Event Requests (Authenticated)

```
GET    /api/requests
       Query params: ?status=submitted&department=abc-123
       Response: Array of requests (filtered by role)

GET    /api/requests/:id
       Response: Single request with full details

POST   /api/requests
       Body: { title, eventType, departmentId, eventDate, ... }
       Response: Created request

PATCH  /api/requests/:id
       Body: { field: newValue }
       Response: Updated request + audit log entry

DELETE /api/requests/:id
       Auth: Super Admin only
       Response: Confirmation + audit log entry

POST   /api/requests/:id/submit
       Action: Draft → Submitted
       Response: Updated request + notification to Admin

POST   /api/requests/:id/claim
       Auth: Admin only
       Action: Submitted → Under Review
       Response: Updated request

POST   /api/requests/:id/return
       Auth: Admin or Super Admin
       Body: { feedback: string }
       Response: Updated request + feedback entry

POST   /api/requests/:id/forward
       Auth: Admin only
       Action: Under Review → Ready for Approval
       Response: Updated request + notification to Super Admin

POST   /api/requests/:id/approve
       Auth: Super Admin only
       Action: Ready for Approval → Approved + Publish to events
       Response: Published event + notifications

POST   /api/requests/:id/delete
       Auth: Super Admin only
       Body: { reason?: string }
       Response: Confirmation + audit log + notifications
```

### Notifications

```
GET    /api/notifications
       Response: Array of user's notifications

PATCH  /api/notifications/:id/read
       Response: Updated notification

DELETE /api/notifications/:id
       Response: Confirmation
```

### Audit Log

```
GET    /api/audit
       Auth: Admin, Super Admin
       Query params: ?requestId=abc-123&userId=def-456&startDate=2025-01-01
       Response: Array of audit log entries
```

### Analytics

```
GET    /api/analytics/requests
       Auth: Super Admin
       Response: Request statistics (counts by status, avg processing time, etc.)

GET    /api/analytics/events
       Auth: Super Admin
       Response: Event statistics (by type, department, attendance, etc.)
```

---

## Component Architecture

### Shadcn UI Components to Install

```bash
# Core Components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add badge
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add checkbox
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add dialog
npx shadcn@latest add alert
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add form
npx shadcn@latest add toast
npx shadcn@latest add calendar
npx shadcn@latest add popover
npx shadcn@latest add textarea
npx shadcn@latest add separator
npx shadcn@latest add skeleton
```

### App Structure (Next.js App Router)

```
app/
├── (public)/
│   ├── page.tsx                    # Public calendar (default)
│   ├── contact/
│   │   └── page.tsx                # Contact Us page
│   └── login/
│       └── page.tsx                # Login page
│
├── (authenticated)/
│   ├── dashboard/
│   │   ├── lead/
│   │   │   └── page.tsx            # Lead Dashboard
│   │   ├── admin/
│   │   │   └── page.tsx            # Admin Dashboard
│   │   └── super-admin/
│   │       └── page.tsx            # Super Admin Dashboard
│   │
│   ├── requests/
│   │   ├── new/
│   │   │   └── page.tsx            # Create Request Form
│   │   ├── [id]/
│   │   │   ├── page.tsx            # Request Details
│   │   │   └── edit/
│   │   │       └── page.tsx        # Edit Request
│   │   └── page.tsx                # Requests List
│   │
│   └── profile/
│       └── page.tsx                # User Profile
│
├── api/
│   ├── auth/
│   ├── events/
│   ├── requests/
│   ├── departments/
│   ├── notifications/
│   └── audit/
│
└── layout.tsx                      # Root layout with navigation

components/
├── ui/                             # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
│
├── calendar/
│   ├── CalendarView.tsx            # Calendar container
│   ├── ListView.tsx                # Google Calendar-style list
│   ├── MonthView.tsx               # Month grid view
│   ├── EventCard.tsx               # Event display card
│   └── CalendarFilters.tsx         # Search & filter panel
│
├── navigation/
│   ├── NavBar.tsx                  # Dynamic navigation bar
│   ├── UserMenu.tsx                # User dropdown menu
│   └── NotificationBell.tsx        # Notification icon with count
│
├── dashboard/
│   ├── StatCard.tsx                # Reusable stat card
│   ├── RequestsTable.tsx           # Requests table with actions
│   ├── StatusBadge.tsx             # Color-coded status badges
│   └── QuickActions.tsx            # Action button group
│
├── requests/
│   ├── RequestForm.tsx             # Create/Edit request form
│   ├── RequestDetails.tsx          # Request details view
│   ├── RequestActions.tsx          # Action buttons (role-based)
│   ├── FeedbackDialog.tsx          # Return/feedback modal
│   └── AuditTrail.tsx              # Change history display
│
├── contact/
│   ├── DepartmentGrid.tsx          # Department cards grid
│   ├── DepartmentCard.tsx          # Single department card
│   └── GeneralContact.tsx          # General inquiries section
│
└── providers/
    ├── SessionProvider.tsx         # Auth session provider
    └── ToastProvider.tsx           # Toast notifications

lib/
├── prisma.ts                       # Prisma client instance
├── auth.ts                         # NextAuth configuration
├── utils.ts                        # Utility functions (cn, etc.)
└── validators/
    ├── request.ts                  # Zod schemas for requests
    └── auth.ts                     # Zod schemas for auth
```

### Key Component Examples

#### CalendarView.tsx (Clean Tailwind)
```typescript
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ListView } from "./ListView"
import { MonthView } from "./MonthView"
import { CalendarFilters } from "./CalendarFilters"

export function CalendarView({ events }) {
  const [view, setView] = useState<"list" | "month">("list")
  const [showFilters, setShowFilters] = useState(false)
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <Button 
            variant={view === "month" ? "default" : "outline"}
            onClick={() => setView("month")}
          >
            Month
          </Button>
          <Button 
            variant={view === "list" ? "default" : "outline"}
            onClick={() => setView("list")}
          >
            List
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">←</Button>
            <span className="font-semibold">January 2025</span>
            <Button variant="ghost" size="icon">→</Button>
            <Button variant="outline">Today • 31 Dec 2025</Button>
          </div>
          
          {/* Search & Filters */}
          <div className="flex gap-2">
            <Input 
              placeholder="Search events..." 
              className="w-48"
            />
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>
        </div>
      </div>
      
      {showFilters && <CalendarFilters />}
      
      {view === "list" ? (
        <ListView events={events} />
      ) : (
        <MonthView events={events} />
      )}
    </div>
  )
}
```

#### ListView.tsx (Google Calendar Style)
```typescript
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

interface Event {
  id: string
  title: string
  eventType: "sunday" | "regional" | "local"
  date: Date
  startTime: string
  endTime: string
  location: string
}

export function ListView({ events }: { events: Event[] }) {
  const getEventColor = (type: string) => {
    const colors = {
      sunday: "bg-teal-500",
      regional: "bg-purple-500",
      local: "bg-blue-500"
    }
    return colors[type] || colors.local
  }
  
  return (
    <div className="space-y-1">
      {events.map(event => (
        <div key={event.id} className="flex py-3 border-b hover:bg-muted/50">
          {/* Date Column */}
          <div className="w-16 text-center flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {event.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-2xl font-medium">
              {event.date.getDate()}
            </div>
          </div>
          
          {/* Event Card */}
          <div className="flex-1 ml-4">
            <div 
              className={`
                ${getEventColor(event.eventType)} 
                text-white rounded-full px-4 py-3 
                cursor-pointer hover:opacity-90 transition
              `}
            >
              <div className="font-medium">{event.title}</div>
              <div className="text-sm opacity-90 mt-1">
                {event.startTime} - {event.endTime} • {event.location}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

#### StatCard.tsx (Dashboard)
```typescript
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: number
  color?: "default" | "warning" | "success" | "error"
  onClick?: () => void
}

export function StatCard({ label, value, color = "default", onClick }: StatCardProps) {
  const colors = {
    default: "text-foreground",
    warning: "text-yellow-600",
    success: "text-green-600",
    error: "text-red-600"
  }
  
  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-shadow",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={cn("text-3xl font-bold mt-2", colors[color])}>
          {value}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## UI/UX Specifications

### Design System

**Shadcn UI Lime Theme (Nova Style)**:
- Primary: Lime (yellow-green accent)
- Base: Neutral colors
- Font: Inter
- Icons: Lucide React
- Radius: Default (0.5rem)

**Color Usage**:
- **Lime**: Primary actions, approvals, success states, active elements
- **Teal**: Sunday events
- **Purple**: Regional events
- **Blue**: Local events, informational states
- **Yellow**: Warnings, pending states
- **Red**: Errors, rejections, delete actions
- **Neutral**: Text, backgrounds, borders

### Typography

**Font Scale** (Inter):
- Headings: `text-3xl` (h1), `text-2xl` (h2), `text-xl` (h3)
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Tiny: `text-xs` (12px)

**Weights**:
- Bold: `font-bold` (headings, stats)
- Semibold: `font-semibold` (subheadings)
- Medium: `font-medium` (emphasis)
- Normal: `font-normal` (body text)

### Spacing

**Consistent Scale** (Tailwind default):
- `gap-2` (0.5rem / 8px) - tight spacing
- `gap-4` (1rem / 16px) - standard spacing
- `gap-6` (1.5rem / 24px) - section spacing
- `gap-8` (2rem / 32px) - large spacing

**Padding**:
- Cards: `p-6`
- Buttons: `px-6 py-3` (standard), `px-4 py-2` (small)
- Sections: `py-8 px-4 sm:px-6 lg:px-8`

### Components

#### Buttons (Lime Primary)
```typescript
// Primary (Lime)
<Button>Approve</Button>

// Secondary
<Button variant="outline">Edit</Button>

// Destructive
<Button variant="destructive">Delete Event</Button>

// Ghost
<Button variant="ghost">Cancel</Button>
```

#### Badges (Status)
```typescript
// Status badges with color coding
<Badge variant="default">Draft</Badge>
<Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
<Badge className="bg-green-100 text-green-800">Approved</Badge>
<Badge className="bg-red-100 text-red-800">Rejected</Badge>
```

#### Cards
```typescript
<Card>
  <CardHeader>
    <CardTitle>Event Title</CardTitle>
    <CardDescription>Subtitle or meta info</CardDescription>
  </CardHeader>
  <CardContent>
    Main content
  </CardContent>
  <CardFooter>
    Action buttons
  </CardFooter>
</Card>
```

### Responsive Breakpoints

**Tailwind Default**:
- `sm:` 640px (mobile landscape)
- `md:` 768px (tablet)
- `lg:` 1024px (desktop)
- `xl:` 1280px (large desktop)
- `2xl:` 1536px (extra large)

**Grid Patterns**:
- Stats: `grid-cols-2 md:grid-cols-4` (2 → 4 columns)
- Departments: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` (1 → 2 → 3)
- Forms: `grid-cols-1 lg:grid-cols-2` (1 → 2 columns)

### Animation

**Transitions** (Shadcn default):
- All interactive elements: `transition-colors` or `transition-all`
- Hover states: `hover:bg-accent hover:text-accent-foreground`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-ring`

---

## Success Metrics

### User Metrics
- **Public Calendar Traffic**: 1,000+ monthly views
- **Active Users**: 50+ leads/admins logging in weekly
- **Event Submissions**: 20+ requests per month

### Workflow Metrics
- **Submission Time**: < 5 minutes (from start to submit)
- **Approval Time**: < 48 hours (from submission to approval)
- **Request Rejection Rate**: < 20%
- **Admin Processing Time**: < 2 hours per request

### System Metrics
- **Page Load Time**: < 2 seconds (calendar)
- **API Response Time**: < 500ms (p95)
- **Uptime**: > 99.5%
- **Mobile Traffic**: > 40% of total

### Adoption Metrics
- **Login Rate**: 70%+ of leads/admins use system
- **Event Discovery**: 60%+ of events discovered via calendar
- **Notification Engagement**: 50%+ open rate

---

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (Next.js + Shadcn UI Lime theme)
- [ ] Database schema (Prisma)
- [ ] Authentication (NextAuth.js)
- [ ] Basic navigation structure

### Phase 2: Public Features (Weeks 3-4)
- [ ] Public calendar (List view default)
- [ ] Search and filter system
- [ ] Contact Us page
- [ ] Event detail modal

### Phase 3: Request Workflow (Weeks 5-7)
- [ ] Lead dashboard
- [ ] Request creation form
- [ ] Admin dashboard
- [ ] Super Admin dashboard
- [ ] Status transitions

### Phase 4: Notifications & Audit (Week 8)
- [ ] Notification system
- [ ] Audit logging
- [ ] Email integration

### Phase 5: Polish & Testing (Weeks 9-10)
- [ ] Mobile optimization
- [ ] Performance optimization
- [ ] E2E testing
- [ ] Bug fixes

### Phase 6: Launch (Week 11)
- [ ] User acceptance testing
- [ ] Data migration
- [ ] Training materials
- [ ] Production deployment

---

## Appendix

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/church_events"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Email
RESEND_API_KEY="re_xxx"

# Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"
```

### Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### Dependencies
```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "@prisma/client": "^5.9.0",
    "next-auth": "^5.0.0-beta",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.3",
    "@hookform/resolvers": "^3.3.4",
    "zustand": "^4.5.0",
    "date-fns": "^3.3.1",
    "lucide-react": "^0.323.0",
    "resend": "^3.2.0"
  },
  "devDependencies": {
    "prisma": "^5.9.0",
    "tailwindcss": "^3.4.1",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4"
  }
}
```

---

**Document Version**: 2.0  
**Last Updated**: December 31, 2025  
**Next Review**: Q1 2026
