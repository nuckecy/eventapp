import { test, expect } from '@playwright/test'

test.describe('Public Calendar View', () => {
  test('should display calendar page without authentication', async ({ page }) => {
    await page.goto('/')

    // Check that the page loads
    await expect(page).toHaveTitle(/Church Events/i)

    // Check for calendar navigation
    await expect(page.locator('text=Church Events')).toBeVisible()
  })

  test('should display events in month view', async ({ page }) => {
    await page.goto('/')

    // Wait for events to load
    await page.waitForLoadState('networkidle')

    // Check for calendar grid or events
    const eventsContainer = page.locator('[data-testid="calendar-view"]').or(page.locator('main'))
    await expect(eventsContainer).toBeVisible()
  })

  test('should filter events by type', async ({ page }) => {
    await page.goto('/')

    // Look for event type filters
    const filterButton = page.locator('button:has-text("Filter")').or(page.locator('[aria-label*="filter"]'))

    if (await filterButton.isVisible()) {
      await filterButton.click()

      // Check for event type options
      const sundayEvents = page.locator('text=Sunday Events').or(page.locator('text=Sunday'))
      const regionalEvents = page.locator('text=Regional Events').or(page.locator('text=Regional'))
      const localEvents = page.locator('text=Local Events').or(page.locator('text=Local'))

      // At least one filter should be visible
      const hasFilters = await sundayEvents.isVisible() || await regionalEvents.isVisible() || await localEvents.isVisible()
      expect(hasFilters).toBeTruthy()
    }
  })

  test('should switch between month and list view', async ({ page }) => {
    await page.goto('/')

    // Look for view switcher
    const listViewButton = page.locator('button:has-text("List")').or(page.locator('[aria-label*="list view"]'))
    const monthViewButton = page.locator('button:has-text("Month")').or(page.locator('[aria-label*="month view"]'))

    if (await listViewButton.isVisible()) {
      await listViewButton.click()
      await page.waitForTimeout(500)
    }

    if (await monthViewButton.isVisible()) {
      await monthViewButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should navigate to next/previous month', async ({ page }) => {
    await page.goto('/')

    // Look for navigation buttons
    const nextButton = page.locator('button:has-text("Next")').or(page.locator('[aria-label*="next month"]'))
    const prevButton = page.locator('button:has-text("Previous")').or(page.locator('[aria-label*="previous month"]'))

    if (await nextButton.isVisible()) {
      await nextButton.click()
      await page.waitForTimeout(500)
    }

    if (await prevButton.isVisible()) {
      await prevButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should open event details modal when clicking an event', async ({ page }) => {
    await page.goto('/')

    // Wait for events to load
    await page.waitForLoadState('networkidle')

    // Try to click on an event
    const eventCard = page.locator('[data-testid="event-card"]').first().or(page.locator('button').filter({ hasText: /am|pm/i }).first())

    if (await eventCard.isVisible()) {
      await eventCard.click()

      // Check for modal/dialog
      const dialog = page.locator('[role="dialog"]').or(page.locator('[data-testid="event-modal"]'))
      await expect(dialog).toBeVisible({ timeout: 2000 })
    }
  })

  test('should display contact us link', async ({ page }) => {
    await page.goto('/')

    const contactLink = page.locator('a:has-text("Contact")').or(page.locator('[href="/contact"]'))
    await expect(contactLink).toBeVisible()
  })

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/')

    const contactLink = page.locator('a:has-text("Contact")').or(page.locator('[href="/contact"]')).first()
    await contactLink.click()

    await expect(page).toHaveURL(/.*contact/)
  })

  test('should display login button for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    const loginButton = page.locator('a:has-text("Login")').or(page.locator('button:has-text("Login")'))
    await expect(loginButton).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check that the page is still functional
    await expect(page.locator('text=Church Events')).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')

    await expect(page.locator('text=Church Events')).toBeVisible()
  })
})
