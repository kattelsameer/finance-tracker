# Security Quick Checks — Finance Tracker

## Critical (STOP and report immediately)

| Check | How to Verify |
|-------|---------------|
| User data isolation | Every repository query includes `userId` in WHERE clause |
| Auth on endpoints | Every controller method has `@AuthenticationPrincipal UserPrincipal` |
| SQL injection | All `@Query` use `:paramName` parameters, no string concatenation |
| Hardcoded secrets | No passwords/keys in `application*.yml`, `docker-compose*.yml`, or source |
| CSRF protection | Spring CSRF enabled, `api-client.ts` sends `X-XSRF-TOKEN` header |

## High Priority

| Check | How to Verify |
|-------|---------------|
| JWT cookie flags | `auth_token` cookie: HttpOnly=true, Secure=true, SameSite=Strict |
| Token expiration | JWT has reasonable expiry (not unlimited) |
| Password hashing | BCrypt used in user registration |
| Logout invalidation | `auth_token` cookie cleared + token revoked on logout |
| XSS | No `dangerouslySetInnerHTML` or raw HTML injection in React components |

## Medium Priority

| Check | How to Verify |
|-------|---------------|
| CSV injection | Import sanitizes cells starting with `=`, `+`, `-`, `@` |
| Dependency vulns | `npm audit` and Gradle dependency check pass |
| Error leakage | API errors return `ErrorCode` enum, not stack traces |
| CORS config | Only allowed origins in Spring Security config |
| Input validation | All request DTOs have `@NotNull`, `@Size`, `@Valid` |

## Finance-Specific

| Check | How to Verify |
|-------|---------------|
| BigDecimal for money | No `double` or `float` for monetary amounts in Java entities |
| Transfer integrity | Source debit equals target credit — no money created/destroyed |
| Amount precision | `DECIMAL(15,2)` in MySQL schema for all monetary columns |
