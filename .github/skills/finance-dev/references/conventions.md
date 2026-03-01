# Project Conventions — Finance Tracker

## Backend Conventions

### Package Structure
```
com.financetracker/
├── controller/     REST endpoints — thin, delegates to service
├── service/        Business logic — @Transactional on writes
├── repository/     Spring Data JPA — all queries filter by userId
├── entity/         JPA entities — @Getter/@Setter (not @Data)
├── dto/            Request/Response per feature subdirectory
├── security/       JWT, CSRF, Spring Security config
├── specification/  JPA Specifications for dynamic filtering
├── config/         App configuration beans
├── exception/      Custom exceptions + GlobalExceptionHandler
└── mapper/         MapStruct interfaces for entity↔DTO
```

### Controller Rules
- All endpoints under `/api/v1/` prefix
- Always use `@AuthenticationPrincipal UserPrincipal userPrincipal`
- Use `@Valid @RequestBody` for request validation
- Return `ResponseEntity<T>` with correct HTTP status
- Never return entity objects — always map to response DTOs

### Service Rules
- `@Transactional` on all methods that write data
- Accept `Long userId` as first parameter for user-scoped operations
- Throw domain-specific exceptions (`ResourceNotFoundException`, `BusinessException`)
- Use ErrorCode enum: 1xxx=auth, 2xxx=validation, 3xxx=not-found, 4xxx=business, 5xxx=server

### Entity Rules
- Use `@Getter` and `@Setter` from Lombok (not `@Data` — it generates equals/hashCode that break JPA)
- `BIGINT` for IDs, `DECIMAL(15,2)` for money, `VARCHAR` for strings
- Always include `createdAt` and `updatedAt` timestamps
- `BigDecimal` for all monetary fields — NEVER `double` or `float`

### Repository Rules
- All queries must include `userId` filter for user isolation
- Use Spring Data JPA method naming or `@Query` with named parameters
- Never use string concatenation in queries

## Frontend Conventions

### File Organization
```
src/
├── services/{feature}.service.ts    API calls via apiClient
├── hooks/use{Feature}.ts            React Query hooks
├── types/{feature}.ts               TypeScript interfaces
├── components/{feature}/            Feature-specific components
├── pages/{Feature}Page.tsx          Page components
├── contexts/                        React contexts (Auth, FeatureFlags)
├── config/api.ts                    ENDPOINTS constant
└── lib/api-client.ts                Axios singleton with CSRF
```

### API Call Rules
- All HTTP calls through `apiClient` singleton — never raw axios or fetch
- All endpoint paths defined in `ENDPOINTS` constant in `src/config/api.ts`
- Services return typed promises: `async getAll(): Promise<Thing[]>`

### Component Rules
- Use React Hook Form + Zod for form validation
- Use TanStack Query (React Query) for server state via custom hooks
- Use Tailwind CSS for styling, clsx + tailwind-merge for conditional classes
- Handle three states: loading, error, empty/success
- Use Lucide React for icons

### State Management
- Server state: TanStack Query (via hooks in `src/hooks/`)
- Auth state: AuthContext (`src/contexts/AuthContext.tsx`)
- Feature flags: FeatureFlagsContext
- Local UI state: Zustand stores or React useState

## Git Conventions
- Branch from `develop` for features
- Branch naming: `feature/`, `bugfix/`, `enhancement/`
- Commit messages: descriptive of all changes
- Never commit directly to `main` or `develop`

## Domain Rules
- Transaction types: INCOME, EXPENSE, TRANSFER
- TRANSFER requires `transferToAccountId`
- Categories: INCOME or EXPENSE typed, hierarchical (parent/child)
- System categories (`isSystem=true`) are read-only
- Budgets: per-category with WEEKLY/MONTHLY/QUARTERLY/YEARLY periods
- Alert threshold default: 80%
