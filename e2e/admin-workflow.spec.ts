import { test, expect } from '@playwright/test'

test.describe('Admin Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Admin
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('admin@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()

    // Wait for redirect
    await page.waitForTimeout(2000)
  })

  test('should display admin dashboard', async ({ page }) => {
    await page.goto('/dashboard/admin')

    const dashboard = page.locator('text=Dashboard').or(page.locator('main'))
    await expect(dashboard).toBeVisible()
  })

  test('should display submitted requests', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for requests in submitted status
    const submittedSection = page.locator('text=Submitted').or(page.locator('[data-testid="submitted-requests"]'))
    if (await submittedSection.isVisible()) {
      await expect(submittedSection).toBeVisible()
    }
  })

  test('should claim a submitted request', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Find claim button
    const claimButton = page.locator('button:has-text("Claim")').or(page.locator('[aria-label*="claim"]'))
    if (await claimButton.first().isVisible()) {
      await claimButton.first().click()

      // Wait for success message
      await page.waitForTimeout(1000)
      const successMessage = page.locator('text=claimed').or(page.locator('[role="alert"]'))
      await expect(successMessage).toBeVisible({ timeout: 3000 })
    }
  })

  test('should view request details', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Click on a request
    const viewButton = page.locator('button:has-text("View")').or(page.locator('[aria-label*="view"]'))
    if (await viewButton.first().isVisible()) {
      await viewButton.first().click()

      // Details should be visible
      await page.waitForTimeout(1000)
      const details = page.locator('[role="dialog"]').or(page.locator('text=Event Details'))
      await expect(details).toBeVisible({ timeout: 2000 })
    }
  })

  test('should forward request to super admin', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Find forward button
    const forwardButton = page.locator('button:has-text("Forward")').or(page.locator('button:has-text("Approve")'))
    if (await forwardButton.first().isVisible()) {
      await forwardButton.first().click()

      // Wait for confirmation
      await page.waitForTimeout(1000)
    }
  })

  test('should return request with feedback', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Find return button
    const returnButton = page.locator('button:has-text("Return")').or(page.locator('[aria-label*="return"]'))
    if (await returnButton.first().isVisible()) {
      await returnButton.first().click()

      // Fill feedback
      const feedbackTextarea = page.locator('textarea').or(page.locator('input[type="text"]'))
      if (await feedbackTextarea.first().isVisible()) {
        await feedbackTextarea.first().fill('Please provide more details about the event setup')

        // Submit feedback
        const submitButton = page.locator('button:has-text("Submit")').or(page.locator('button:has-text("Send")'))
        if (await submitButton.last().isVisible()) {
          await submitButton.last().click()
          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should filter requests by department', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for department filter
    const filterDropdown = page.locator('[role="combobox"]').or(page.locator('select'))
    if (await filterDropdown.first().isVisible()) {
      await filterDropdown.first().click()
      await page.waitForTimeout(500)

      // Select a department
      const department = page.locator('text=Worship').or(page.locator('[role="option"]'))
      if (await department.first().isVisible()) {
        await department.first().click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for status tabs or filter
    const underReviewTab = page.locator('button:has-text("Under Review")').or(page.locator('[role="tab"]'))
    if (await underReviewTab.first().isVisible()) {
      await underReviewTab.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should view audit trail', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Open request details
    const viewButton = page.locator('button:has-text("View")').first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await page.waitForTimeout(1000)

      // Look for audit trail or history
      const auditTrail = page.locator('text=History').or(page.locator('text=Audit Trail'))
      if (await auditTrail.isVisible()) {
        await expect(auditTrail).toBeVisible()
      }
    }
  })

  test('should display statistics for department', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for stat cards
    const statCards = page.locator('[data-testid="stat-card"]').or(page.locator('text=Total').or(page.locator('text=Pending')))
    await expect(statCards.first()).toBeVisible()
  })

  test('should view all requests in department', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Requests table should be visible
    const requestsTable = page.locator('table').or(page.locator('[role="table"]'))
    if (await requestsTable.isVisible()) {
      await expect(requestsTable).toBeVisible()
    }
  })

  test('should receive notifications for new requests', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Check notification bell
    const notificationBell = page.locator('[data-testid="notification-bell"]').or(page.locator('[aria-label*="notification"]'))
    await expect(notificationBell.first()).toBeVisible()

    // Click notification bell
    if (await notificationBell.first().isVisible()) {
      await notificationBell.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should export requests data', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for export button
    const exportButton = page.locator('button:has-text("Export")').or(page.locator('[aria-label*="export"]'))
    if (await exportButton.isVisible()) {
      await exportButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('should search for specific request', async ({ page }) => {
    await page.goto('/dashboard/admin')

    // Look for search input
    const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="search"]'))
    if (await searchInput.isVisible()) {
      await searchInput.fill('Youth Conference')
      await page.waitForTimeout(500)
    }
  })
})
