---
name: finance-dev
description: Development workflow skill for the Finance Tracker application. Use when creating new features, endpoints, components, or services. Also use when starting the dev environment, running the app, building, or following project conventions. Triggers on requests like "add a new endpoint", "create a component", "start the app", "how does X work", "add a new page", or "create a new service".
---

# Finance Tracker Development

## Quick Start

```bash
# Full stack via Docker
docker compose up -d                         # Start all (MySQL + backend + frontend)
docker compose -f docker-compose.demo.yml up -d  # With seeded demo data

# Backend only (Java 21)
source ~/.bash_profile && cd backend && ./gradlew bootRun

# Frontend only (Vite)
cd frontend && npm run dev                   # Dev server at localhost:5173
```

## Adding a New Feature

Determine the type of change:
- **New API endpoint** → Follow "Backend Endpoint" below
- **New frontend page/component** → Follow "Frontend Feature" below
- **Full-stack feature** → Do backend first, then frontend

### Backend Endpoint

1. **DTO** — Create request/response classes in `backend/src/main/java/com/financetracker/dto/{feature}/`
   - Add `@NotNull`, `@Size`, `@Valid` annotations on request fields
   - Response DTOs must never expose entity internals (passwords, internal IDs)

2. **Service** — Add methods in `backend/src/main/java/com/financetracker/service/`
   - `@Transactional` on all write methods
   - Always accept `Long userId` as first parameter — never trust client-provided userId
   - Use MapStruct for entity↔DTO mapping

3. **Controller** — Add endpoint in `backend/src/main/java/com/financetracker/controller/`
   - Always use `@AuthenticationPrincipal UserPrincipal userPrincipal`
   - All paths under `/api/v1/` prefix
   - Return `ResponseEntity` with proper status codes

```java
@PostMapping
public ResponseEntity<ThingResponse> create(
    @AuthenticationPrincipal UserPrincipal userPrincipal,
    @Valid @RequestBody CreateThingRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.create(userPrincipal.getId(), request));
}
```

4. **Repository** — If needed, add to `backend/src/main/java/com/financetracker/repository/`
   - All queries MUST filter by `userId`
   - Use Spring Data JPA conventions or `@Query` with named parameters

5. **Test** — Create `{Feature}ControllerIntegrationTest extends BaseIntegrationTest`

### Frontend Feature

1. **Types** — Add TypeScript types in `frontend/src/types/{feature}.ts`

2. **Endpoint** — Add path to `ENDPOINTS` in `frontend/src/config/api.ts`

3. **Service** — Create `frontend/src/services/{feature}.service.ts`
   - Use `apiClient.get/post/put/delete` from `src/lib/api-client`
   - CSRF handling is automatic

```typescript
export const thingService = {
  async getAll(): Promise<Thing[]> {
    return apiClient.get<Thing[]>(ENDPOINTS.THINGS);
  },
  async create(data: CreateThingRequest): Promise<Thing> {
    return apiClient.post<Thing>(ENDPOINTS.THINGS, data);
  },
};
```

4. **Hook** (optional) — Create React Query hook in `frontend/src/hooks/use{Feature}.ts` using TanStack Query

5. **Component/Page** — Add in `frontend/src/components/{feature}/` or `frontend/src/pages/`
   - Use React Hook Form + Zod for form validation
   - Use Tailwind CSS + clsx/tailwind-merge for styling
   - Handle loading, error, and empty states

6. **Route** — Add route in the app's router configuration

## Project Conventions

See [references/conventions.md](references/conventions.md) for detailed patterns.

**Key rules:**
- All API calls through `apiClient` singleton — never raw axios/fetch
- Error codes: 1xxx=auth, 2xxx=validation, 3xxx=not-found, 4xxx=business, 5xxx=server
- Transaction types: `INCOME`, `EXPENSE`, `TRANSFER` (transfers need `transferToAccountId`)
- Categories: Hierarchical with `INCOME`/`EXPENSE` type — enforce matching transaction type
- Monetary amounts: `BigDecimal` in Java, `DECIMAL(15,2)` in MySQL — never use float/double

## Environment Configs

| Profile | Database | API URL | Use Case |
|---------|----------|---------|----------|
| `dev` | localhost:3306 | localhost:8080 | Local backend dev |
| `docker` | mysql:3306 | nginx proxy | Docker Compose |
| `test` | H2 in-memory | — | Integration tests |

Frontend: `VITE_API_BASE_URL=""` for Docker (nginx proxy), undefined for localhost:8080.
