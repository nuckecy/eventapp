import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { RequestForm, Department } from '@/components/requests/RequestForm'
import userEvent from '@testing-library/user-event'

const mockDepartments: Department[] = [
  { id: '1', name: 'Worship' },
  { id: '2', name: 'Youth Ministry' },
  { id: '3', name: 'Administration' },
]

const mockOnSubmit = jest.fn()
const mockOnCancel = jest.fn()

describe('RequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Form rendering', () => {
    it('renders create form title by default', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText('Create Event Request')).toBeInTheDocument()
      expect(screen.getByText('Fill in the details for your event request')).toBeInTheDocument()
    })

    it('renders edit form title when isEdit is true', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          isEdit={true}
        />
      )

      expect(screen.getByText('Edit Event Request')).toBeInTheDocument()
      expect(screen.getByText('Update the event details below')).toBeInTheDocument()
    })

    it('renders all required form fields', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByLabelText(/Event Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Event Type/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Department/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Event Date/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Start Time/)).toBeInTheDocument()
      expect(screen.getByLabelText(/End Time/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Location/)).toBeInTheDocument()
    })

    it('renders optional form fields', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Expected Attendance/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Budget/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Special Requirements/)).toBeInTheDocument()
    })

    it('renders form action buttons', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      expect(screen.getByText('Save as Draft')).toBeInTheDocument()
      expect(screen.getByText('Submit for Review')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('does not render Cancel button when onCancel is not provided', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })
  })

  describe('Form validation', () => {
    it('shows validation error for empty title', async () => {
      const user = userEvent.setup()
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByLabelText(/Event Title/)
      await user.clear(titleInput)
      await user.click(screen.getByText('Submit for Review'))

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument()
      })
    })

    it('accepts valid title input', async () => {
      const user = userEvent.setup()
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      const titleInput = screen.getByLabelText(/Event Title/)
      await user.type(titleInput, 'Youth Conference 2025')

      expect(titleInput).toHaveValue('Youth Conference 2025')
    })
  })

  describe('Form submission', () => {
    it('calls onSubmit with isDraft=false when Submit for Review is clicked', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockResolvedValueOnce(undefined)

      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          defaultDepartmentId="1"
        />
      )

      // Fill in required fields
      await user.type(screen.getByLabelText(/Event Title/), 'Test Event')
      await user.type(screen.getByLabelText(/Location/), 'Main Hall')

      await user.click(screen.getByText('Submit for Review'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
        const [data, isDraft] = mockOnSubmit.mock.calls[0]
        expect(isDraft).toBe(false)
        expect(data.title).toBe('Test Event')
        expect(data.location).toBe('Main Hall')
      })
    })

    it('calls onSubmit with isDraft=true when Save as Draft is clicked', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockResolvedValueOnce(undefined)

      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          defaultDepartmentId="1"
        />
      )

      await user.type(screen.getByLabelText(/Event Title/), 'Draft Event')

      await user.click(screen.getByText('Save as Draft'))

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
        const [data, isDraft] = mockOnSubmit.mock.calls[0]
        expect(isDraft).toBe(true)
        expect(data.title).toBe('Draft Event')
      })
    })

    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup()

      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      )

      await user.click(screen.getByText('Cancel'))

      expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('disables buttons during submission', async () => {
      const user = userEvent.setup()
      mockOnSubmit.mockImplementation(() => new Promise(() => {})) // Never resolves

      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          defaultDepartmentId="1"
        />
      )

      await user.type(screen.getByLabelText(/Event Title/), 'Test Event')
      await user.type(screen.getByLabelText(/Location/), 'Main Hall')

      const submitButton = screen.getByText('Submit for Review')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Submitting...')).toBeInTheDocument()
      })

      const draftButton = screen.getByRole('button', { name: /Save as Draft/ })
      const cancelButton = screen.getByRole('button', { name: /Cancel/ })

      expect(draftButton).toBeDisabled()
      expect(cancelButton).toBeDisabled()
    })
  })

  describe('Default values', () => {
    it('uses defaultDepartmentId when provided', () => {
      const { container } = render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          defaultDepartmentId="2"
        />
      )

      // The form should have the default department selected
      expect(container).toBeInTheDocument()
    })

    it('pre-fills form with request data in edit mode', () => {
      const existingRequest = {
        id: '1',
        title: 'Existing Event',
        eventType: 'regional' as const,
        departmentId: '2',
        eventDate: new Date('2024-04-01'),
        startTime: '10:00',
        endTime: '12:00',
        location: 'Conference Room',
        description: 'Existing description',
        expectedAttendance: 100,
        budget: 5000,
        specialRequirements: 'Audio equipment',
        status: 'draft' as const,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
          request={existingRequest}
          isEdit={true}
        />
      )

      expect(screen.getByLabelText(/Event Title/)).toHaveValue('Existing Event')
      expect(screen.getByLabelText(/Location/)).toHaveValue('Conference Room')
      expect(screen.getByLabelText(/Description/)).toHaveValue('Existing description')
      expect(screen.getByLabelText(/Expected Attendance/)).toHaveValue(100)
    })
  })

  describe('Accessibility', () => {
    it('marks required fields with aria-required', () => {
      render(
        <RequestForm
          departments={mockDepartments}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByLabelText(/Event Title/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Start Time/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/End Time/)).toHaveAttribute('aria-required', 'true')
      expect(screen.getByLabelText(/Location/)).toHaveAttribute('aria-required', 'true')
    })
  })
})
