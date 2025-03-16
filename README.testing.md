# Automated Testing for Mental Bank Task Manager

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- macOS (these instructions are specific to macOS, but can be adapted for other platforms)

### Installation

1. Clone the repository to your local machine:

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install the project dependencies:

```bash
npm install
```

3. Install Playwright and its dependencies:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

This will install Playwright and the required browser binaries (Chromium, Firefox, and WebKit).

## Running the Tests

### Start the Development Server

Before running the tests, make sure your development server is running. The tests are configured to start the server automatically, but you can also start it manually:

```bash
npm run dev
```

### Run All Tests

To run all the tests in all browsers:

```bash
npx playwright test
```

### Run Tests in a Specific Browser

To run tests in a specific browser:

```bash
npx playwright test --project=chromium
```

Available projects: `chromium`, `firefox`, `webkit`, `Mobile Chrome`, `Mobile Safari`

### Run a Specific Test File

To run a specific test file:

```bash
npx playwright test tests/e2e.test.js
```

### Run Tests in UI Mode

Playwright offers a UI mode for easier debugging:

```bash
npx playwright test --ui
```

### View Test Reports

After running the tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Test Structure

The tests are organized in the `tests` directory. The main test file is `e2e.test.js`, which contains end-to-end tests for the Mental Bank Task Manager application.

The tests cover the following functionality:

1. Authentication (login/logout)
2. Dashboard functionality
3. Category management
4. Task management

## Customizing Tests

### Test Data

You can modify the test data at the top of the `e2e.test.js` file:

```javascript
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};

const TEST_CATEGORY = {
  name: 'Test Category',
  hourlyRate: '125'
};

const TEST_TASK = {
  title: 'Test Task',
  description: 'This is a test task created by automated testing',
  estimatedHours: '2.5'
};
```

Make sure to update these values to match valid credentials and data for your environment.

### Configuration

The Playwright configuration is in `playwright.config.js`. You can modify settings such as:

- Timeouts
- Browser configurations
- Screenshot and trace settings
- Base URL

## Troubleshooting

### Tests Failing to Find Elements

If tests are failing because they can't find elements, it could be due to:

1. Changes in the application's UI or element selectors
2. Timing issues (try increasing timeouts)
3. The application not being in the expected state

Use the `--debug` flag to run tests in debug mode:

```bash
npx playwright test --debug
```

### Authentication Issues

If tests are failing at the authentication step:

1. Verify that the test user credentials are correct
2. Check if the authentication flow has changed
3. Ensure the test environment has the correct authentication configuration

### Browser Compatibility Issues

If tests pass in one browser but fail in another:

1. Check for browser-specific CSS or JavaScript issues
2. Increase timeouts for slower browsers
3. Consider using browser-specific tests for features with known compatibility issues

## Extending the Tests

To add new tests:

1. Create a new test file in the `tests` directory or add to the existing `e2e.test.js`
2. Follow the existing patterns for page navigation and assertions
3. Use the Playwright API for interactions and assertions

Refer to the [Playwright documentation](https://playwright.dev/docs/intro) for more information on writing tests.
