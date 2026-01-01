import { render, screen } from '@/__tests__/utils/test-utils'
import { StatusBadge, getStatusLabel, getAllStatuses } from '@/components/dashboard/StatusBadge'

describe('StatusBadge', () => {
  it('renders draft status correctly', () => {
    render(<StatusBadge status="draft" />)

    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Draft')).toBeInTheDocument()
  })

  it('renders submitted status correctly', () => {
    render(<StatusBadge status="submitted" />)

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Submitted')).toBeInTheDocument()
  })

  it('renders under_review status correctly', () => {
    render(<StatusBadge status="under_review" />)

    expect(screen.getByText('Under Review')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Under Review')).toBeInTheDocument()
  })

  it('renders ready_for_approval status correctly', () => {
    render(<StatusBadge status="ready_for_approval" />)

    expect(screen.getByText('Ready for Approval')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Ready for Approval')).toBeInTheDocument()
  })

  it('renders approved status correctly', () => {
    render(<StatusBadge status="approved" />)

    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Approved')).toBeInTheDocument()
  })

  it('renders returned status correctly', () => {
    render(<StatusBadge status="returned" />)

    expect(screen.getByText('Returned')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Returned')).toBeInTheDocument()
  })

  it('renders deleted status correctly', () => {
    render(<StatusBadge status="deleted" />)

    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: Deleted')).toBeInTheDocument()
  })

  it('renders icon by default', () => {
    const { container } = render(<StatusBadge status="draft" />)

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(<StatusBadge status="draft" showIcon={false} />)

    const icon = container.querySelector('svg')
    expect(icon).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<StatusBadge status="draft" className="custom-class" />)

    const badge = container.querySelector('.custom-class')
    expect(badge).toBeInTheDocument()
  })

  it('applies correct color for draft status', () => {
    const { container } = render(<StatusBadge status="draft" />)

    const badge = container.querySelector('.bg-gray-100')
    expect(badge).toBeInTheDocument()
  })

  it('applies correct color for submitted status', () => {
    const { container } = render(<StatusBadge status="submitted" />)

    const badge = container.querySelector('.bg-blue-100')
    expect(badge).toBeInTheDocument()
  })

  it('applies correct color for approved status', () => {
    const { container } = render(<StatusBadge status="approved" />)

    const badge = container.querySelector('.bg-green-100')
    expect(badge).toBeInTheDocument()
  })

  it('applies correct color for returned status', () => {
    const { container } = render(<StatusBadge status="returned" />)

    const badge = container.querySelector('.bg-red-100')
    expect(badge).toBeInTheDocument()
  })
})

describe('getStatusLabel', () => {
  it('returns correct label for each status', () => {
    expect(getStatusLabel('draft')).toBe('Draft')
    expect(getStatusLabel('submitted')).toBe('Submitted')
    expect(getStatusLabel('under_review')).toBe('Under Review')
    expect(getStatusLabel('ready_for_approval')).toBe('Ready for Approval')
    expect(getStatusLabel('approved')).toBe('Approved')
    expect(getStatusLabel('returned')).toBe('Returned')
    expect(getStatusLabel('deleted')).toBe('Deleted')
  })
})

describe('getAllStatuses', () => {
  it('returns all status values', () => {
    const statuses = getAllStatuses()

    expect(statuses).toHaveLength(7)
    expect(statuses).toContain('draft')
    expect(statuses).toContain('submitted')
    expect(statuses).toContain('under_review')
    expect(statuses).toContain('ready_for_approval')
    expect(statuses).toContain('approved')
    expect(statuses).toContain('returned')
    expect(statuses).toContain('deleted')
  })
})
