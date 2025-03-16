import { test, expect } from "@playwright/test";

// Test data
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

const TEST_CATEGORY = {
  name: "Test Category",
  hourlyRate: "125",
};

const TEST_TASK = {
  title: "Test Task",
  description: "This is a test task created by automated testing",
  estimatedHours: "2.5",
};

test.describe("Mental Bank Task Manager E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the application
    await page.goto("http://localhost:5173/");
  });

  test("Authentication flow", async ({ page }) => {
    // Verify login form appears
    await expect(page.getByText("Sign In")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Try invalid login
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check for error message
    await expect(page.getByText("Invalid login credentials")).toBeVisible({
      timeout: 5000,
    });

    // Login with valid credentials
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify redirect to dashboard
    await expect(page.getByText("Mental Bank Balance")).toBeVisible({
      timeout: 5000,
    });
  });

  test("Dashboard functionality", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Verify dashboard elements
    await expect(page.getByText("Mental Bank Balance")).toBeVisible();
    await expect(page.getByText("Current Balance")).toBeVisible();
    await expect(page.getByText("Target Balance")).toBeVisible();
    await expect(page.getByText("Progress Toward Goal")).toBeVisible();

    // Edit target balance
    await page.getByRole("button", { name: "Edit target balance" }).click();
    await page.getByRole("spinbutton").clear();
    await page.getByRole("spinbutton").fill("20000");
    await page.getByRole("button", { name: "Check" }).click();

    // Verify progress charts
    await expect(page.getByText("Progress Tracking")).toBeVisible();
    await page.getByRole("tab", { name: "Weekly" }).click();
    await page.getByRole("tab", { name: "Monthly" }).click();
    await page.getByRole("tab", { name: "Daily" }).click();
  });

  test("Category management", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Navigate to Category Management
    await page.getByRole("button", { name: "Category Management" }).click();

    // Add new category
    await page.getByRole("button", { name: "Add Category" }).click();
    await page.getByLabel("Category Name").fill(TEST_CATEGORY.name);
    await page
      .getByLabel("Default Hourly Rate ($)")
      .fill(TEST_CATEGORY.hourlyRate);
    await page.getByRole("button", { name: "Create Category" }).click();

    // Verify category was added
    await expect(page.getByText(TEST_CATEGORY.name)).toBeVisible();

    // Edit category
    const editButtons = await page.getByRole("button", { name: "Edit" }).all();
    await editButtons[0].click();

    const updatedName = `${TEST_CATEGORY.name} Updated`;
    await page.getByLabel("Category Name").clear();
    await page.getByLabel("Category Name").fill(updatedName);
    await page.getByRole("button", { name: "Update Category" }).click();

    // Verify category was updated
    await expect(page.getByText(updatedName)).toBeVisible();
  });

  test("Task management", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Navigate to Task Management
    await page.getByRole("button", { name: "Task Management" }).click();

    // Add new task
    await page.getByRole("button", { name: "Add New Task" }).click();
    await page.getByLabel("Task Title").fill(TEST_TASK.title);
    await page.getByLabel("Description").fill(TEST_TASK.description);

    // Select the first category
    await page.getByRole("combobox").click();
    await page.getByRole("option").first().click();

    // Verify hourly rate was updated automatically
    const hourlyRateInput = page.getByLabel("Hourly Rate ($)");
    await expect(hourlyRateInput).toHaveValue();

    // Set estimated hours
    await page.getByLabel("Estimated Hours").fill(TEST_TASK.estimatedHours);
    await page.getByRole("button", { name: "Add Task" }).click();

    // Verify task was added
    await expect(page.getByText(TEST_TASK.title)).toBeVisible();

    // Edit task
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Edit").click();

    const updatedTitle = `${TEST_TASK.title} Updated`;
    await page.getByLabel("Task Title").clear();
    await page.getByLabel("Task Title").fill(updatedTitle);
    await page.getByRole("button", { name: "Update Task" }).click();

    // Verify task was updated
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Mark task as complete
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Mark as Complete").click();

    // Verify task status changed
    await expect(page.getByText("Completed")).toBeVisible();

    // Filter tasks
    await page.getByRole("tab", { name: "Completed" }).click();
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // Delete task
    await page.getByRole("button", { name: "Open menu" }).first().click();
    await page.getByText("Delete").click();
    await page.getByRole("button", { name: "Delete" }).click();

    // Verify task was deleted
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test("Logout functionality", async ({ page }) => {
    // Login first
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Logout
    await page.getByRole("button", { name: "" }).click(); // Avatar button
    await page.getByText("Log out").click();

    // Verify redirect to login page
    await expect(page.getByText("Sign In")).toBeVisible();
  });
});
