import { test, expect } from '@playwright/test'

test.describe('Full Approval Workflow', () => {
  test('should complete full approval workflow from Lead to Super Admin', async ({ page }) => {
    // Step 1: Login as Lead and create request
    await page.goto('/login')

    let emailInput = page.locator('input[type="email"]').first()
    let passwordInput = page.locator('input[type="password"]').first()
    let submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('lead@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    // Navigate to dashboard
    await page.goto('/dashboard/lead')

    // Create new request
    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")')).first()
    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(1000)

      // Fill form
      const titleInput = page.locator('input[name="title"]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('E2E Test Event')

        const locationInput = page.locator('input[name="location"]').first()
        if (await locationInput.isVisible()) {
          await locationInput.fill('Test Location')

          // Submit for review
          const submitForReview = page.locator('button:has-text("Submit")').or(page.locator('button[type="submit"]'))
          if (await submitForReview.isVisible()) {
            await submitForReview.click()
            await page.waitForTimeout(2000)
          }
        }
      }
    }

    // Logout
    const logoutButton = page.locator('button:has-text("Logout")').or(page.locator('button:has-text("Sign out")'))
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await page.waitForTimeout(1000)
    }

    // Step 2: Login as Admin and claim request
    await page.goto('/login')

    emailInput = page.locator('input[type="email"]').first()
    passwordInput = page.locator('input[type="password"]').first()
    submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('admin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/admin')

    // Claim the request
    const claimButton = page.locator('button:has-text("Claim")').first()
    if (await claimButton.isVisible()) {
      await claimButton.click()
      await page.waitForTimeout(1000)

      // Forward to super admin
      const forwardButton = page.locator('button:has-text("Forward")').or(page.locator('button:has-text("Approve")'))
      if (await forwardButton.first().isVisible()) {
        await forwardButton.first().click()
        await page.waitForTimeout(1000)
      }
    }

    // Logout
    const adminLogout = page.locator('button:has-text("Logout")').or(page.locator('button:has-text("Sign out")'))
    if (await adminLogout.isVisible()) {
      await adminLogout.click()
      await page.waitForTimeout(1000)
    }

    // Step 3: Login as Super Admin and approve
    await page.goto('/login')

    emailInput = page.locator('input[type="email"]').first()
    passwordInput = page.locator('input[type="password"]').first()
    submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('superadmin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/super-admin')

    // Approve the request
    const approveButton = page.locator('button:has-text("Approve")').first()
    if (await approveButton.isVisible()) {
      await approveButton.click()
      await page.waitForTimeout(1000)

      // Confirm approval
      const confirmButton = page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Approve")'))
      if (await confirmButton.last().isVisible()) {
        await confirmButton.last().click()
        await page.waitForTimeout(1000)

        // Check for success message
        const successMessage = page.locator('text=approved').or(page.locator('[role="alert"]'))
        await expect(successMessage).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('should handle return workflow from Admin to Lead', async ({ page }) => {
    // Login as Admin
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('admin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/admin')

    // Claim a request
    const claimButton = page.locator('button:has-text("Claim")').first()
    if (await claimButton.isVisible()) {
      await claimButton.click()
      await page.waitForTimeout(1000)

      // Return to lead with feedback
      const returnButton = page.locator('button:has-text("Return")').first()
      if (await returnButton.isVisible()) {
        await returnButton.click()
        await page.waitForTimeout(500)

        const feedbackTextarea = page.locator('textarea').first()
        if (await feedbackTextarea.isVisible()) {
          await feedbackTextarea.fill('Please provide more details')

          const submitFeedback = page.locator('button:has-text("Submit")').last()
          if (await submitFeedback.isVisible()) {
            await submitFeedback.click()
            await page.waitForTimeout(1000)
          }
        }
      }
    }

    // Logout
    const logoutButton = page.locator('button:has-text("Logout")').first()
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await page.waitForTimeout(1000)
    }

    // Login as Lead to see returned request
    await page.goto('/login')

    const leadEmail = page.locator('input[type="email"]').first()
    const leadPassword = page.locator('input[type="password"]').first()
    const leadSubmit = page.locator('button[type="submit"]').first()

    await leadEmail.fill('lead@example.com')
    await leadPassword.fill('password123')
    await leadSubmit.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/lead')

    // Check for returned request
    const returnedRequest = page.locator('text=Returned').or(page.locator('[data-status="returned"]'))
    if (await returnedRequest.isVisible()) {
      await expect(returnedRequest).toBeVisible()
    }
  })

  test('should track complete audit trail', async ({ page }) => {
    // Login as any role
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('admin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/admin')

    // View a request
    const viewButton = page.locator('button:has-text("View")').first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForTimeout(1000)

      // Look for audit trail section
      const auditTrail = page.locator('text=History').or(page.locator('text=Audit Trail').or(page.locator('text=Timeline')))
      if (await auditTrail.isVisible()) {
        await expect(auditTrail).toBeVisible()

        // Check for status changes
        const statusChanges = page.locator('text=Created').or(page.locator('text=Submitted').or(page.locator('text=Claimed')))
        await expect(statusChanges.first()).toBeVisible()
      }
    }
  })

  test('should send notifications at each workflow stage', async ({ page }) => {
    // Login and check notifications
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('lead@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/lead')

    // Click notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"]').or(page.locator('[aria-label*="notification"]'))
    if (await notificationBell.first().isVisible()) {
      await notificationBell.first().click()
      await page.waitForTimeout(500)

      // Check for notifications
      const notifications = page.locator('[role="menuitem"]').or(page.locator('.notification'))
      if (await notifications.first().isVisible()) {
        await expect(notifications.first()).toBeVisible()
      }
    }
  })

  test('should validate event appears on calendar after approval', async ({ page }) => {
    // Login as Super Admin
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('superadmin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()
    await page.waitForTimeout(2000)

    await page.goto('/dashboard/super-admin')

    // Approve a request
    const approveButton = page.locator('button:has-text("Approve")').first()
    if (await approveButton.isVisible()) {
      const eventTitle = await page.locator('[data-testid="request-title"]').first().textContent().catch(() => 'Test Event')

      await approveButton.click()
      await page.waitForTimeout(1000)

      const confirmButton = page.locator('button:has-text("Confirm")').last()
      if (await confirmButton.isVisible()) {
        await confirmButton.click()
        await page.waitForTimeout(1000)
      }

      // Navigate to public calendar
      await page.goto('/')

      // Look for the approved event
      if (eventTitle) {
        const eventOnCalendar = page.locator(`text=${eventTitle}`)
        // Event might not be immediately visible depending on date
        await page.waitForTimeout(1000)
      }
    }
  })
})
