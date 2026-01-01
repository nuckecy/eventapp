import { render, screen } from '@/__tests__/utils/test-utils'
import { EventCard } from '@/components/calendar/EventCard'
import { CalendarEvent } from '@/types/calendar'
import userEvent from '@testing-library/user-event'

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'Sunday Service',
  date: '2024-03-10',
  startTime: '10:00 AM',
  endTime: '12:00 PM',
  location: 'Main Sanctuary',
  eventType: 'sunday',
  departmentName: 'Worship',
  description: 'Regular Sunday morning service',
}

describe('EventCard', () => {
  describe('pill variant', () => {
    it('renders event title and time', () => {
      render(<EventCard event={mockEvent} variant="pill" />)

      expect(screen.getByText('Sunday Service')).toBeInTheDocument()
      expect(screen.getByText(/10:00 AM - 12:00 PM/)).toBeInTheDocument()
    })

    it('renders location when provided', () => {
      render(<EventCard event={mockEvent} variant="pill" />)

      expect(screen.getByText('Main Sanctuary')).toBeInTheDocument()
    })

    it('does not render location when not provided', () => {
      const eventWithoutLocation = { ...mockEvent, location: undefined }
      render(<EventCard event={eventWithoutLocation} variant="pill" />)

      expect(screen.queryByText('Main Sanctuary')).not.toBeInTheDocument()
    })

    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<EventCard event={mockEvent} variant="pill" onClick={handleClick} />)

      const card = screen.getByRole('button')
      await user.click(card)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('applies correct color for sunday event', () => {
      const { container } = render(<EventCard event={mockEvent} variant="pill" />)

      expect(container.querySelector('.bg-teal-500')).toBeInTheDocument()
    })

    it('applies correct color for regional event', () => {
      const regionalEvent = { ...mockEvent, eventType: 'regional' as const }
      const { container } = render(<EventCard event={regionalEvent} variant="pill" />)

      expect(container.querySelector('.bg-purple-500')).toBeInTheDocument()
    })

    it('applies correct color for local event', () => {
      const localEvent = { ...mockEvent, eventType: 'local' as const }
      const { container } = render(<EventCard event={localEvent} variant="pill" />)

      expect(container.querySelector('.bg-blue-500')).toBeInTheDocument()
    })

    it('has proper ARIA label', () => {
      render(<EventCard event={mockEvent} variant="pill" />)

      const card = screen.getByLabelText(/Sunday Service, Sunday Event, 10:00 AM - 12:00 PM, at Main Sanctuary/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('compact variant', () => {
    it('renders event title and time', () => {
      render(<EventCard event={mockEvent} variant="compact" />)

      expect(screen.getByText('Sunday Service')).toBeInTheDocument()
      expect(screen.getByText('10:00 AM - 12:00 PM')).toBeInTheDocument()
    })

    it('renders location when provided', () => {
      render(<EventCard event={mockEvent} variant="compact" />)

      expect(screen.getByText('Main Sanctuary')).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<EventCard event={mockEvent} variant="compact" onClick={handleClick} />)

      const card = screen.getByRole('button')
      await user.click(card)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('has proper ARIA label', () => {
      render(<EventCard event={mockEvent} variant="compact" />)

      const card = screen.getByLabelText(/Sunday Service, Sunday Event, 10:00 AM - 12:00 PM/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('card variant', () => {
    it('renders event title and time', () => {
      render(<EventCard event={mockEvent} variant="card" />)

      expect(screen.getByText('Sunday Service')).toBeInTheDocument()
      expect(screen.getByText(/10:00 AM - 12:00 PM/)).toBeInTheDocument()
    })

    it('renders location when provided', () => {
      render(<EventCard event={mockEvent} variant="card" />)

      expect(screen.getByText('Main Sanctuary')).toBeInTheDocument()
    })

    it('renders department name when provided', () => {
      render(<EventCard event={mockEvent} variant="card" />)

      expect(screen.getByText('Worship')).toBeInTheDocument()
    })

    it('handles click events', async () => {
      const handleClick = jest.fn()
      const user = userEvent.setup()

      render(<EventCard event={mockEvent} variant="card" onClick={handleClick} />)

      const card = screen.getByRole('button')
      await user.click(card)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('has proper ARIA label', () => {
      render(<EventCard event={mockEvent} variant="card" />)

      const card = screen.getByLabelText(/Sunday Service, Sunday Event, 10:00 AM - 12:00 PM, at Main Sanctuary/)
      expect(card).toBeInTheDocument()
    })
  })

  describe('default behavior', () => {
    it('uses pill variant by default', () => {
      const { container } = render(<EventCard event={mockEvent} />)

      expect(container.querySelector('.rounded-full')).toBeInTheDocument()
    })
  })
})
