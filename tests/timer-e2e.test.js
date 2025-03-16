import { test, expect } from "@playwright/test";

// Test data
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

const TEST_TASK = {
  title: "Test Time Tracking Task",
  description: "This is a task to test the time tracking feature",
  category: "Work",
  hourlyRate: "100",
  estimatedHours: "2",
  priority: "medium",
};

test.describe("Task Timer Feature E2E Tests", () => {
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
  });

  test("Create a task and track time with the timer", async ({ page }) => {
    // Create a new task
    await page.getByRole("button", { name: "Add New Task" }).click();
    await page.getByLabel("Task Title").fill(TEST_TASK.title);
    await page.getByLabel("Description").fill(TEST_TASK.description);

    // Select the first category in the dropdown
    await page.getByRole("combobox").first().click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Hourly Rate ($)").fill(TEST_TASK.hourlyRate);
    await page.getByLabel("Estimated Hours").fill(TEST_TASK.estimatedHours);
    await page.getByRole("button", { name: "Add Task" }).click();

    // Verify task was created
    await expect(page.getByText(TEST_TASK.title)).toBeVisible();

    // Show timer
    await page.getByRole("button", { name: "Show Timer" }).click();
    await expect(
      page.getByText("Select a task to start tracking time"),
    ).toBeVisible();

    // Start timer for the task
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Start Timer").click();

    // Verify task details appear in timer
    await expect(page.getByText(TEST_TASK.title).first()).toBeVisible();

    // Check timer display is at 00:00:00
    const timerDisplay = page.locator("text=00:00:00");
    await expect(timerDisplay).toBeVisible();

    // Start the timer
    await page.getByRole("button", { name: "Start" }).click();

    // Wait for a few seconds to let the timer run
    await page.waitForTimeout(3000);

    // Verify timer is running (no longer at 00:00:00)
    await expect(timerDisplay).not.toBeVisible();

    // Pause the timer
    await page.getByRole("button", { name: "Pause" }).click();

    // Get the current time value
    const timeValue = await page
      .locator(".text-4xl.font-mono.font-bold")
      .textContent();
    console.log(`Timer paused at: ${timeValue}`);

    // Stop the timer
    await page.getByRole("button", { name: "Stop" }).click();

    // Verify save prompt appears
    await expect(
      page
        .getByText("Save", { exact: false })
        .filter({ hasText: "to this task?" }),
    ).toBeVisible();

    // Save the time
    await page.getByRole("button", { name: "Save Time" }).click();

    // Verify time was saved
    await expect(page.getByText("saved to this task")).toBeVisible();

    // Hide timer
    await page.getByRole("button", { name: "Hide Timer" }).click();
    await expect(
      page.locator(".text-4xl.font-mono.font-bold"),
    ).not.toBeVisible();

    // Edit the task to verify time was logged
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Edit").click();

    // Verify the task edit form shows
    await expect(page.getByText("Edit Task")).toBeVisible();

    // Close the edit dialog
    await page.keyboard.press("Escape");
  });

  test("Timer demo page functionality", async ({ page }) => {
    // Navigate to the timer demo page
    await page.goto(
      "http://localhost:5173/tempobook/storyboards/TaskTimerDemo",
    );

    // Verify the demo page loads
    await expect(page.getByText("Task Timer Demo")).toBeVisible();

    // Select a task
    await page.getByText("Complete project proposal").click();

    // Verify task details appear in timer
    await expect(
      page.getByText("Complete project proposal").nth(1),
    ).toBeVisible();

    // Start the timer
    await page.getByRole("button", { name: "Start" }).click();

    // Wait for a few seconds to let the timer run
    await page.waitForTimeout(3000);

    // Pause the timer
    await page.getByRole("button", { name: "Pause" }).click();

    // Stop the timer
    await page.getByRole("button", { name: "Stop" }).click();

    // Verify save prompt appears
    await expect(
      page
        .getByText("Save", { exact: false })
        .filter({ hasText: "to this task?" }),
    ).toBeVisible();

    // Save the time
    await page.getByRole("button", { name: "Save Time" }).click();

    // Verify time was saved
    await expect(page.getByText("saved to this task")).toBeVisible();

    // Select a different task
    await page.getByText("Morning meditation").click();

    // Verify timer resets
    await expect(page.getByText("00:00:00")).toBeVisible();
  });

  test("Timer edge cases", async ({ page }) => {
    // Show timer without selecting a task
    await page.getByRole("button", { name: "Show Timer" }).click();

    // Verify empty state message
    await expect(
      page.getByText("Select a task to start tracking time"),
    ).toBeVisible();

    // Create a new task and mark it as completed
    await page.getByRole("button", { name: "Add New Task" }).click();
    await page.getByLabel("Task Title").fill("Completed Task");

    // Select the first category in the dropdown
    await page.getByRole("combobox").first().click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Hourly Rate ($)").fill("50");
    await page.getByLabel("Estimated Hours").fill("1");

    // Set status to completed
    await page.getByRole("combobox").nth(2).click();
    await page.getByRole("option", { name: "Completed" }).click();

    await page.getByRole("button", { name: "Add Task" }).click();

    // Verify completed task was created
    await page.getByRole("tab", { name: "Completed" }).click();
    await expect(page.getByText("Completed Task")).toBeVisible();

    // Verify Start Timer option is not available for completed tasks
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await expect(page.getByText("Start Timer")).not.toBeVisible();

    // Close dropdown
    await page.keyboard.press("Escape");

    // Go back to pending tasks
    await page.getByRole("tab", { name: "Pending" }).click();

    // Create a task with very small time tracking
    await page.getByRole("button", { name: "Add New Task" }).click();
    await page.getByLabel("Task Title").fill("Quick Task");

    // Select the first category in the dropdown
    await page.getByRole("combobox").first().click();
    await page.getByRole("option").first().click();

    await page.getByLabel("Hourly Rate ($)").fill("200");
    await page.getByLabel("Estimated Hours").fill("0.1");
    await page.getByRole("button", { name: "Add Task" }).click();

    // Start timer for the quick task
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Start Timer").click();

    // Start and immediately stop the timer
    await page.getByRole("button", { name: "Start" }).click();
    await page.waitForTimeout(500); // Just a short time
    await page.getByRole("button", { name: "Stop" }).click();

    // Save the very small amount of time
    await page.getByRole("button", { name: "Save Time" }).click();

    // Verify even small amounts of time can be saved
    await expect(page.getByText("saved to this task")).toBeVisible();
  });
});
