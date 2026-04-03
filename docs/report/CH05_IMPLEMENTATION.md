# Chapter 5 — Implementation

> **Report Navigation:** [← Chapter 4](./CH04_SYSTEM_DESIGN.md) | [Index](./README.md) | [Chapter 6 →](./CH06_TESTING.md)

---

## 5.1 Introduction

This chapter describes the implementation of Finance Tracker's major components: the database schema, backend API, frontend application, security layer, recurring scheduler, and deployment configuration. Code snippets illustrate key patterns; full source code is available in the project repository.

---

## 5.2 Development Methodology

Development followed an **iterative approach** with feature branches and pull requests:

1. **Database-first:** Each feature began with a Flyway migration defining the schema.
2. **Backend-first:** Entity → Repository → Service → Controller, verified with integration tests.
3. **Frontend-last:** Service → Hook → Component → Page, verified with Vitest unit tests and Playwright E2E.
4. **Documentation:** Docs updated at each milestone.

**Tools used:**
- Git + GitHub for version control and code review.
- Gradle (backend) and npm (frontend) for build management.
- Docker Compose for local integration testing of the full stack.
- IntelliJ IDEA (backend), VS Code (frontend).

---

## 5.3 Database Implementation

### 5.3.1 Flyway Migration Timeline

**Figure 5.1 — Flyway Migration Timeline V1–V20**

```
V1  users
V2  account_types
V3  accounts
V4  categories
V5  transactions
V6  tags
V7  transaction_tags
V8  budgets
V9  recurring_transactions
V10 audit_log
V11 revoked_tokens
V12 ──── seed default categories ────────────────────────────────── SEED
V13 currencies
V14 currency relationships ────────────────────────────────────── DATA
V15 saved_searches
V16 notifications
V17 notification_preferences
V18 additional currencies ─────────────────────────────────────── DATA
V19 set NPR as default currency ───────────────────────────────── DATA
V20 NPR default for accounts/transactions ─────────────────────── DATA

     [Core Schema]   [Enhancements]          [NPR Localisation]
```

**Table 5.1 — Flyway Migrations V1–V20**

| Migration | Tables Created | Purpose |
|-----------|----------------|---------|
| V1 | `users` | Authentication, lockout, preferences |
| V2 | `account_types` | Lookup table: 6 account types |
| V3 | `accounts` | Financial account management |
| V4 | `categories` | Hierarchical category system |
| V5 | `transactions` | Core transaction recording |
| V6 | `tags` | Transaction tagging |
| V7 | `transaction_tags` | Many-to-many link table |
| V8 | `budgets` | Budget with alert threshold |
| V9 | `recurring_transactions` | Periodic transaction templates |
| V10 | `audit_log` | Immutable change history |
| V11 | `revoked_tokens` | Token blocklist for secure logout |
| V12 | — | Seeded default income/expense categories |
| V13 | `currencies` | ISO 4217 currencies + exchange rates |
| V14 | — | Currency relationship data |
| V15 | `saved_searches` | Persisted search queries |
| V16 | `notifications` | In-app notification records |
| V17 | `notification_preferences` | Per-user notification settings |
| V18 | — | Additional currencies (AED, GBP, etc.) |
| V19 | — | NPR set as system default |
| V20 | — | NPR applied to existing accounts/transactions |

### 5.3.2 Key Schema Decisions

**Monetary precision:** All financial amounts use `DECIMAL(15,2)` — this supports values up to 999,999,999,999,999.99 with two decimal places, avoiding any floating-point rounding errors.

**Soft deletes vs. CASCADE:** Accounts, categories, and tags use `is_active` flags for soft deletion. Transactions use `CASCADE DELETE` from accounts to maintain referential integrity while allowing account removal.

**Materialized paths for categories:** The `path` column in `categories` stores the ancestor chain (e.g., `"1/5/12"`), enabling efficient subtree queries without recursive CTEs.

---

## 5.4 Backend Implementation

### 5.4.1 Package Structure

