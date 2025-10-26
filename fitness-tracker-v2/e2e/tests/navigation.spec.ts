import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to all main pages', async ({ page }) => {
    // Start at login page
    await page.goto('/');
    
    // Navigate to each main page
    const pages = [
      { path: '/plans', title: 'Workout Plans' },
      { path: '/track', title: 'Workout Tracking' },
      { path: '/goals', title: 'Goals' },
      { path: '/records', title: 'Personal Records' },
      { path: '/analytics', title: 'Analytics' },
    ];

    for (const { path, title } of pages) {
      await page.goto(path);
      
      // Check if the page title is correct - use more specific selector
      await expect(page.locator(`h1:has-text("${title}")`)).toBeVisible();
      
      // Check if the page content is visible
      await expect(page.locator('main, .min-h-screen')).toBeVisible();
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/plans');
    
    // Check if the page is responsive - use more specific selector
    const header = page.locator('h1:has-text("Workout Plans")');
    await expect(header).toBeVisible();
    
    // Check if filters stack vertically on mobile
    const filtersContainer = page.locator('.flex-col.lg\\:flex-row');
    await expect(filtersContainer).toBeVisible();
  });

  test('should have consistent styling across pages', async ({ page }) => {
    const pages = ['/plans', '/track', '/goals', '/records', '/analytics'];
    
    for (const path of pages) {
      await page.goto(path);
      
      // Check for consistent header styling - use first h1 element
      const header = page.locator('h1').first();
      await expect(header).toHaveClass(/text-.*xl.*font-bold/);
      
      // Check for card styling
      const cards = page.locator('.bg-card-bg.border.border-card-border.rounded-lg');
      await expect(cards.first()).toBeVisible();
    }
  });
});
