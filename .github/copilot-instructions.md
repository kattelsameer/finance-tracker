# Finance Tracker - AI Coding Instructions

## Architecture Overview

Full-stack personal finance app: **React 19 / TypeScript / Vite** frontend + **Spring Boot 3.2 / Java 21** backend + **MySQL 8.0**.

### Backend Structure (`/backend`)
- **Layered architecture**: Controller → Service → Repository → Entity
- **DTOs**: Separate request/response objects in `dto/` (e.g., `CreateTransactionRequest`, `TransactionResponse`)
- **Security**: JWT in HttpOnly cookies + CSRF tokens via `X-XSRF-TOKEN` header
- **Migrations**: Flyway in `src/main/resources/db/migration/` (V1–V17)
- **Mapping**: MapStruct for entity↔DTO conversion
- **Error handling**: Standardized `ErrorCode` enum with numeric codes (1xxx=auth, 2xxx=validation, 3xxx=not-found, 4xxx=business, 5xxx=server)

### Frontend Structure (`/frontend`)
- **Services pattern**: All API calls through `src/services/*.service.ts` using `apiClient` singleton
- **API client** (`src/lib/api-client.ts`): Axios with automatic CSRF token handling and 401 redirect
- **Auth context** (`src/contexts/AuthContext.tsx`): Global auth state with `useAuth()` hook
- **React Query hooks** (`src/hooks/use*.ts`): TanStack Query hooks per feature (useAccounts, useBudgets, etc.)
- **Endpoints config** (`src/config/api.ts`): Centralized `ENDPOINTS` constant
- **State management**: TanStack Query for server state, Zustand for client state, React Context for auth/feature flags
- **Forms**: React Hook Form + Zod validation (`@hookform/resolvers/zod`)
- **UI**: Tailwind CSS 4 + clsx + tailwind-merge, Lucide React icons, Recharts for charts

### Key Data Flow
```
Frontend Service → apiClient (adds CSRF) → nginx proxy (/api/*) → Spring Controller
                                                                    ↓
User ← React Component ← Hook ← Service Response ← DTO Mapper ← Service → Repository
```

## Essential Commands

```bash
# Environment setup — ALWAYS run before Java/Gradle commands
source ~/.bash_profile

# Docker (recommended for full stack)
docker compose up -d                          # Start all services
docker compose -f docker-compose.demo.yml up -d  # Start with seeded demo data
docker compose build --no-cache               # Rebuild after changes
docker logs finance-tracker-backend           # Check backend logs

# Backend development (requires Java 21)
cd backend && ./gradlew bootRun               # Run with dev profile
./gradlew test                                # All tests (uses H2 in-memory)
./gradlew test --tests "*ControllerIntegrationTest"  # Controller tests only
./gradlew test --tests "*AuthControllerIntegrationTest"  # Specific test class
./gradlew compileJava                         # Compile check only

# Frontend development
cd frontend && npm run dev                    # Dev server at localhost:5173
npm run build                                 # TypeScript check + Vite build
npm run lint                                  # ESLint
npx tsc --noEmit                              # TypeScript type check only
npm run test:run                              # Vitest (single run)
npm run test:coverage                         # Vitest with v8 coverage
npm run test:e2e                              # Playwright E2E (headless)
npm run test:e2e:headed                       # Playwright with visible browser
```

## Critical Patterns

### Backend: Creating a New Endpoint
1. Add DTO in `dto/{feature}/` with validation annotations (`@NotNull`, `@Size`, etc.)
2. Create/update service method with `@Transactional` for writes
3. Add controller method using `@AuthenticationPrincipal UserPrincipal` for user context
4. All endpoints under `/api/v1/` prefix
5. All queries MUST filter by `userId` — never expose cross-user data

```java
// Controller pattern — always inject userId from auth
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
3. Use `apiClient.get/post/put/delete` — CSRF handled automatically
4. Create React Query hook in `src/hooks/use{Feature}.ts` for data fetching

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
        Cookie authCookie = registerAndLogin("user", "user@test.com", "SecureP@ssw0rd!");
        mockMvc.perform(get("/api/v1/endpoint").cookie(authCookie))
            .andExpect(status().isOk());
    }
}
```

### Frontend Unit Tests
Mock `apiClient` and use Vitest:
```typescript
vi.mock('../../lib/api-client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
```

## Environment Configurations

| Profile | Database | API URL | Use Case |
|---------|----------|---------|----------|
| `dev` | localhost:3306 | localhost:8080 | Local backend dev |
| `docker` | mysql:3306 | nginx proxy | Docker Compose |
| `demo` | mysql:3306 | nginx proxy | Docker with seeded demo data |
| `test` | H2 in-memory | — | Integration tests |

**Frontend API URL**: Set `VITE_API_BASE_URL=""` for Docker (nginx proxy), undefined for localhost:8080.

**Demo mode**: `docker compose -f docker-compose.demo.yml up -d` — seeds a demo user (`demo`/`demo123`) with accounts, transactions, budgets, and categories. Demo data in `backend/src/main/resources/db/demo/` (V100–V107).

## Domain Concepts

### Transaction Types
- **INCOME**: Positive amount, increases account balance
- **EXPENSE**: Decreases account balance
- **TRANSFER**: Requires `transferToAccountId`, debits source and credits target by same amount
- Financial amounts: `BigDecimal` in Java, `DECIMAL(15,2)` in MySQL — **never** use `double`/`float`

### Hierarchical Categories
- **CategoryType**: `INCOME` or `EXPENSE` — determines valid transaction types
- Parent categories can have subcategories (e.g., "Food" → "Groceries", "Restaurants")
- System categories (`isSystem=true`) are seeded via `V12__seed_default_categories.sql` and are read-only
- Categories include `colorCode` and `icon` for UI display

### Budget & Notification System
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

- **CSRF required** for POST/PUT/DELETE — frontend handles via `api-client.ts` interceptor
- **User isolation**: All queries must filter by `userId` — never expose cross-user data
- **Flyway migrations**: Never modify existing V*.sql files; always create new version (next is V18)
- **Transaction types**: `INCOME`, `EXPENSE`, `TRANSFER` — transfers require `transferToAccountId`
- **Lombok on entities**: Use `@Getter`/`@Setter`, not `@Data` (breaks JPA equals/hashCode)
- **`source ~/.bash_profile`**: Always run before Gradle/Java commands (Java 21 path setup)

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