**Figure 5.2 — Backend Package Structure**

```
com.financetracker/
├── FinanceTrackerApplication.java   ← @SpringBootApplication entry point
├── config/
│   ├── SecurityConfig.java          ← Spring Security; JWT filter chain; CSRF
│   ├── JwtProperties.java           ← @ConfigurationProperties for JWT settings
│   ├── CorsConfig.java              ← CORS for dev profile (origin: localhost:5173)
│   ├── OpenApiConfig.java           ← SpringDoc/Swagger configuration
│   └── SchedulerConfig.java         ← @EnableScheduling
├── controller/                      ← 14 REST controllers
├── dto/                             ← Request + Response DTOs with Bean Validation
├── entity/                          ← 13 JPA entities with @Getter/@Setter (Lombok)
├── repository/                      ← JpaRepository extensions + JPA Specifications
├── service/                         ← Business logic (@Transactional)
├── security/
│   ├── JwtTokenProvider.java        ← Token generation/validation (HS512)
│   ├── JwtAuthenticationFilter.java ← OncePerRequestFilter; extracts JWT from cookie
│   └── UserPrincipal.java           ← Spring Security UserDetails implementation
├── exception/
│   ├── GlobalExceptionHandler.java  ← @ControllerAdvice; standardised error format
│   ├── ApiException.java            ← Custom runtime exception with ErrorCode
│   └── ErrorCode.java               ← Enum: 1xxx auth, 2xxx validation, 3xxx not-found
├── mapper/                          ← MapStruct interfaces (entity ↔ DTO)
└── specification/                   ← JPA Specification builders for dynamic filters
```

### 5.4.2 Entity Design

Entities use `@Getter` / `@Setter` from Lombok rather than `@Data`, avoiding broken JPA equals/hashCode. The `Transaction` entity illustrates key patterns:

```java
@Entity
@Table(name = "transactions")
@Getter
@Setter
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    // Self-referencing for transfer pairs
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_transaction_id")
    private Transaction transferTransaction;

    // ... remaining fields
}
```

### 5.4.3 Service Layer Pattern

Services are annotated with `@Service` and `@Transactional` for write operations. Every query is scoped to `userId` to enforce user data isolation:

```java
@Service
@Transactional(readOnly = true)
public class TransactionService {

    public Page<TransactionResponse> getTransactions(Long userId,
            TransactionFilter filter, Pageable pageable) {
        Specification<Transaction> spec = TransactionSpecification
            .forUser(userId)           // ← ALWAYS filter by userId
            .and(TransactionSpecification.withFilter(filter));

        return transactionRepository.findAll(spec, pageable)
            .map(transactionMapper::toResponse);
    }

    @Transactional
    public TransactionResponse createTransaction(Long userId,
            CreateTransactionRequest request) {
        // 1. Load user + account (verify ownership)
        // 2. Create and save transaction
        // 3. Update account balance
        // 4. Handle transfer pair if type == TRANSFER
        // 5. Map and return response
    }
}
```

### 5.4.4 Security Implementation

**JWT Token Provider** generates tokens signed with HS512:

```java
public String generateToken(UserDetails userDetails, boolean rememberMe) {
    long expiration = rememberMe ? REMEMBER_ME_DURATION_MS : jwtProperties.getExpirationMs();
    return Jwts.builder()
        .subject(userDetails.getUsername())
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + expiration))
        .signWith(getSigningKey(), Jwts.SIG.HS512)
        .compact();
}
```

**JWT Authentication Filter** extracts the token from the HttpOnly cookie:

```java
@Override
protected void doFilterInternal(HttpServletRequest request,
        HttpServletResponse response, FilterChain filterChain) {

    String token = extractTokenFromCookie(request);  // reads "auth_token" cookie
    if (token != null && tokenProvider.validateToken(token)) {
        String tokenHash = hashToken(token);

        if (!revokedTokenRepository.existsByTokenHash(tokenHash)) {
            String username = tokenProvider.getUsernameFromToken(token);
            Long userId = tokenProvider.getUserIdFromToken(token);
            UserPrincipal userPrincipal = new UserPrincipal(userId, username, "", Collections.emptyList());
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                    userPrincipal, null, userPrincipal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
    }
    filterChain.doFilter(request, response);
}
```

