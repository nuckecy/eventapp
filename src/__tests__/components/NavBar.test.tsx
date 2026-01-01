import { render, screen } from '@/__tests__/utils/test-utils'
import { NavBar, User } from '@/components/navigation/NavBar'

// Mock the UserMenu and NotificationBell components
jest.mock('@/components/navigation/UserMenu', () => ({
  UserMenu: ({ user }: { user: User }) => <div data-testid="user-menu">{user.name}</div>,
}))

jest.mock('@/components/navigation/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Notifications</div>,
}))

describe('NavBar', () => {
  describe('Unauthenticated view', () => {
    it('renders logo and brand', () => {
      render(<NavBar />)

      expect(screen.getByText('Church Events')).toBeInTheDocument()
      expect(screen.getByLabelText('Go to Church Events home page')).toBeInTheDocument()
    })

    it('renders Contact Us link', () => {
      render(<NavBar />)

      expect(screen.getAllByText(/Contact/i)[0]).toBeInTheDocument()
    })

    it('renders Login button when not authenticated', () => {
      render(<NavBar />)

      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByLabelText('Log in to your account')).toBeInTheDocument()
    })

    it('does not render user menu when not authenticated', () => {
      render(<NavBar />)

      expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()
      expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument()
    })

    it('does not render role badge when not authenticated', () => {
      render(<NavBar />)

      expect(screen.queryByLabelText(/User role:/)).not.toBeInTheDocument()
    })
  })

  describe('Authenticated view', () => {
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'lead',
    }

    it('renders user name on large screens', () => {
      render(<NavBar user={mockUser} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('renders role badge with correct label', () => {
      render(<NavBar user={mockUser} />)

      expect(screen.getByLabelText('User role: Lead')).toBeInTheDocument()
    })

    it('renders notification bell', () => {
      render(<NavBar user={mockUser} />)

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
    })

    it('renders user menu', () => {
      render(<NavBar user={mockUser} />)

      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    it('does not render Login button when authenticated', () => {
      render(<NavBar user={mockUser} />)

      expect(screen.queryByText('Login')).not.toBeInTheDocument()
    })
  })

  describe('Role-specific views', () => {
    it('renders calendar button for member role', () => {
      const memberUser: User = {
        id: '1',
        name: 'Member User',
        email: 'member@example.com',
        role: 'member',
      }

      render(<NavBar user={memberUser} />)

      expect(screen.getByLabelText('View calendar')).toBeInTheDocument()
    })

    it('does not render calendar button for lead role', () => {
      const leadUser: User = {
        id: '2',
        name: 'Lead User',
        email: 'lead@example.com',
        role: 'lead',
      }

      render(<NavBar user={leadUser} />)

      expect(screen.queryByLabelText('View calendar')).not.toBeInTheDocument()
    })

    it('renders admin badge correctly', () => {
      const adminUser: User = {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      }

      render(<NavBar user={adminUser} />)

      expect(screen.getByLabelText('User role: Administrator')).toBeInTheDocument()
    })

    it('renders superadmin badge correctly', () => {
      const superAdminUser: User = {
        id: '4',
        name: 'Super Admin',
        email: 'superadmin@example.com',
        role: 'superadmin',
      }

      render(<NavBar user={superAdminUser} />)

      expect(screen.getByLabelText('User role: Super Admin')).toBeInTheDocument()
    })

    it('renders member badge correctly', () => {
      const memberUser: User = {
        id: '5',
        name: 'Member User',
        email: 'member@example.com',
        role: 'member',
      }

      render(<NavBar user={memberUser} />)

      expect(screen.getByLabelText('User role: Member')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      render(<NavBar />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument()
    })

    it('has accessible links', () => {
      render(<NavBar />)

      const homeLink = screen.getByLabelText('Go to Church Events home page')
      expect(homeLink).toHaveAttribute('href', '/')

      const contactLink = screen.getByLabelText('Contact us page')
      expect(contactLink).toHaveAttribute('href', '/contact')
    })
  })

  describe('Custom className', () => {
    it('applies custom className to nav element', () => {
      const { container } = render(<NavBar className="custom-nav-class" />)

      const nav = container.querySelector('.custom-nav-class')
      expect(nav).toBeInTheDocument()
    })
  })
})
