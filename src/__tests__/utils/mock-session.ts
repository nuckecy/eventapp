import { Session } from 'next-auth'

export const mockLeadSession: Session = {
  user: {
    id: '1',
    name: 'Test Lead',
    email: 'lead@example.com',
    role: 'LEAD',
    departmentId: '1',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

export const mockAdminSession: Session = {
  user: {
    id: '2',
    name: 'Test Admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    departmentId: '1',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

export const mockSuperAdminSession: Session = {
  user: {
    id: '3',
    name: 'Test Super Admin',
    email: 'superadmin@example.com',
    role: 'SUPER_ADMIN',
    departmentId: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

export const mockUnauthenticatedSession = null

export function mockSession(session: Session | null) {
  const useSession = require('next-auth/react').useSession
  useSession.mockReturnValue({
    data: session,
    status: session ? 'authenticated' : 'unauthenticated',
  })
}
