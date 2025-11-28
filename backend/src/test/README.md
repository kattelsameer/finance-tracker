# Backend Tests

## Test Coverage

This directory contains comprehensive tests for the Finance Tracker backend application.

### Integration Tests (Controller Tests)

All API endpoints are covered by integration tests located in `java/com/financetracker/controller/`:

- **AuthControllerIntegrationTest** - Authentication tests (register, login, logout, check auth)
- **AccountControllerIntegrationTest** - Account CRUD tests
- **TransactionControllerIntegrationTest** - Transaction CRUD tests
- **CategoryControllerIntegrationTest** - Category CRUD tests
- **DashboardControllerIntegrationTest** - Dashboard stats endpoint tests
- **BudgetControllerIntegrationTest** - Budget CRUD tests
- **TagControllerIntegrationTest** - Tag CRUD tests
- **NotificationControllerIntegrationTest** - Notification endpoint tests
- **RecurringTransactionControllerIntegrationTest** - Recurring transaction CRUD tests
- **SearchControllerIntegrationTest** - Search endpoint tests
- **ImportExportControllerIntegrationTest** - Import/Export endpoint tests

### Service Tests

- **AccountServiceTest** - Tests for account management (create, read, update, delete, archive, restore)
- **TransactionServiceTest** - Tests for transaction operations (expense, income, transfer, search, pagination)
- **BudgetServiceTest** - Tests for budget management (create, update, calculate progress, alerts)

### Repository Tests

- **AccountRepositoryTest** - Data layer tests for AccountRepository using @DataJpaTest

## Running Tests

```bash
# Run ALL integration tests (recommended - covers all backend APIs)
./gradlew test --tests "com.financetracker.ApiTestSuite"

# Alternative: Run all controller tests
./gradlew test --tests "com.financetracker.controller.*"

# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests "com.financetracker.controller.AuthControllerIntegrationTest"

# Run with coverage
./gradlew test jacocoTestReport

# View coverage report
open build/reports/jacoco/test/html/index.html
```

## Test Structure

### Service Layer Tests
- Use `@ExtendWith(MockitoExtension.class)` for dependency mocking
- Mock repositories and external dependencies
- Test business logic in isolation
- Verify correct exception handling
- Test edge cases and validation

### Controller Tests  
- Use `@WebMvcTest` for testing REST endpoints
- Mock service layer dependencies
- Test request/response mapping
- Verify HTTP status codes
- Test authentication/authorization
- Validate request body validation

### Repository Tests
- Use `@DataJpaTest` for database layer testing
- Use TestEntityManager for test data setup
- Test custom query methods
- Verify entity relationships
- Test pagination and sorting

## Known Issues

### Java 25 Compatibility
The project targets Java 21, but if running on Java 25, you may encounter annotation processor issues with Lombok/MapStruct causing `ExceptionInInitializerError`.

**Solution**: Use Java 21 or set JAVA_HOME to Java 21:
```bash
export JAVA_HOME=/path/to/jdk-21
./gradlew test
```

Or use Docker which provides the correct Java version:
```bash
docker-compose exec backend ./gradlew test
```

## Test Dependencies

All testing dependencies are configured in `build.gradle`:

- **JUnit 5** - Testing framework
- **Mockito** - Mocking framework  
- **AssertJ** - Fluent assertions
- **Spring Boot Test** - Spring testing support
- **Spring Security Test** - Security testing utilities
- **Testcontainers** - Database integration testing

## Best Practices

1. **Arrange-Act-Assert** pattern in all tests
2. Use `@DisplayName` for readable test descriptions
3. One assertion concept per test method
4. Mock external dependencies, test real business logic
5. Test both success and failure scenarios
6. Use meaningful test data
7. Keep tests fast and independent

## Coverage Goals

- **Target**: >70% code coverage
- **Service Layer**: >80% coverage (business logic critical)
- **Controller Layer**: >70% coverage (API contracts)
- **Repository Layer**: >60% coverage (mostly Spring Data)

## Future Enhancements

- Add integration tests with Testcontainers
- Add end-to-end API tests
- Add security flow tests
- Add performance tests for complex queries
- Add contract tests for external APIs
