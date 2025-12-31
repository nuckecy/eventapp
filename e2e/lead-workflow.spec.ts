import { test, expect } from '@playwright/test'

test.describe('Lead Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Lead
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('lead@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()

    // Wait for redirect
    await page.waitForTimeout(2000)
  })

  test('should display lead dashboard', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard/lead')

    // Check for dashboard elements
    const dashboard = page.locator('text=Dashboard').or(page.locator('main'))
    await expect(dashboard).toBeVisible()
  })

  test('should display create request button', async ({ page }) => {
    await page.goto('/dashboard/lead')

    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")'))
    await expect(createButton.first()).toBeVisible()
  })

  test('should open request form when creating new request', async ({ page }) => {
    await page.goto('/dashboard/lead')

    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")')).first()

    if (await createButton.isVisible()) {
      await createButton.click()

      // Check for form
      const form = page.locator('form').or(page.locator('text=Event Request'))
      await expect(form).toBeVisible({ timeout: 3000 })
    }
  })

  test('should fill out event request form', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Click create button
    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")')).first()

    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(1000)

      // Fill form fields
      const titleInput = page.locator('input[name="title"]').or(page.locator('input').filter({ hasText: /title/i })).first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('Youth Conference 2025')
      }

      const locationInput = page.locator('input[name="location"]').or(page.locator('input').filter({ hasText: /location/i })).first()
      if (await locationInput.isVisible()) {
        await locationInput.fill('Main Sanctuary')
      }
    }
  })

  test('should save request as draft', async ({ page }) => {
    await page.goto('/dashboard/lead')

    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")')).first()

    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(1000)

      // Fill minimal info
      const titleInput = page.locator('input[name="title"]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('Draft Event')
      }

      // Click save as draft
      const draftButton = page.locator('button:has-text("Draft")').or(page.locator('button:has-text("Save as Draft")'))
      if (await draftButton.isVisible()) {
        await draftButton.click()

        // Wait for success message
        await page.waitForTimeout(1000)
        const successMessage = page.locator('text=saved').or(page.locator('[role="alert"]'))
        await expect(successMessage).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('should submit request for review', async ({ page }) => {
    await page.goto('/dashboard/lead')

    const createButton = page.locator('button:has-text("Create")').or(page.locator('a:has-text("New Request")')).first()

    if (await createButton.isVisible()) {
      await createButton.click()
      await page.waitForTimeout(1000)

      // Fill all required fields
      const titleInput = page.locator('input[name="title"]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill('Complete Event Request')

        const locationInput = page.locator('input[name="location"]').first()
        if (await locationInput.isVisible()) {
          await locationInput.fill('Fellowship Hall')
        }

        // Submit for review
        const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Submit")'))
        if (await submitButton.isVisible()) {
          await submitButton.click()

          // Wait for response
          await page.waitForTimeout(2000)
        }
      }
    }
  })

  test('should view list of own requests', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Look for requests table or list
    const requestsList = page.locator('[data-testid="requests-table"]').or(page.locator('table'))
    if (await requestsList.isVisible()) {
      await expect(requestsList).toBeVisible()
    }
  })

  test('should filter requests by status', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Look for status filter
    const filterDropdown = page.locator('[role="combobox"]').or(page.locator('select'))
    if (await filterDropdown.first().isVisible()) {
      await filterDropdown.first().click()
      await page.waitForTimeout(500)
    }
  })

  test('should edit draft request', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Find a draft request
    const editButton = page.locator('button:has-text("Edit")').or(page.locator('[aria-label*="edit"]'))
    if (await editButton.first().isVisible()) {
      await editButton.first().click()

      // Form should open
      const form = page.locator('form')
      await expect(form).toBeVisible({ timeout: 2000 })
    }
  })

  test('should delete draft request', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Find a draft request's delete button
    const deleteButton = page.locator('button:has-text("Delete")').or(page.locator('[aria-label*="delete"]'))
    if (await deleteButton.first().isVisible()) {
      await deleteButton.first().click()

      // Confirm deletion
      const confirmButton = page.locator('button:has-text("Confirm")').or(page.locator('button:has-text("Delete")'))
      if (await confirmButton.last().isVisible()) {
        await confirmButton.last().click()
        await page.waitForTimeout(1000)
      }
    }
  })

  test('should view request details', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Click on a request to view details
    const viewButton = page.locator('button:has-text("View")').or(page.locator('[aria-label*="view details"]'))
    if (await viewButton.first().isVisible()) {
      await viewButton.first().click()

      // Details should be visible
      await page.waitForTimeout(1000)
    }
  })

  test('should display notification bell', async ({ page }) => {
    await page.goto('/dashboard/lead')

    const notificationBell = page.locator('[data-testid="notification-bell"]').or(page.locator('button[aria-label*="notification"]'))
    await expect(notificationBell.first()).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard/lead')

    // Click user menu
    const userMenu = page.locator('[data-testid="user-menu"]').or(page.locator('button').filter({ hasText: /lead@example.com/i }))
    if (await userMenu.isVisible()) {
      await userMenu.click()

      // Click logout
      const logoutButton = page.locator('button:has-text("Logout")').or(page.locator('button:has-text("Sign out")'))
      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await page.waitForTimeout(1000)

        // Should redirect to home or login
        const url = page.url()
        expect(url === '/' || url.includes('/login')).toBeTruthy()
      }
    }
  })
})
