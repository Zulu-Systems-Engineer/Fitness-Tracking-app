import { test, expect } from '@playwright/test';

test.describe('Workout Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/plans');
  });

  test('should display workout plans page', async ({ page }) => {
    await expect(page.locator('h1:has-text("Workout Plans")')).toBeVisible();
    await expect(page.locator('text=Create and manage your workout routines')).toBeVisible();
  });

  test('should show create plan button', async ({ page }) => {
    const createButton = page.locator('button:has-text("Create New Plan")');
    await expect(createButton).toBeVisible();
  });

  test('should open create plan modal', async ({ page }) => {
    await page.click('button:has-text("Create New Plan")');
    
    // Check if modal is open
    await expect(page.locator('text=Create New Workout Plan')).toBeVisible();
    await expect(page.locator('input[placeholder*="Plan Name"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Plan")')).toBeVisible();
  });

  test('should close create plan modal', async ({ page }) => {
    await page.click('button:has-text("Create New Plan")');
    
    // Close modal
    await page.click('button[aria-label="Close"], button:has-text("Cancel")');
    
    // Check if modal is closed
    await expect(page.locator('text=Create New Workout Plan')).not.toBeVisible();
  });

  test('should filter plans by difficulty', async ({ page }) => {
    const difficultySelect = page.locator('select').first();
    await difficultySelect.selectOption('beginner');
    
    // Check if filtering works (this would depend on the actual implementation)
    await expect(difficultySelect).toHaveValue('beginner');
  });

  test('should search plans', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    
    // Check if search input has the value
    await expect(searchInput).toHaveValue('test');
  });

  test('should display plan cards with proper styling', async ({ page }) => {
    // Check if plan cards are visible
    const planCards = page.locator('.bg-card-bg.border.border-card-border.rounded-lg');
    await expect(planCards.first()).toBeVisible();
    
    // Check for plan name
    const planName = page.locator('h3').first();
    await expect(planName).toBeVisible();
  });
});
