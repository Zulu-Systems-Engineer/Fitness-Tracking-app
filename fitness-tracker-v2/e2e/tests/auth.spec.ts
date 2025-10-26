import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page by default', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're on the login page - use more specific selector
    await expect(page.locator('h1:has-text("LOGIN")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('LOG IN');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    
    // Click on sign up link
    await page.click('text=Sign up');
    
    // Check if we're on the signup page - use more specific selector
    await expect(page.locator('h1:has-text("SIGN UP")')).toBeVisible();
    await expect(page.locator('input[placeholder*="Full Name"]')).toBeVisible();
  });

  test('should navigate back to login from signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Click on login link
    await page.click('text=Login');
    
    // Check if we're back on the login page - use more specific selector
    await expect(page.locator('h1:has-text("LOGIN")')).toBeVisible();
  });

  test('should have glassmorphism styling on login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for glassmorphism container
    const glassmorphismContainer = page.locator('.glassmorphism');
    await expect(glassmorphismContainer).toBeVisible();
    
    // Check for gradient background
    const gradientBg = page.locator('.gradient-bg');
    await expect(gradientBg).toBeVisible();
  });

  test('should have fitness image on login page', async ({ page }) => {
    await page.goto('/');
    
    // Check for fitness image
    const fitnessImage = page.locator('img[alt*="fitness"]');
    await expect(fitnessImage).toBeVisible();
  });
});
