import { test, expect } from "@playwright/test";

// Test data
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

test.describe("Mental Bank Growth Visualization E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the application
    await page.goto("http://localhost:5173/");

    // Login
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for dashboard to load
    await expect(page.getByText("Mental Bank Balance")).toBeVisible({
      timeout: 5000,
    });

    // Navigate to Mental Bank Growth tab
    await page.getByText("Mental Bank Growth").click();

    // Verify the Growth component is loaded
    await expect(page.getByText("Mental Bank Growth")).toBeVisible();
  });

  test("Display growth chart and time range filters", async ({ page }) => {
    // Verify time range filters are present
    await expect(page.getByText("1 Month")).toBeVisible();
    await expect(page.getByText("3 Months")).toBeVisible();
    await expect(page.getByText("6 Months")).toBeVisible();
    await expect(page.getByText("1 Year")).toBeVisible();
    await expect(page.getByText("All Time")).toBeVisible();

    // Verify chart is visible
    const chart = page.locator(".recharts-wrapper");
    await expect(chart).toBeVisible();

    // Test time range filter functionality
    await page.getByText("1 Month").click();
    await expect(chart).toBeVisible();

    await page.getByText("6 Months").click();
    await expect(chart).toBeVisible();

    await page.getByText("All Time").click();
    await expect(chart).toBeVisible();
  });

  test("View milestones and achievements tab", async ({ page }) => {
    // Verify tabs are present
    await expect(
      page.getByRole("tab", { name: "Milestones & Achievements" }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Growth Statistics" }),
    ).toBeVisible();

    // Verify milestone cards are visible
    const milestoneCards = page.locator(
      ".grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3",
    );
    await expect(milestoneCards).toBeVisible();

    // Check for milestone content
    await expect(page.getByText("Milestone", { exact: false })).toBeVisible();
    await expect(page.getByText("Achievement", { exact: false })).toBeVisible();
  });

  test("View growth statistics tab", async ({ page }) => {
    // Switch to Growth Statistics tab
    await page.getByRole("tab", { name: "Growth Statistics" }).click();

    // Verify statistics are visible
    await expect(page.getByText("Starting Balance")).toBeVisible();
    await expect(page.getByText("Current Balance")).toBeVisible();
    await expect(page.getByText("Growth")).toBeVisible();

    // Verify growth milestones table is visible
    await expect(page.getByText("Growth Milestones")).toBeVisible();
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.getByText("Date", { exact: true })).toBeVisible();
    await expect(page.getByText("Balance", { exact: true })).toBeVisible();
    await expect(page.getByText("Milestone", { exact: true })).toBeVisible();
    await expect(page.getByText("Type", { exact: true })).toBeVisible();
  });

  test("Interact with chart tooltips", async ({ page }) => {
    // Hover over a point in the chart to show tooltip
    const chart = page.locator(".recharts-wrapper");
    await chart.hover({ position: { x: 300, y: 150 } });

    // Wait for tooltip to appear
    await page.waitForTimeout(500);

    // Try to find a milestone point by changing time range and hovering at different positions
    await page.getByText("All Time").click();

    // Try multiple positions to find a milestone point
    const positions = [
      { x: 100, y: 150 },
      { x: 200, y: 150 },
      { x: 300, y: 150 },
      { x: 400, y: 150 },
      { x: 500, y: 150 },
    ];

    for (const position of positions) {
      await chart.hover({ position });
      await page.waitForTimeout(300);

      // Check if tooltip is visible
      const tooltip = page.locator(".recharts-tooltip-wrapper");
      const isVisible = await tooltip.isVisible();

      if (isVisible) {
        // Verify tooltip content
        const tooltipText = await page
          .locator(".recharts-tooltip-wrapper")
          .textContent();
        console.log("Found tooltip with text:", tooltipText);
        break;
      }
    }
  });

  test("Demo page functionality", async ({ page }) => {
    // Navigate to the demo page
    await page.goto(
      "http://localhost:5173/tempobook/storyboards/MentalBankGrowthDemo",
    );

    // Verify the demo page loads
    await expect(
      page.getByText("Mental Bank Growth Visualization"),
    ).toBeVisible();

    // Verify chart is visible
    const chart = page.locator(".recharts-wrapper");
    await expect(chart).toBeVisible();

    // Test time range filter functionality
    await page.getByText("1 Month").click();
    await expect(chart).toBeVisible();

    // Switch to Growth Statistics tab
    await page.getByRole("tab", { name: "Growth Statistics" }).click();

    // Verify statistics are visible
    await expect(page.getByText("Starting Balance")).toBeVisible();
    await expect(page.getByText("Current Balance")).toBeVisible();
    await expect(page.getByText("Growth")).toBeVisible();
  });
});
