import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

// Test data
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
};

// Test file paths
const downloadsFolder = path.join(process.cwd(), "test-results", "downloads");
const testJsonFile = path.join(process.cwd(), "test-data", "test-import.json");
const testCsvFile = path.join(process.cwd(), "test-data", "test-import.csv");

test.describe("Data Export & Import Feature E2E Tests", () => {
  // Setup: Create test directories if they don't exist
  test.beforeAll(async () => {
    // Ensure downloads folder exists
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder, { recursive: true });
    }

    // Ensure test-data folder exists
    const testDataFolder = path.join(process.cwd(), "test-data");
    if (!fs.existsSync(testDataFolder)) {
      fs.mkdirSync(testDataFolder, { recursive: true });
    }

    // Create a sample JSON file for import testing
    const sampleJsonData = {
      tasks: [
        {
          id: "test-task-1",
          title: "Test Import Task",
          description: "This task was imported from a test file",
          category: "1",
          hourlyRate: 100,
          estimatedHours: 2,
          completed: false,
          createdAt: new Date().toISOString(),
          priority: "medium",
        },
      ],
      categories: [
        {
          id: "test-category-1",
          name: "Test Import Category",
          hourlyRate: 85,
          tasksCount: 1,
        },
      ],
      balance: {
        currentBalance: 5000,
        targetBalance: 15000,
        progressPercentage: 33,
        dailyGrowth: 4.5,
      },
    };

    fs.writeFileSync(testJsonFile, JSON.stringify(sampleJsonData, null, 2));

    // Create a sample CSV file for import testing
    const sampleCsvData = `TASKS
    id,title,description,category,hourlyRate,estimatedHours,completed,createdAt,priority
    test-task-csv,CSV Import Task,This task was imported from a CSV file,1,120,3,false,${new Date().toISOString()},high
    
    CATEGORIES
    id,name,hourlyRate,tasksCount
    test-category-csv,CSV Import Category,95,1
    
    BALANCE
    currentBalance,targetBalance,progressPercentage,dailyGrowth
    6000,18000,33,5.0
    `;

    fs.writeFileSync(testCsvFile, sampleCsvData);
  });

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

    // Navigate to Export/Import Data tab
    await page.getByText("Export/Import Data").click();

    // Verify the Export/Import component is loaded
    await expect(page.getByText("Data Export & Import")).toBeVisible();
  });

  test("Export data in JSON format", async ({ page }) => {
    // Set download path for this test
    await page.context().setDefaultDownloadPath(downloadsFolder);

    // Verify we're on the export tab by default
    await expect(
      page.getByRole("tab", { name: "Export Data", selected: true }),
    ).toBeVisible();

    // Select JSON format (should be default, but explicitly select it)
    await page.getByRole("button", { name: "JSON" }).click();

    // Select what to export - try each option
    // First: All Data
    await page.getByRole("button", { name: "All Data" }).click();
    await expect(
      page.getByText("You are about to export your complete Mental Bank data"),
    ).toBeVisible();

    // Click export button
    const downloadPromise1 = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Data" }).click();
    const download1 = await downloadPromise1;

    // Verify success message
    await expect(
      page.getByText("Data exported successfully as JSON"),
    ).toBeVisible();

    // Now try Tasks Only
    await page.getByRole("button", { name: "Tasks Only" }).click();
    await expect(
      page.getByText("You are about to export your Mental Bank tasks"),
    ).toBeVisible();

    // Click export button
    const downloadPromise2 = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Data" }).click();
    const download2 = await downloadPromise2;

    // Verify success message
    await expect(
      page.getByText("Data exported successfully as JSON"),
    ).toBeVisible();
  });

  test("Export data in CSV format", async ({ page }) => {
    // Set download path for this test
    await page.context().setDefaultDownloadPath(downloadsFolder);

    // Select CSV format
    await page.getByRole("button", { name: "CSV" }).click();

    // Select Categories Only
    await page.getByRole("button", { name: "Categories Only" }).click();
    await expect(
      page.getByText("You are about to export your Mental Bank categories"),
    ).toBeVisible();

    // Click export button
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Export Data" }).click();
    const download = await downloadPromise;

    // Verify success message
    await expect(
      page.getByText("Data exported successfully as CSV"),
    ).toBeVisible();

    // Verify file was downloaded with CSV extension
    expect(download.suggestedFilename()).toContain(".csv");
  });

  test("Import data from JSON file", async ({ page }) => {
    // Switch to import tab
    await page.getByRole("tab", { name: "Import Data" }).click();

    // Verify import UI is visible
    await expect(page.getByText("Select File to Import")).toBeVisible();

    // Upload JSON file
    await page.setInputFiles('input[type="file"]', testJsonFile);

    // Verify file was selected
    await expect(page.getByText("test-import.json")).toBeVisible();

    // Select what to import - Tasks Only
    await page.getByRole("button", { name: "Tasks Only" }).click();

    // Verify warning message
    await expect(
      page.getByText("Importing data will overwrite your existing tasks"),
    ).toBeVisible();

    // Click import button
    await page.getByRole("button", { name: "Import Data" }).click();

    // Verify success message
    await expect(page.getByText("Data imported successfully")).toBeVisible();

    // Navigate to Tasks tab to verify imported task
    await page.getByText("Task Management").click();

    // Search for the imported task
    await page.getByPlaceholder("Search tasks...").fill("Test Import Task");

    // Verify the task appears in the list
    await expect(page.getByText("Test Import Task")).toBeVisible();
  });

  test("Import data from CSV file", async ({ page }) => {
    // Switch to import tab
    await page.getByRole("tab", { name: "Import Data" }).click();

    // Upload CSV file
    await page.setInputFiles('input[type="file"]', testCsvFile);

    // Verify file was selected
    await expect(page.getByText("test-import.csv")).toBeVisible();

    // Select All Data to import
    await page.getByRole("button", { name: "All Data" }).click();

    // Click import button
    await page.getByRole("button", { name: "Import Data" }).click();

    // Verify success message
    await expect(page.getByText("Data imported successfully")).toBeVisible();

    // Navigate to Tasks tab to verify imported task
    await page.getByText("Task Management").click();

    // Search for the imported task
    await page.getByPlaceholder("Search tasks...").fill("CSV Import Task");

    // Verify the task appears in the list
    await expect(page.getByText("CSV Import Task")).toBeVisible();

    // Navigate to Categories tab to verify imported category
    await page.getByText("Category Management").click();

    // Verify the category appears in the list
    await expect(page.getByText("CSV Import Category")).toBeVisible();
  });

  test("Handle import errors gracefully", async ({ page }) => {
    // Create an invalid JSON file
    const invalidJsonPath = path.join(
      process.cwd(),
      "test-data",
      "invalid.json",
    );
    fs.writeFileSync(invalidJsonPath, '{"tasks": [invalid json]}');

    // Switch to import tab
    await page.getByRole("tab", { name: "Import Data" }).click();

    // Upload invalid JSON file
    await page.setInputFiles('input[type="file"]', invalidJsonPath);

    // Click import button
    await page.getByRole("button", { name: "Import Data" }).click();

    // Verify error message
    await expect(page.getByText("Failed to process import file")).toBeVisible();

    // Try with unsupported file type
    const textFilePath = path.join(process.cwd(), "test-data", "test.txt");
    fs.writeFileSync(textFilePath, "This is not a valid import file");

    // Upload text file
    await page.setInputFiles('input[type="file"]', textFilePath);

    // Click import button
    await page.getByRole("button", { name: "Import Data" }).click();

    // Verify error message about unsupported format
    await expect(page.getByText("Unsupported file format")).toBeVisible();
  });

  // Clean up test files after all tests
  test.afterAll(async () => {
    // Clean up test files
    const filesToDelete = [testJsonFile, testCsvFile];
    const invalidJsonPath = path.join(
      process.cwd(),
      "test-data",
      "invalid.json",
    );
    const textFilePath = path.join(process.cwd(), "test-data", "test.txt");

    filesToDelete.push(invalidJsonPath, textFilePath);

    for (const file of filesToDelete) {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    }

    // Try to remove test-data directory
    try {
      const testDataFolder = path.join(process.cwd(), "test-data");
      if (fs.existsSync(testDataFolder)) {
        fs.rmdirSync(testDataFolder);
      }
    } catch (error) {
      console.log("Could not remove test-data folder, it may not be empty");
    }
  });
});
