# Finance Tracker - AI Coding Instructions

## Architecture Overview

Full-stack personal finance app: **React/TypeScript frontend** + **Spring Boot 3.2/Java 21 backend** + **MySQL 8.0**.

### Backend Structure (`/backend`)
- **Layered architecture**: Controller → Service → Repository → Entity
- **DTOs**: Separate request/response objects in `dto/` (e.g., `CreateTransactionRequest`, `TransactionResponse`)
- **Security**: JWT in HttpOnly cookies + CSRF tokens via `X-XSRF-TOKEN` header
- **Migrations**: Flyway in `src/main/resources/db/migration/` (V1-V17)
- **Error handling**: Standardized `ErrorCode` enum with numeric codes (1xxx=auth, 2xxx=validation, 3xxx=not-found, 4xxx=business, 5xxx=server)

### Frontend Structure (`/frontend`)
- **Services pattern**: All API calls through `src/services/*.service.ts` using `apiClient` singleton
- **API client** (`src/lib/api-client.ts`): Axios with automatic CSRF token handling and 401 redirect
- **Auth context** (`src/contexts/AuthContext.tsx`): Global auth state with `useAuth()` hook
- **Endpoints config** (`src/config/api.ts`): Centralized `ENDPOINTS` constant

### Key Data Flow
```
Frontend Service → apiClient (adds CSRF) → nginx proxy (/api/*) → Spring Controller
                                                                    ↓
User ← React Component ← Service Response ← DTO Mapper ← Service → Repository
```

## Essential Commands

```bash
# Docker (recommended for full stack)
docker compose up -d                    # Start all services
docker compose build --no-cache         # Rebuild after changes
docker logs finance-tracker-backend     # Check backend logs

# Backend development (requires Java 21)
cd backend && ./gradlew bootRun         # Run with dev profile
./gradlew test --tests "com.financetracker.ApiTestSuite"  # All integration tests
./gradlew test --tests "*ControllerIntegrationTest"       # Controller tests only

# Frontend development
cd frontend && npm run dev              # Dev server (uses localhost:8080)
npm run build                           # Production build
npm test                                # Vitest tests
```

## Critical Patterns

### Backend: Creating a New Endpoint
1. Add DTO in `dto/{feature}/` with validation annotations (`@NotNull`, `@Size`, etc.)
2. Create/update service method with `@Transactional` for writes
3. Add controller method using `@AuthenticationPrincipal UserPrincipal` for user context
4. All endpoints under `/api/v1/` prefix

```java
// Controller pattern - always inject userId from auth
@PostMapping
public ResponseEntity<ThingResponse> create(
    @AuthenticationPrincipal UserPrincipal userPrincipal,
    @Valid @RequestBody CreateThingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userPrincipal.getId(), request));
}
```

### Frontend: Adding API Calls
1. Add endpoint to `ENDPOINTS` in `src/config/api.ts`
2. Create service methods in `src/services/{feature}.service.ts`
3. Use `apiClient.get/post/put/delete` - CSRF handled automatically

```typescript
// Service pattern
export const thingService = {
  async getAll(): Promise<Thing[]> {
    return apiClient.get<Thing[]>(ENDPOINTS.THINGS);
  },
  async create(data: CreateThingRequest): Promise<Thing> {
    return apiClient.post<Thing>(ENDPOINTS.THINGS, data);
  },
};
```

### Integration Tests
Extend `BaseIntegrationTest` for authenticated test setup:
```java
public class MyControllerIntegrationTest extends BaseIntegrationTest {
    @Test
    void testEndpoint() throws Exception {
        Cookie authCookie = registerAndLogin("user", "user@test.com", "password");
        mockMvc.perform(get("/api/v1/endpoint").cookie(authCookie))
            .andExpect(status().isOk());
    }
}
```

## Environment Configurations

| Profile | Database | API URL | Use Case |
|---------|----------|---------|----------|
| `dev` | localhost:3306 | localhost:8080 | Local backend dev |
| `docker` | mysql:3306 | nginx proxy | Docker Compose |
| `test` | H2 in-memory | - | Integration tests |

**Frontend API URL**: Set `VITE_API_BASE_URL=""` for Docker (nginx proxy), undefined for localhost:8080.

## Domain Concepts

### Hierarchical Categories
Categories have a parent/child structure with type restrictions:
- **CategoryType**: `INCOME` or `EXPENSE` - determines valid transaction types
- Parent categories can have subcategories (e.g., "Food" → "Groceries", "Restaurants")
- System categories (`isSystem=true`) are seeded via `V12__seed_default_categories.sql`
- Categories include `colorCode` and `icon` for UI display

```java
// Category entity relationships
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "parent_id")
private Category parent;

@OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
private List<Category> subcategories;
```

### Budget & Notification System
Budgets track spending limits per category with alert thresholds:
- **PeriodType**: `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`
- **alertThreshold**: Percentage (default 80%) that triggers notifications
- **NotificationType**: `BUDGET_ALERT`, `RECURRING_TRANSACTION`, `SYSTEM`
- Notifications have `priority` (LOW, NORMAL, HIGH) and track read/sent status

### Import/Export CSV Format
CSV import supports flexible column names:
| Field | Accepted Headers |
|-------|------------------|
| Date | `Date`, `date`, `Transaction Date` |
| Description | `Description`, `description`, `Details` |
| Amount | `Amount`, `amount` |
| Type | `Type`, `type`, `Transaction Type` |
| Account | `Account`, `account`, `Account Name` |
| Category | `Category`, `category` |
| Notes | `Notes`, `notes`, `Memo` |
| Reference | `Reference`, `reference`, `Ref` |

Date formats supported: `yyyy-MM-dd`, `MM/dd/yyyy`, `dd/MM/yyyy`, `M/d/yyyy`

## Common Pitfalls

- **CSRF required** for POST/PUT/DELETE - frontend handles via `api-client.ts` interceptor
- **User isolation**: All queries must filter by `userId` - never expose cross-user data
- **Flyway migrations**: Never modify existing V*.sql files; create new version
- **Transaction types**: `INCOME`, `EXPENSE`, `TRANSFER` - transfers require `transferToAccountId`

## Agent Workflow Rules

### Task Execution Approach
1. **Break down tasks**: Split complex requests into smaller, atomic tasks
2. **Create todo list**: Track each subtask with clear descriptions
3. **Execute sequentially**: Complete one task at a time, marking progress
4. **Always verify**: Add a final verification/test step to validate all changes
5. **Commit only when complete**: After all tasks pass verification, commit changes

### Git Branch Workflow
1. Check current branch before committing
2. If on `develop`, checkout to appropriate feature/bugfix/enhancement branch first
3. If already on feature branch, commit and push changes
4. Commit messages should be descriptive of all changes made

### Environment Setup
```bash
# Always source bash_profile for Java 21 before running backend commands
source ~/.bash_profile

# Then run gradle commands
cd backend && ./gradlew bootRun
./gradlew test
```
