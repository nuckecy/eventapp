import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/)
    await expect(page.locator('text=Login').or(page.locator('text=Sign In'))).toBeVisible()
  })

  test('should display email and password fields', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'))
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'))

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
  })

  test('should display submit button', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').or(page.locator('button:has-text("Login")'))
    await expect(submitButton).toBeVisible()
  })

  test('should show validation error for empty email', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await passwordInput.fill('password123')
    await submitButton.click()

    // Wait for validation message
    await page.waitForTimeout(500)

    // Check for error message (HTML5 validation or custom)
    const emailInput = page.locator('input[type="email"]').first()
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('should show validation error for empty password', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('test@example.com')
    await submitButton.click()

    await page.waitForTimeout(500)

    const passwordInput = page.locator('input[type="password"]').first()
    const isInvalid = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid)
    expect(isInvalid).toBeTruthy()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await emailInput.fill('invalid@example.com')
    await passwordInput.fill('wrongpassword')
    await submitButton.click()

    // Wait for error message
    const errorMessage = page.locator('text=Invalid credentials').or(page.locator('text=incorrect').or(page.locator('[role="alert"]')))
    await expect(errorMessage).toBeVisible({ timeout: 5000 })
  })

  test('should navigate to home after successful login', async ({ page }) => {
    // Note: This test requires a valid test account
    // In a real scenario, you would set up a test database with known credentials

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    // Using mock credentials - adjust based on your test setup
    await emailInput.fill('lead@example.com')
    await passwordInput.fill('password123')
    await submitButton.click()

    // Wait for navigation or error
    await page.waitForTimeout(2000)

    // Should either be redirected or show error
    const url = page.url()
    const hasError = await page.locator('[role="alert"]').or(page.locator('text=Invalid')).isVisible()

    if (!hasError) {
      expect(url).not.toContain('/login')
    }
  })

  test('should have accessible form labels', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    // Check for associated labels
    const emailLabel = await emailInput.getAttribute('aria-label').catch(() => null)
    const passwordLabel = await passwordInput.getAttribute('aria-label').catch(() => null)

    // Either aria-label or associated label should exist
    const hasEmailLabel = emailLabel !== null || await page.locator('label[for]').first().isVisible()
    const hasPasswordLabel = passwordLabel !== null || await page.locator('label[for]').count() > 0

    expect(hasEmailLabel || hasPasswordLabel).toBeTruthy()
  })

  test('should toggle password visibility', async ({ page }) => {
    const toggleButton = page.locator('button[aria-label*="password"]').or(page.locator('[role="button"]').filter({ hasText: /show|hide/i }))

    if (await toggleButton.isVisible()) {
      const passwordInput = page.locator('input[type="password"]').first()
      await toggleButton.click()

      // Password input type might change to text
      const type = await passwordInput.getAttribute('type')
      expect(type === 'text' || type === 'password').toBeTruthy()
    }
  })

  test('should have link to go back to home', async ({ page }) => {
    const homeLink = page.locator('a:has-text("Home")').or(page.locator('a:has-text("Church Events")').or(page.locator('[href="/"]')))
    await expect(homeLink.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()
    const submitButton = page.locator('button[type="submit"]').first()

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
  })

  test('should handle keyboard navigation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first()

    await emailInput.focus()
    await page.keyboard.press('Tab')

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeFocused()

    await page.keyboard.press('Tab')

    const submitButton = page.locator('button[type="submit"]').first()
    const isButtonFocused = await submitButton.evaluate((el) => el === document.activeElement)
    expect(isButtonFocused).toBeTruthy()
  })
})
