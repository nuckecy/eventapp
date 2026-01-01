/**
 * API Integration Tests for Workflow State Transitions
 *
 * Tests the various status transitions in the request approval workflow
 */

describe('POST /api/requests/[id]/submit', () => {
  it('should submit draft request for review', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'submitted',
        },
      }),
    })

    const response = await fetch('/api/requests/1/submit', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('submitted')
  })

  it('should prevent submission of already submitted request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Request already submitted' }),
    })

    const response = await fetch('/api/requests/1/submit', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Request already submitted')
  })

  it('should validate request completeness before submission', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: 'Request incomplete',
        details: ['Location is required'],
      }),
    })

    const response = await fetch('/api/requests/1/submit', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(data.error).toBe('Request incomplete')
    expect(data.details).toContain('Location is required')
  })
})

describe('POST /api/requests/[id]/claim', () => {
  it('should allow admin to claim submitted request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'under_review',
          reviewerId: 'admin1',
        },
      }),
    })

    const response = await fetch('/api/requests/1/claim', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('under_review')
    expect(data.request.reviewerId).toBe('admin1')
  })

  it('should prevent claiming already claimed request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Request already claimed' }),
    })

    const response = await fetch('/api/requests/1/claim', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Request already claimed')
  })

  it('should require admin role to claim', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden: Admin role required' }),
    })

    const response = await fetch('/api/requests/1/claim', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden: Admin role required')
  })
})

describe('POST /api/requests/[id]/forward', () => {
  it('should forward request to super admin for approval', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'ready_for_approval',
        },
      }),
    })

    const response = await fetch('/api/requests/1/forward', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('ready_for_approval')
  })

  it('should require request to be under review', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Request must be under review' }),
    })

    const response = await fetch('/api/requests/1/forward', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Request must be under review')
  })

  it('should require admin role to forward', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden: Admin role required' }),
    })

    const response = await fetch('/api/requests/1/forward', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden: Admin role required')
  })
})

describe('POST /api/requests/[id]/approve', () => {
  it('should approve request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'approved',
          approvedBy: 'superadmin1',
          approvedAt: new Date().toISOString(),
        },
      }),
    })

    const response = await fetch('/api/requests/1/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Approved' }),
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('approved')
    expect(data.request.approvedBy).toBe('superadmin1')
    expect(data.request.approvedAt).toBeDefined()
  })

  it('should require super admin role to approve', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: 'Forbidden: Super Admin role required' }),
    })

    const response = await fetch('/api/requests/1/approve', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(403)
    expect(data.error).toBe('Forbidden: Super Admin role required')
  })

  it('should require request to be ready for approval', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Request must be ready for approval' }),
    })

    const response = await fetch('/api/requests/1/approve', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Request must be ready for approval')
  })
})

describe('POST /api/requests/[id]/return', () => {
  it('should return request to lead with feedback', async () => {
    const feedback = {
      message: 'Please provide more details about the event setup',
    }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'returned',
        },
      }),
    })

    const response = await fetch('/api/requests/1/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback),
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('returned')
  })

  it('should require feedback message when returning', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Feedback message is required' }),
    })

    const response = await fetch('/api/requests/1/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Feedback message is required')
  })

  it('should allow admin or super admin to return request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'returned',
        },
      }),
    })

    const response = await fetch('/api/requests/1/return', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Needs revision' }),
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.request.status).toBe('returned')
  })
})

describe('Workflow state transitions validation', () => {
  it('should prevent invalid state transitions', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid state transition' }),
    })

    // Attempting to approve a draft request
    const response = await fetch('/api/requests/1/approve', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(false)
    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid state transition')
  })

  it('should track audit trail for all transitions', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        request: {
          id: '1',
          status: 'submitted',
        },
        auditLog: {
          action: 'SUBMITTED',
          userId: 'user1',
          timestamp: new Date().toISOString(),
        },
      }),
    })

    const response = await fetch('/api/requests/1/submit', {
      method: 'POST',
    })

    const data = await response.json()

    expect(response.ok).toBe(true)
    expect(data.auditLog).toBeDefined()
    expect(data.auditLog.action).toBe('SUBMITTED')
  })
})
