---
name: finance-review
description: Code review skill for the Finance Tracker application. Use when reviewing pull requests, inspecting code changes, or auditing code quality. Triggers on requests like "review this PR", "review my changes", "check this code", "is this safe", "audit this", or "review the diff".
---

# Finance Tracker Code Review

## Review Workflow

1. **Gather changes** — Read the diff (`git diff`, `git diff main...HEAD`, or PR changes)
2. **Run checks** — Lint, compile, type-check (see commands below)
3. **Apply review checklist** — Prioritize security and data integrity over style
4. **Report findings** — Categorize by severity: CRITICAL > HIGH > MEDIUM > LOW

## Automated Checks

Run before manual review:
```bash
cd frontend && npm run lint && npx tsc --noEmit
source ~/.bash_profile && cd backend && ./gradlew compileJava
```

## Review Checklist

### CRITICAL — Security & Data Integrity

| Check | What to Look For |
|-------|-----------------|
| User data isolation | Every query filters by `userId` — missing filter = cross-user data leak |
| Auth on endpoints | Controller methods use `@AuthenticationPrincipal UserPrincipal` |
| SQL injection | `@Query` uses `:paramName`, no string concatenation with user input |
| CSRF | POST/PUT/DELETE go through `apiClient` which adds `X-XSRF-TOKEN` |
| Secrets exposure | No passwords, API keys, or tokens in source or config files |
| Money precision | `BigDecimal` in Java entities, `DECIMAL(15,2)` in SQL — never float/double |
| Transfer integrity | Source debit == target credit, no money created or destroyed |

### HIGH — Correctness

| Check | What to Look For |
|-------|-----------------|
| Transaction on writes | Service write methods have `@Transactional` |
| DTO validation | Request DTOs have `@NotNull`, `@Size`, `@Valid` annotations |
| Error handling | Uses `ErrorCode` enum, no raw exception messages to client |
| Flyway migrations | New version number sequential (currently V1–V17), never modify existing files |
| Category type match | INCOME categories on INCOME transactions only, same for EXPENSE |
| React Query mutations | Proper cache invalidation after create/update/delete |

### MEDIUM — Architecture Compliance

| Check | What to Look For |
|-------|-----------------|
| API client usage | All HTTP calls go through `apiClient` singleton, not raw axios/fetch |
| Endpoint config | API paths defined in `ENDPOINTS` constant (`src/config/api.ts`) |
| Layer separation | Controllers don't contain business logic, services don't return entities |
| MapStruct mapping | Entity↔DTO conversion via MapStruct, not manual copying |
| Frontend types | Types defined in `src/types/`, not inline `any` |

### LOW — Code Quality

| Check | What to Look For |
|-------|-----------------|
| TypeScript strictness | No `any` types, proper null checks |
| Consistent patterns | Follows existing service/hook/component conventions |
| Effect dependencies | `useEffect` has correct dependency arrays |
| Cleanup | Effects clean up listeners, abort controllers on unmount |

## Finance Domain Checks

For changes touching financial logic, verify:
- Account balance updates match transaction amounts
- Budget spent calculations include subcategory expenses
- Period boundary calculations handle edge cases (month ends, leap years)
- CSV import/export round-trips without data loss
- Recurring transaction scheduling handles end-of-month dates

## Reporting Format

```markdown
## Code Review: [PR title or branch name]

### Summary
[1-2 sentences on overall quality and key concerns]

### Findings

#### CRITICAL
- **[file:line]**: [description] → [fix]

#### HIGH
- **[file:line]**: [description] → [fix]

#### MEDIUM / LOW
- **[file:line]**: [description]

### Verdict
[APPROVE / REQUEST CHANGES / NEEDS DISCUSSION]
```
