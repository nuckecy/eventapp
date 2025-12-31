import { render, screen } from '@/__tests__/utils/test-utils'
import { StatCard } from '@/components/dashboard/StatCard'
import { Calendar } from 'lucide-react'
import userEvent from '@testing-library/user-event'

describe('StatCard', () => {
  it('renders label and value correctly', () => {
    render(<StatCard label="Total Events" value={42} />)

    expect(screen.getByText('Total Events')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders with string value', () => {
    render(<StatCard label="Status" value="Active" />)

    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(<StatCard label="Events" value={10} icon={Calendar} />)

    const icon = screen.getByRole('banner').querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('applies default color variant', () => {
    const { container } = render(<StatCard label="Test" value={1} />)

    expect(container.querySelector('.bg-background')).toBeInTheDocument()
  })

  it('applies warning color variant', () => {
    const { container } = render(<StatCard label="Test" value={1} color="warning" />)

    expect(container.querySelector('.bg-yellow-50')).toBeInTheDocument()
  })

  it('applies success color variant', () => {
    const { container } = render(<StatCard label="Test" value={1} color="success" />)

    expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
  })

  it('applies error color variant', () => {
    const { container } = render(<StatCard label="Test" value={1} color="error" />)

    expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
  })

  it('handles click events when onClick is provided', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<StatCard label="Clickable" value={5} onClick={handleClick} />)

    const card = screen.getByRole('button')
    await user.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation when clickable', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<StatCard label="Clickable" value={5} onClick={handleClick} />)

    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard('{Enter}')

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('handles space key when clickable', async () => {
    const handleClick = jest.fn()
    const user = userEvent.setup()

    render(<StatCard label="Clickable" value={5} onClick={handleClick} />)

    const card = screen.getByRole('button')
    card.focus()
    await user.keyboard(' ')

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not have button role when not clickable', () => {
    render(<StatCard label="Not Clickable" value={5} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('has proper ARIA label when clickable', () => {
    render(<StatCard label="Events" value={10} onClick={() => {}} />)

    const card = screen.getByRole('button')
    expect(card).toHaveAttribute('aria-label', 'Events: 10. Click to view details')
  })

  it('does not have ARIA label when not clickable', () => {
    const { container } = render(<StatCard label="Events" value={10} />)

    const card = container.querySelector('[role]')
    expect(card).toBeNull()
  })
})