### 5.4.5 Recurring Transaction Scheduler

A Spring `@Scheduled` task runs daily, finds all due templates, and creates transactions:

```java
@Scheduled(cron = "0 0 0 * * *")   // midnight daily
@Transactional
public void processRecurringTransactions() {
    LocalDate today = LocalDate.now();
    List<RecurringTransaction> due = recurringRepo
        .findByIsActiveTrueAndNextOccurrenceLessThanEqual(today);

    for (RecurringTransaction template : due) {
        createTransactionFromTemplate(template);
        advanceNextOccurrence(template);
        notificationService.createRecurringNotification(template);
    }
}
```

### 5.4.6 CSV Import/Export

The `ImportExportService` supports flexible CSV column name mapping:

| Field | Accepted Header Variants |
|-------|--------------------------|
| Date | `Date`, `date`, `Transaction Date` |
| Amount | `Amount`, `amount` |
| Description | `Description`, `description`, `Details` |
| Type | `Type`, `type`, `Transaction Type` |
| Category | `Category`, `category` |
| Notes | `Notes`, `notes`, `Memo` |

Supported date formats: `yyyy-MM-dd`, `MM/dd/yyyy`, `dd/MM/yyyy`, `M/d/yyyy`.

### 5.4.7 Error Handling

`GlobalExceptionHandler` maps exceptions to standardised error responses:

```java
@ExceptionHandler(ApiException.class)
public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
    return ResponseEntity.status(ex.getHttpStatus())
        .body(ErrorResponse.builder()
            .errorCode(ex.getErrorCode().getCode())
            .message(ex.getMessage())
            .timestamp(Instant.now())
            .build());
}
```

**Table 5.2 — API Controllers and Endpoint Count**

| Controller | Endpoints |
|-----------|-----------|
| AuthController | 7 |
| AccountController | 8 |
| TransactionController | 6 |
| CategoryController | 5 |
| BudgetController | 7 |
| RecurringTransactionController | 6 |
| TagController | 5 |
| DashboardController | 1 |
| ReportController | 4 |
| ImportExportController | 4 |
| CurrencyController | 8 |
| NotificationController | 10 |
| SearchController | 7 |
| UserSettingsController | 4 |
| **Total** | **82** |

---

## 5.5 Frontend Implementation

### 5.5.1 Application Entry Point

```tsx
// src/main.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### 5.5.2 API Client with CSRF Handling

The `ApiClient` class wraps Axios with automatic CSRF token management:

```typescript
// src/lib/api-client.ts
class ApiClient {
  private csrfToken: string | null = null;

  private setupInterceptors() {
    this.client.interceptors.request.use(async (config) => {
      const isMutation = ['post','put','patch','delete']
        .includes(config.method?.toLowerCase() ?? '');
      const isAuthRoute = config.url?.includes('auth/login') ||
                          config.url?.includes('auth/register');

      if (isMutation && !isAuthRoute) {
        if (!this.csrfToken) await this.fetchCsrfToken();
        config.headers['X-XSRF-TOKEN'] = this.csrfToken;
      }
      return config;
    });
  }

