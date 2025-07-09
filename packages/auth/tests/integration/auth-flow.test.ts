import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { chromium, Browser, Page, BrowserContext } from 'playwright'
import crypto from 'crypto'

describe('SaSarjan Auth Integration Tests', () => {
  let browser: Browser
  let context: BrowserContext
  const testEmail = `test.${crypto.randomBytes(8).toString('hex')}@example.com`
  const testPassword = 'Test@Password123!'
  
  const apps = {
    web: 'http://localhost:3000',
    admin: 'http://localhost:3004',
    talentexcel: 'http://localhost:3001',
    sevapremi: 'http://localhost:3002',
    '10xgrowth': 'http://localhost:3003'
  }

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true })
    context = await browser.newContext({
      // Accept all cookies including third-party for cross-app testing
      acceptDownloads: true,
      ignoreHTTPSErrors: true
    })
  })

  afterAll(async () => {
    await context.close()
    await browser.close()
  })

  describe('Individual App Authentication', () => {
    it('should register and login on web app', async () => {
      const page = await context.newPage()
      
      // Navigate to registration
      await page.goto(`${apps.web}/auth/register`)
      
      // Fill registration form
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 })
      
      // Verify user is logged in
      const userEmail = await page.textContent('[data-testid="user-email"]')
      expect(userEmail).toContain(testEmail)
      
      // Check secure cookies
      const cookies = await context.cookies()
      const authCookie = cookies.find(c => c.name === 'sasarjan-auth-access')
      const refreshCookie = cookies.find(c => c.name === 'sasarjan-auth-refresh')
      const csrfCookie = cookies.find(c => c.name === 'sasarjan-auth-csrf')
      
      expect(authCookie).toBeDefined()
      expect(authCookie?.httpOnly).toBe(true)
      expect(authCookie?.secure).toBe(true)
      expect(authCookie?.sameSite).toBe('Lax')
      
      expect(refreshCookie).toBeDefined()
      expect(refreshCookie?.httpOnly).toBe(true)
      
      expect(csrfCookie).toBeDefined()
      
      await page.close()
    })

    it('should protect routes without authentication', async () => {
      const newContext = await browser.newContext()
      const page = await newContext.newPage()
      
      // Try to access protected route
      await page.goto(`${apps.web}/dashboard`)
      
      // Should redirect to login
      await page.waitForURL('**/auth/login*')
      expect(page.url()).toContain('/auth/login')
      
      await page.close()
      await newContext.close()
    })
  })

  describe('Cross-App SSO', () => {
    let webPage: Page
    let adminPage: Page
    let talentPage: Page
    
    beforeAll(async () => {
      // Create pages for each app
      webPage = await context.newPage()
      adminPage = await context.newPage()
      talentPage = await context.newPage()
    })
    
    afterAll(async () => {
      await webPage.close()
      await adminPage.close()
      await talentPage.close()
    })

    it('should sync login across all apps', async () => {
      // Login on web app
      await webPage.goto(`${apps.web}/auth/login`)
      await webPage.fill('input[name="email"]', testEmail)
      await webPage.fill('input[name="password"]', testPassword)
      await webPage.click('button[type="submit"]')
      await webPage.waitForURL('**/dashboard')
      
      // Wait for cross-app sync (usually happens within 1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check admin app - should be logged in
      await adminPage.goto(`${apps.admin}/dashboard`)
      await adminPage.waitForLoadState('networkidle')
      
      // Should not redirect to login
      expect(adminPage.url()).toContain('/dashboard')
      expect(adminPage.url()).not.toContain('/auth/login')
      
      // Check talent app - should be logged in
      await talentPage.goto(`${apps.talentexcel}/dashboard`)
      await talentPage.waitForLoadState('networkidle')
      
      // Should not redirect to login
      expect(talentPage.url()).toContain('/dashboard')
      expect(talentPage.url()).not.toContain('/auth/login')
    })

    it('should sync logout across all apps', async () => {
      // Logout from admin app
      await adminPage.goto(`${apps.admin}/dashboard`)
      await adminPage.click('[data-testid="logout-button"]')
      
      // Wait for logout to complete
      await adminPage.waitForURL('**/auth/login')
      
      // Wait for cross-app sync
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check web app - should be logged out
      await webPage.goto(`${apps.web}/dashboard`)
      await webPage.waitForURL('**/auth/login*')
      expect(webPage.url()).toContain('/auth/login')
      
      // Check talent app - should be logged out
      await talentPage.goto(`${apps.talentexcel}/dashboard`)
      await talentPage.waitForURL('**/auth/login*')
      expect(talentPage.url()).toContain('/auth/login')
    })
  })

  describe('Security Features', () => {
    it('should rotate tokens automatically', async () => {
      const page = await context.newPage()
      
      // Login
      await page.goto(`${apps.web}/auth/login`)
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/dashboard')
      
      // Get initial token
      const initialCookies = await context.cookies()
      const initialToken = initialCookies.find(c => c.name === 'sasarjan-auth-access')?.value
      
      // Wait for token rotation (simulate 80% of token lifetime)
      // In real tests, you'd mock time or wait for actual rotation
      await page.evaluate(() => {
        // Trigger token refresh manually for testing
        window.dispatchEvent(new Event('sasarjan-auth-refresh'))
      })
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get new token
      const newCookies = await context.cookies()
      const newToken = newCookies.find(c => c.name === 'sasarjan-auth-access')?.value
      
      // Tokens should be different after rotation
      expect(newToken).toBeDefined()
      expect(newToken).not.toBe(initialToken)
      
      await page.close()
    })

    it('should validate CSRF tokens on API requests', async () => {
      const page = await context.newPage()
      
      // Login first
      await page.goto(`${apps.web}/auth/login`)
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/dashboard')
      
      // Get CSRF token
      const cookies = await context.cookies()
      const csrfToken = cookies.find(c => c.name === 'sasarjan-auth-csrf')?.value
      
      // Make API request without CSRF token
      const responseWithoutCSRF = await page.evaluate(async () => {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: 'Test User' })
        })
        return { status: response.status }
      })
      
      // Should fail without CSRF token
      expect(responseWithoutCSRF.status).toBe(403)
      
      // Make API request with CSRF token
      const responseWithCSRF = await page.evaluate(async (token) => {
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': token
          },
          body: JSON.stringify({ full_name: 'Test User' })
        })
        return { status: response.status }
      }, csrfToken!)
      
      // Should succeed with CSRF token
      expect(responseWithCSRF.status).toBe(200)
      
      await page.close()
    })

    it('should verify HMAC signatures in cross-app messages', async () => {
      const page = await context.newPage()
      
      // Enable console logging to capture cross-app sync messages
      const consoleLogs: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'log') {
          consoleLogs.push(msg.text())
        }
      })
      
      // Login to trigger cross-app sync
      await page.goto(`${apps.web}/auth/login`)
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/dashboard')
      
      // Wait for sync messages
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check for HMAC verification logs
      const hmacLogs = consoleLogs.filter(log => log.includes('HMAC signature verified'))
      expect(hmacLogs.length).toBeGreaterThan(0)
      
      // Check for any HMAC failures
      const hmacFailures = consoleLogs.filter(log => log.includes('HMAC verification failed'))
      expect(hmacFailures.length).toBe(0)
      
      await page.close()
    })
  })

  describe('API Protection', () => {
    it('should protect API routes with JWT', async () => {
      const page = await context.newPage()
      
      // Try to access protected API without auth
      const unauthorizedResponse = await page.evaluate(async () => {
        const response = await fetch('/api/user/profile')
        return { 
          status: response.status,
          body: await response.json()
        }
      })
      
      expect(unauthorizedResponse.status).toBe(401)
      expect(unauthorizedResponse.body.error).toContain('Unauthorized')
      
      // Login
      await page.goto(`${apps.web}/auth/login`)
      await page.fill('input[name="email"]', testEmail)
      await page.fill('input[name="password"]', testPassword)
      await page.click('button[type="submit"]')
      await page.waitForURL('**/dashboard')
      
      // Access protected API with auth
      const authorizedResponse = await page.evaluate(async () => {
        const response = await fetch('/api/user/profile')
        return { 
          status: response.status,
          body: await response.json()
        }
      })
      
      expect(authorizedResponse.status).toBe(200)
      expect(authorizedResponse.body.user.email).toBe(testEmail)
      
      await page.close()
    })
  })
})