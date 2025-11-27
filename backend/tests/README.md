# AdImpressions Backend Tests

Comprehensive test suite for the AdImpressions advertising rating platform backend.

## Test Structure

```
tests/
├── setup.ts                      # Test utilities and database setup
├── modules/                      # Module-specific unit tests
│   ├── ads.test.ts              # Ads module tests
│   ├── analytics.test.ts        # Analytics module tests
│   ├── users.test.ts            # Users module tests
│   └── voting.test.ts           # Voting module tests
├── utils/                        # Utility function tests
│   └── videoParser.test.ts      # Video URL parser tests
└── integration/                  # Integration tests
    └── api.test.ts              # Full API integration tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run specific test file
```bash
npm test -- tests/modules/ads.test.ts
```

### Run tests with coverage
```bash
npm test -- --coverage
```

## Test Coverage

The test suite includes:

### Unit Tests

#### **Ads Module** (`tests/modules/ads.test.ts`)
- ✅ Ad creation with YouTube and Vimeo URLs
- ✅ Ad retrieval (single and multiple)
- ✅ Ad updates and deletions
- ✅ Filtering ads by status, category, and brand
- ✅ Search functionality
- ✅ Top-rated and trending ads
- ✅ Category management
- ✅ Rating statistics updates
- ✅ Video URL validation

#### **Voting Module** (`tests/modules/voting.test.ts`)
- ✅ Vote creation for authenticated and anonymous users
- ✅ Rating validation (1-5 scale)
- ✅ Duplicate vote prevention
- ✅ Vote retrieval and statistics
- ✅ Vote deletion and recalculation
- ✅ IP-based vote tracking for anonymous users
- ✅ Vote aggregation by ad and user
- ✅ Recent votes feed

#### **Users Module** (`tests/modules/users.test.ts`)
- ✅ User registration with validation
- ✅ Password hashing and verification
- ✅ User login with credentials
- ✅ Email format validation
- ✅ Username and email uniqueness
- ✅ User profile updates
- ✅ User deletion with cascade effects
- ✅ User statistics (votes, ratings)
- ✅ Role-based access (user, admin)

#### **Analytics Module** (`tests/modules/analytics.test.ts`)
- ✅ Event tracking (view, vote, share)
- ✅ Event metadata storage
- ✅ Ad summary statistics
- ✅ Date range analytics
- ✅ Platform-wide statistics
- ✅ Unique visitor counting
- ✅ Top ads calculation
- ✅ Weekly data archiving
- ✅ Historical data retrieval

#### **Video Parser Utility** (`tests/utils/videoParser.test.ts`)
- ✅ YouTube URL parsing (multiple formats)
- ✅ Vimeo URL parsing (multiple formats)
- ✅ Video ID extraction
- ✅ Embed URL generation
- ✅ Thumbnail URL generation
- ✅ Invalid URL handling
- ✅ Edge cases (trailing slashes, fragments, etc.)
- ✅ Real-world URL examples

### Integration Tests (`tests/integration/api.test.ts`)

#### **API Endpoints**
- ✅ Health check endpoint
- ✅ User registration and login flow
- ✅ Ad management (CRUD operations)
- ✅ Voting workflow
- ✅ Analytics tracking
- ✅ Authorization and permissions
- ✅ Error handling and validation

#### **User Journeys**
- ✅ Complete user registration → ad creation → voting → analytics flow
- ✅ Authentication with JWT tokens
- ✅ Role-based access control (admin vs. user)
- ✅ Duplicate prevention (emails, votes)
- ✅ Data validation and error responses

#### **Weekly Jobs**
- ✅ Weekly data archiving
- ✅ Historical data management

## Test Database

Tests use an isolated SQLite database for each test run to ensure:
- **Isolation**: Each test suite gets its own database
- **Clean State**: Database is cleared before each test
- **No Side Effects**: Tests don't affect each other
- **Fast Execution**: In-memory operations

## Test Utilities

The `setup.ts` file provides helper functions:

- `setupTestDatabase()` - Initialize test database with schema
- `clearTestData()` - Clear all data from test database
- `createTestUser()` - Create test user with custom data
- `createTestAd()` - Create test ad with custom data
- `createTestVote()` - Create test vote
- `createTestAnalyticsEvent()` - Create test analytics event
- `generateTestToken()` - Generate JWT token for authentication

## Writing New Tests

### Unit Test Example

```typescript
import { setupTestDatabase, clearTestData, createTestAd } from '../setup';

describe('MyModule', () => {
  let testDb: Database.Database;

  beforeAll(() => {
    testDb = setupTestDatabase();
    const dbModule = require('../../src/config/database');
    dbModule.db = testDb;
  });

  beforeEach(() => {
    clearTestData(testDb);
  });

  afterAll(() => {
    testDb.close();
  });

  it('should do something', () => {
    const ad = createTestAd(testDb, { title: 'Test' });
    // Your test code here
    expect(ad.title).toBe('Test');
  });
});
```

### Integration Test Example

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('API Endpoint', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Clean State**: Always clear test data before each test
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern
5. **Mock External Dependencies**: Use mocks for external services
6. **Test Edge Cases**: Include tests for error conditions and edge cases
7. **Async/Await**: Use async/await for asynchronous operations
8. **Type Safety**: Leverage TypeScript for type-safe tests

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (< 30 seconds for full suite)
- No external dependencies required
- Deterministic results
- Clear error messages

## Troubleshooting

### Tests failing with database errors
- Ensure the test database is being properly initialized
- Check that `clearTestData()` is called in `beforeEach()`

### Authentication errors in integration tests
- Verify JWT_SECRET is set in environment
- Check that test tokens are being generated correctly

### Timeout errors
- Increase Jest timeout if needed: `jest.setTimeout(10000)`
- Check for hanging async operations

## Contributing

When adding new features:
1. Write unit tests for new service methods
2. Add integration tests for new API endpoints
3. Update this README with new test coverage
4. Ensure all tests pass before submitting PR