  private async fetchCsrfToken() {
    const res = await this.client.get<{ token: string }>(ENDPOINTS.CSRF_TOKEN);
    this.csrfToken = res.data.token;
  }
}
```

### 5.5.3 Service Layer

Each feature has a dedicated service file:

```typescript
// src/services/transaction.service.ts
export const transactionService = {
  async getAll(params?: TransactionFilter): Promise<PageResponse<TransactionResponse>> {
    return apiClient.get<PageResponse<TransactionResponse>>(ENDPOINTS.TRANSACTIONS, { params });
  },
  async create(data: CreateTransactionRequest): Promise<TransactionResponse> {
    return apiClient.post<TransactionResponse>(ENDPOINTS.TRANSACTIONS, data);
  },
  async update(id: number, data: UpdateTransactionRequest): Promise<TransactionResponse> {
    return apiClient.put<TransactionResponse>(`${ENDPOINTS.TRANSACTIONS}/${id}`, data);
  },
  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`${ENDPOINTS.TRANSACTIONS}/${id}`);
  },
};
```

### 5.5.4 TanStack Query Hooks

```typescript
// src/hooks/useTransactions.ts
export function useTransactions(filter?: TransactionFilter) {
  return useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => transactionService.getAll(filter),
    staleTime: 30_000,  // 30 seconds before background refetch
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });  // balance update
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
```

### 5.5.5 Form Validation with Zod

React Hook Form + Zod provides type-safe, schema-driven form validation:

```typescript
const transactionSchema = z.object({
  accountId: z.number({ required_error: 'Account is required' }),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Amount must be positive'),
  transactionDate: z.string().min(1, 'Date is required'),
  categoryId: z.number().optional(),
  description: z.string().max(500).optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;
```

### 5.5.6 Component Architecture

**Figure 5.3 — Frontend Component Hierarchy (Transactions example)**

```
TransactionsPage (page)
  ├── TransactionFilters (filter sidebar/bar)
  │     └── DateRangePicker, CategorySelect, AccountSelect
  ├── TransactionTable (data display)
  │     ├── Table (ui/Table.tsx — generic)
  │     ├── TransactionRow
  │     │     └── Badge, CurrencyDisplay
  │     └── Pagination
  └── TransactionFormModal (create/edit)
        ├── Modal (ui/Modal.tsx)
        ├── Input, Select, Textarea (ui primitives)
        └── useMutation → transactionService.create/update
```

### 5.5.7 Recharts Financial Visualisations

Income vs. Expense bar chart implemented with Recharts:

```tsx
<BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20 }}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={(val) => formatCurrency(val, currency)} />
  <Tooltip formatter={(val) => formatCurrency(Number(val), currency)} />
  <Legend />
  <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
  <Bar dataKey="expense" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
</BarChart>
```

---

## 5.6 Demo Data Implementation

For demo/evaluation purposes, Flyway demo migrations (V100–V107 under `db/demo/`) seed:
- A demo user (`demo` / `Demo123!`)
- Multiple accounts (Checking, Savings, Credit Card, eSewa Wallet)
- 90+ sample transactions across 3 months
- Pre-configured budgets and recurring transactions
- Realistic NPR amounts (e.g., salary of NPR 80,000, rent NPR 25,000)

---

## 5.7 Implementation Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| CSRF token for SPA | Fetch-on-demand before first mutation; cache in ApiClient; refresh on 403 |
| Transfer atomic balance update | Spring `@Transactional` wraps both account balance updates |
| Recurring tx next-occurrence logic | Dedicated `FrequencyCalculator` utility; handles BIWEEKLY, QUARTERLY edge cases |
| Dynamic transaction filtering | JPA Specifications (Criteria API) avoid N+1 and support complex AND/OR predicates |
| Category hierarchy | Materialized path column + self-referencing `parent_id` FK |
| NPR formatting | `Intl.NumberFormat` with `currency: 'NPR'` and fallback for environments without NPR support |

---

## 5.8 Summary

This chapter has covered:
- Database-first iterative development using Flyway migrations.
- Spring Boot backend: entity design, service patterns, security, scheduler, and CSV handling.
- React frontend: API client, service layer, TanStack Query hooks, form validation, and charts.
- Demo data seeding for evaluation.
- Key implementation challenges and their solutions.

Chapter 6 covers the testing strategy and results.

---

> **[← Chapter 4](./CH04_SYSTEM_DESIGN.md) | [Index](./README.md) | [Chapter 6 →](./CH06_TESTING.md)**
