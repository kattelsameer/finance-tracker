# Finance Tracker API Reference

> **Version**: 1.0.0  
> **Last Updated**: December 4, 2025  
> **Base URL**: `/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Accounts](#accounts)
4. [Transactions](#transactions)
5. [Categories](#categories)
6. [Budgets](#budgets)
7. [Recurring Transactions](#recurring-transactions)
8. [Tags](#tags)
9. [Notifications](#notifications)
10. [Dashboard](#dashboard)
11. [Reports](#reports)
12. [Search](#search)
13. [Import/Export](#importexport)
14. [Currency](#currency)
15. [Error Codes](#error-codes)
16. [Security Considerations](#security-considerations)
17. [API Versioning](#api-versioning)
18. [Date & Time Formats](#date--time-formats)
19. [Pagination](#pagination)
20. [Best Practices](#best-practices)

---

## Overview

- **Base URL**: `http://localhost:8080` (local development) or empty string when proxied by nginx in Docker
- **API Prefix**: `/api/v1`
- **Auth Cookie**: `auth_token` (HttpOnly, SameSite=Strict) set on successful login
- **CSRF**: `XSRF-TOKEN` exposed via response headers; axios client injects `X-XSRF-TOKEN`
- **Content Type**: `application/json`
- **Date Format**: ISO 8601 (`yyyy-MM-dd` for dates, `yyyy-MM-dd'T'HH:mm:ss` for timestamps)
- **Password Policy**: min 12 chars with at least 1 uppercase, 1 lowercase, 1 number, and 1 special from `@$!%*?&`

---

## Authentication

### Register

**POST** `/api/v1/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!XY",
  "displayName": "John Doe"
}
```

**Response:** `201 Created`

```json
{
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "message": "Success",
  "expiresAt": "2025-12-05T10:30:00"
}
```

**Set-Cookie:** `auth_token=<JWT>; HttpOnly; Secure; SameSite=Strict`

---

### Logout

**POST** `/api/v1/auth/logout`

**Auth Required:** Yes

Invalidate user session and clear authentication cookie.

**Response:** `200 OK`

```json
{
  "message": "Logged out successfully"
}
```

---

### Get Current User

**GET** `/api/v1/auth/me`

**Auth Required:** Yes

Retrieve authenticated user's profile.

**Response:** `200 OK`

```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "displayName": "John Doe",
  "createdAt": "2025-01-01T00:00:00"
}
```

---

### Update Profile

**PUT** `/api/v1/auth/me`

**Auth Required:** Yes

Update user profile information.

**Request Body:**

```json
{
  "email": "newemail@example.com",
  "displayName": "John Doe Jr."
}
```

**Response:** `200 OK` (UserResponse)

---

### Change Password

**POST** `/api/v1/auth/change-password`

**Auth Required:** Yes

Change user password.

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response:** `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

---

### Get CSRF Token

**GET** `/api/v1/auth/csrf-token`

Retrieve CSRF token for form submissions.

**Response:** `200 OK`

```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "headerName": "X-XSRF-TOKEN"
}
```

---

## Accounts

Manage financial accounts (checking, savings, credit cards, etc.).

### Create Account

**POST** `/api/v1/accounts`

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Chase Checking",
  "accountTypeId": 1,
  "initialBalance": 1500.00,
  "currency": "USD",
  "notes": "Primary checking account"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Chase Checking",
  "accountType": {
    "id": 1,
    "name": "Checking",
    "category": "ASSET"
  },
  "balance": 1500.00,
  "currency": "USD",
  "isActive": true,
  "notes": "Primary checking account",
  "createdAt": "2025-01-15T10:00:00",
  "updatedAt": "2025-01-15T10:00:00"
}
```

---

### Get All Accounts

**GET** `/api/v1/accounts`

**Auth Required:** Yes

**Query Parameters:**

- `activeOnly` (boolean, default: `false`) - Return only active accounts

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Chase Checking",
    "accountType": { "id": 1, "name": "Checking", "category": "ASSET" },
    "balance": 1500.00,
    "currency": "USD",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00"
  }
]
```

---

### Get Account by ID

**GET** `/api/v1/accounts/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Account ID

**Response:** `200 OK` (AccountResponse)

---

### Update Account

**PUT** `/api/v1/accounts/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Account ID

**Request Body:**

```json
{
  "name": "Chase Checking - Updated",
  "isActive": true,
  "notes": "Updated notes"
}
```

**Response:** `200 OK` (AccountResponse)

---

### Delete Account

**DELETE** `/api/v1/accounts/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Account ID

**Query Parameters:**

- `hard` (boolean, default: `false`) - Permanently delete vs soft delete

**Response:** `200 OK`

```json
{
  "message": "Account deleted successfully"
}
```

---

### Get Net Worth

**GET** `/api/v1/accounts/net-worth`

**Auth Required:** Yes

Calculate total net worth across all accounts.

**Response:** `200 OK`

```json
{
  "netWorth": 25750.50
}
```

---

### Get Account Types

**GET** `/api/v1/accounts/types`

**Auth Required:** No

Retrieve all available account types.

**Response:** `200 OK`

```json
[
  { "id": 1, "name": "Checking", "category": "ASSET" },
  { "id": 2, "name": "Savings", "category": "ASSET" },
  { "id": 3, "name": "Credit Card", "category": "LIABILITY" }
]
```

---

## Transactions

Manage financial transactions (income, expenses, transfers).

### Create Transaction

**POST** `/api/v1/transactions`

**Auth Required:** Yes

**Request Body:**

```json
{
  "accountId": 1,
  "categoryId": 5,
  "transactionType": "EXPENSE",
  "amount": 45.99,
  "currency": "USD",
  "transactionDate": "2025-12-04",
  "description": "Grocery shopping",
  "notes": "Weekly groceries at Whole Foods",
  "referenceNumber": "TXN-12345",
  "tagIds": [1, 3]
}
```

**Transaction Types:** `INCOME`, `EXPENSE`, `TRANSFER`

**For Transfers:**

```json
{
  "accountId": 1,
  "transferToAccountId": 2,
  "transactionType": "TRANSFER",
  "amount": 500.00,
  "transactionDate": "2025-12-04",
  "description": "Transfer to savings"
}
```

**Response:** `201 Created`

```json
{
  "id": 100,
  "account": { "id": 1, "name": "Chase Checking" },
  "category": { "id": 5, "name": "Groceries" },
  "transactionType": "EXPENSE",
  "amount": 45.99,
  "currency": "USD",
  "transactionDate": "2025-12-04",
  "description": "Grocery shopping",
  "notes": "Weekly groceries at Whole Foods",
  "referenceNumber": "TXN-12345",
  "tags": [
    { "id": 1, "name": "Essential" },
    { "id": 3, "name": "Food" }
  ],
  "createdAt": "2025-12-04T14:30:00"
}
```

---

### Get Transactions (Paginated)

**GET** `/api/v1/transactions`

**Auth Required:** Yes

**Query Parameters:**

- `accountId` (Long) - Filter by account
- `categoryId` (Long) - Filter by category
- `type` (TransactionType) - Filter by type: `INCOME`, `EXPENSE`, `TRANSFER`
- `startDate` (LocalDate) - Start date filter
- `endDate` (LocalDate) - End date filter
- `search` (String) - Search in description/notes
- `tagIds` (Set<Long>) - Filter by tag IDs
- `isRecurring` (Boolean) - Filter recurring transactions
- `page` (int, default: 0) - Page number
- `size` (int, default: 20) - Page size
- `sort` (String, default: `transactionDate,desc`) - Sort field and direction

**Example:** `/api/v1/transactions?type=EXPENSE&startDate=2025-11-01&endDate=2025-11-30&page=0&size=20`

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 100,
      "account": { "id": 1, "name": "Chase Checking" },
      "category": { "id": 5, "name": "Groceries" },
      "transactionType": "EXPENSE",
      "amount": 45.99,
      "transactionDate": "2025-12-04",
      "description": "Grocery shopping"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": { "sorted": true, "unsorted": false }
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true,
  "number": 0,
  "size": 20
}
```

---

### Get Transaction by ID

**GET** `/api/v1/transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Transaction ID

**Response:** `200 OK` (TransactionResponse)

---

### Update Transaction

**PUT** `/api/v1/transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Transaction ID

**Request Body:** (Same structure as CreateTransactionRequest)

**Response:** `200 OK` (TransactionResponse)

---

### Delete Transaction

**DELETE** `/api/v1/transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Transaction ID

**Response:** `200 OK`

```json
{
  "message": "Transaction deleted successfully"
}
```

---

## Categories

Manage transaction categories with hierarchical structure.

### Create Category

**POST** `/api/v1/categories`

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Groceries",
  "type": "EXPENSE",
  "parentId": 3,
  "colorCode": "#4CAF50",
  "icon": "shopping-cart",
  "description": "Food and household items"
}
```

**Category Types:** `INCOME`, `EXPENSE`

**Response:** `201 Created`

```json
{
  "id": 15,
  "name": "Groceries",
  "type": "EXPENSE",
  "parent": { "id": 3, "name": "Food" },
  "subcategories": [],
  "colorCode": "#4CAF50",
  "icon": "shopping-cart",
  "description": "Food and household items",
  "isSystem": false,
  "createdAt": "2025-12-04T10:00:00"
}
```

---

### Get All Categories

**GET** `/api/v1/categories`

**Auth Required:** Yes

**Query Parameters:**

- `type` (CategoryType) - Filter by type: `INCOME` or `EXPENSE`
- `includeSubcategories` (boolean, default: `true`) - Include subcategories in response

**Response:** `200 OK`

```json
[
  {
    "id": 3,
    "name": "Food",
    "type": "EXPENSE",
    "parent": null,
    "subcategories": [
      { "id": 15, "name": "Groceries" },
      { "id": 16, "name": "Restaurants" }
    ],
    "colorCode": "#FF5722",
    "icon": "restaurant",
    "isSystem": true
  }
]
```

---

### Get Category by ID

**GET** `/api/v1/categories/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Category ID

**Response:** `200 OK` (CategoryResponse)

---

### Update Category

**PUT** `/api/v1/categories/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Category ID

**Request Body:**

```json
{
  "name": "Groceries - Updated",
  "colorCode": "#8BC34A",
  "icon": "shopping-basket",
  "description": "Updated description"
}
```

**Response:** `200 OK` (CategoryResponse)

**Note:** System categories (`isSystem: true`) cannot be modified.

---

### Delete Category

**DELETE** `/api/v1/categories/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Category ID

**Response:** `200 OK`

```json
{
  "message": "Category deleted successfully"
}
```

**Note:** System categories cannot be deleted. Categories with associated transactions cannot be deleted.

---

## Budgets

Manage spending budgets with alerts.

### Create Budget

**POST** `/api/v1/budgets`

**Auth Required:** Yes

**Request Body:**

```json
{
  "categoryId": 5,
  "amount": 500.00,
  "periodType": "MONTHLY",
  "startDate": "2025-12-01",
  "endDate": "2025-12-31",
  "alertThreshold": 80
}
```

**Period Types:** `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

**Response:** `201 Created`

```json
{
  "id": 10,
  "category": { "id": 5, "name": "Groceries" },
  "amount": 500.00,
  "spent": 0.00,
  "remaining": 500.00,
  "percentageUsed": 0,
  "periodType": "MONTHLY",
  "startDate": "2025-12-01",
  "endDate": "2025-12-31",
  "alertThreshold": 80,
  "isActive": true,
  "createdAt": "2025-12-01T10:00:00"
}
```

---

### Get All Budgets

**GET** `/api/v1/budgets`

**Auth Required:** Yes

**Query Parameters:**

- `activeOnly` (boolean, default: `false`) - Return only active budgets

**Response:** `200 OK` (Array of BudgetResponse)

---

### Get Current Period Budgets

**GET** `/api/v1/budgets/current`

**Auth Required:** Yes

Retrieve budgets active in the current period.

**Response:** `200 OK` (Array of BudgetResponse)

---

### Get Budget Alerts

**GET** `/api/v1/budgets/alerts`

**Auth Required:** Yes

Retrieve budgets that have exceeded their alert threshold.

**Response:** `200 OK` (Array of BudgetResponse)

---

### Get Budget by ID

**GET** `/api/v1/budgets/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Budget ID

**Response:** `200 OK` (BudgetResponse)

---

### Update Budget

**PUT** `/api/v1/budgets/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Budget ID

**Request Body:**

```json
{
  "amount": 600.00,
  "alertThreshold": 85,
  "isActive": true
}
```

**Response:** `200 OK` (BudgetResponse)

---

### Delete Budget

**DELETE** `/api/v1/budgets/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Budget ID

**Response:** `204 No Content`

---

## Recurring Transactions

Manage recurring/scheduled transactions.

### Create Recurring Transaction

**POST** `/api/v1/recurring-transactions`

**Auth Required:** Yes

**Request Body:**

```json
{
  "accountId": 1,
  "categoryId": 8,
  "transactionType": "EXPENSE",
  "amount": 99.99,
  "currency": "USD",
  "description": "Netflix Subscription",
  "frequency": "MONTHLY",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "dayOfMonth": 15,
  "isActive": true
}
```

**Frequency Options:** `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY`

**Response:** `201 Created`

```json
{
  "id": 5,
  "account": { "id": 1, "name": "Chase Checking" },
  "category": { "id": 8, "name": "Subscriptions" },
  "transactionType": "EXPENSE",
  "amount": 99.99,
  "currency": "USD",
  "description": "Netflix Subscription",
  "frequency": "MONTHLY",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "nextOccurrence": "2025-12-15",
  "dayOfMonth": 15,
  "isActive": true,
  "createdAt": "2025-01-01T10:00:00"
}
```

---

### Get All Recurring Transactions

**GET** `/api/v1/recurring-transactions`

**Auth Required:** Yes

**Query Parameters:**

- `activeOnly` (boolean, default: `false`) - Return only active recurring transactions

**Response:** `200 OK` (Array of RecurringTransactionResponse)

---

### Get Recurring Transaction by ID

**GET** `/api/v1/recurring-transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Recurring transaction ID

**Response:** `200 OK` (RecurringTransactionResponse)

---

### Update Recurring Transaction

**PUT** `/api/v1/recurring-transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Recurring transaction ID

**Request Body:** (Same structure as CreateRecurringTransactionRequest)

**Response:** `200 OK` (RecurringTransactionResponse)

---

### Delete Recurring Transaction

**DELETE** `/api/v1/recurring-transactions/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Recurring transaction ID

**Response:** `204 No Content`

---

### Process Due Transactions

**POST** `/api/v1/recurring-transactions/process-due`

**Auth Required:** Admin

Process all recurring transactions that are due.

**Response:** `200 OK`

**Note:** This endpoint is typically called by a scheduled job.

---

## Tags

Manage transaction tags for flexible categorization.

### Create Tag

**POST** `/api/v1/tags`

**Auth Required:** Yes

**Request Body:**

```json
{
  "name": "Business Expense",
  "color": "#2196F3"
}
```

**Response:** `201 Created`

```json
{
  "id": 7,
  "name": "Business Expense",
  "color": "#2196F3",
  "createdAt": "2025-12-04T10:00:00"
}
```

---

### Get All Tags

**GET** `/api/v1/tags`

**Auth Required:** Yes

**Response:** `200 OK`

```json
[
  { "id": 1, "name": "Essential", "color": "#F44336" },
  { "id": 7, "name": "Business Expense", "color": "#2196F3" }
]
```

---

### Get Tag by ID

**GET** `/api/v1/tags/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Tag ID

**Response:** `200 OK` (TagResponse)

---

### Update Tag

**PUT** `/api/v1/tags/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Tag ID

**Request Body:**

```json
{
  "name": "Work Related",
  "color": "#3F51B5"
}
```

**Response:** `200 OK` (TagResponse)

---

### Delete Tag

**DELETE** `/api/v1/tags/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Tag ID

**Response:** `204 No Content`

---

## Dashboard

Retrieve dashboard statistics and insights.

### Get Dashboard Stats

**GET** `/api/v1/dashboard/stats`

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (LocalDate) - Start date (default: first day of current month)
- `endDate` (LocalDate) - End date (default: today)

**Example:** `/api/v1/dashboard/stats?startDate=2025-11-01&endDate=2025-11-30`

**Response:** `200 OK`

```json
{
  "totalIncome": 5000.00,
  "totalExpenses": 3250.75,
  "netSavings": 1749.25,
  "savingsRate": 34.98,
  "accountBalances": [
    { "accountId": 1, "accountName": "Chase Checking", "balance": 2500.00 },
    { "accountId": 2, "accountName": "Savings", "balance": 15000.00 }
  ],
  "expensesByCategory": [
    { "categoryId": 5, "categoryName": "Groceries", "amount": 450.00, "percentage": 13.85 },
    { "categoryId": 8, "categoryName": "Subscriptions", "amount": 99.99, "percentage": 3.08 }
  ],
  "incomeByCategory": [
    { "categoryId": 1, "categoryName": "Salary", "amount": 5000.00, "percentage": 100.00 }
  ],
  "recentTransactions": [
    {
      "id": 100,
      "description": "Grocery shopping",
      "amount": 45.99,
      "transactionDate": "2025-12-04"
    }
  ],
  "budgetAlerts": [
    {
      "budgetId": 10,
      "categoryName": "Groceries",
      "spent": 450.00,
      "limit": 500.00,
      "percentageUsed": 90
    }
  ]
}
```

---

## Reports

### Get Spending Report

**GET** `/api/v1/reports/spending`

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (LocalDate, required) - Report start date
- `endDate` (LocalDate, required) - Report end date
- `groupBy` (String) - Group results by: `CATEGORY`, `ACCOUNT`, `DAY`, `WEEK`, `MONTH`
- `categoryIds` (Set<Long>) - Filter by specific categories

**Example:** `/api/v1/reports/spending?startDate=2025-11-01&endDate=2025-11-30&groupBy=CATEGORY`

**Response:** `200 OK`

```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "totalExpenses": 3250.75,
  "groupedData": [
    {
      "key": "Groceries",
      "amount": 450.00,
      "percentage": 13.85,
      "transactionCount": 12
    },
    {
      "key": "Transportation",
      "amount": 275.50,
      "percentage": 8.47,
      "transactionCount": 8
    }
  ]
}
```

---

### Get Income Report

**GET** `/api/v1/reports/income`

**Auth Required:** Yes

**Query Parameters:** (Same as spending report)

**Response:** `200 OK` (Similar structure to spending report)

---

### Get Cash Flow Report

**GET** `/api/v1/reports/cash-flow`

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (LocalDate, required)
- `endDate` (LocalDate, required)
- `interval` (String) - `DAILY`, `WEEKLY`, `MONTHLY`

**Response:** `200 OK`

```json
{
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "interval": "WEEKLY",
  "data": [
    {
      "period": "2025-11-01 to 2025-11-07",
      "income": 5000.00,
      "expenses": 825.30,
      "netCashFlow": 4174.70
    }
  ]
}
```

---

## Search

### Advanced Search

**POST** `/api/v1/search/transactions`

**Auth Required:** Yes

**Request Body:**

```json
{
  "query": "grocery",
  "accountIds": [1, 2],
  "categoryIds": [5],
  "transactionType": "EXPENSE",
  "minAmount": 10.00,
  "maxAmount": 100.00,
  "startDate": "2025-11-01",
  "endDate": "2025-11-30",
  "tagIds": [1, 3],
  "page": 0,
  "size": 20
}
```

**Response:** `200 OK` (Paginated transaction results)

---

## Import/Export

### Import CSV

**POST** `/api/v1/import/csv`

**Auth Required:** Yes

**Content-Type:** `multipart/form-data`

**Form Data:**

- `file` (file) - CSV file
- `accountId` (Long) - Target account ID
- `dateFormat` (String, optional) - Date format: `yyyy-MM-dd`, `MM/dd/yyyy`, `dd/MM/yyyy`

**CSV Format:**

```csv
Date,Description,Amount,Type,Category,Notes
2025-12-01,Grocery Store,45.67,EXPENSE,Groceries,Weekly shopping
2025-12-02,Salary,3000.00,INCOME,Salary,Monthly salary
```

**Response:** `200 OK`

```json
{
  "totalRows": 50,
  "successfulImports": 48,
  "failedImports": 2,
  "errors": [
    {
      "row": 15,
      "error": "Invalid date format"
    }
  ]
}
```

---

### Export CSV

**GET** `/api/v1/export/transactions/csv`

**Auth Required:** Yes

**Query Parameters:**

- `startDate` (LocalDate, required)
- `endDate` (LocalDate, required)
- `accountIds` (Set<Long>, optional)
- `categoryIds` (Set<Long>, optional)

**Response:** `200 OK`

**Content-Type:** `text/csv`

**Headers:** `Content-Disposition: attachment; filename="transactions-YYYY-MM-DD.csv"`

---

## Currency

### Get Supported Currencies

**GET** `/api/v1/currencies`

**Auth Required:** No

**Response:** `200 OK`

```json
[
  {
    "code": "USD",
    "name": "US Dollar",
    "symbol": "$",
    "isActive": true
  },
  {
    "code": "EUR",
    "name": "Euro",
    "symbol": "€",
    "isActive": true
  }
]
```

---

### Convert Currency

**GET** `/api/v1/currencies/convert`

**Auth Required:** Yes

**Query Parameters:**

- `from` (String) - Source currency code (e.g., "USD")
- `to` (String) - Target currency code (e.g., "EUR")
- `amount` (BigDecimal) - Amount to convert

**Example:** `/api/v1/currencies/convert?from=USD&to=EUR&amount=100`

**Response:** `200 OK`

```json
{
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "amount": 100.00,
  "convertedAmount": 92.50,
  "exchangeRate": 0.925,
  "timestamp": "2025-12-04T14:30:00"
}
```

---

## Notifications

### Get All Notifications

**GET** `/api/v1/notifications`

**Auth Required:** Yes

**Query Parameters:**

- `unreadOnly` (boolean, default: `false`)
- `type` (NotificationType) - Filter by type
- `page` (int, default: 0)
- `size` (int, default: 20)

**Notification Types:** `BUDGET_ALERT`, `RECURRING_TRANSACTION`, `SYSTEM`

**Response:** `200 OK`

```json
{
  "content": [
    {
      "id": 1,
      "type": "BUDGET_ALERT",
      "title": "Budget Alert: Groceries",
      "message": "You've used 90% of your Groceries budget",
      "priority": "HIGH",
      "isRead": false,
      "createdAt": "2025-12-04T10:00:00"
    }
  ],
  "totalElements": 15,
  "totalPages": 1
}
```

---

### Mark Notification as Read

**PUT** `/api/v1/notifications/{id}/read`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Notification ID

**Response:** `200 OK`

---

### Mark All as Read

**PUT** `/api/v1/notifications/mark-all-read`

**Auth Required:** Yes

**Response:** `200 OK`

```json
{
  "message": "All notifications marked as read",
  "count": 15
}
```

---

### Delete Notification

**DELETE** `/api/v1/notifications/{id}`

**Auth Required:** Yes

**Path Variables:**

- `id` (Long) - Notification ID

**Response:** `204 No Content`

---

## Error Codes

All error responses follow this structure:

```json
{
  "code": 1001,
  "message": "Invalid username or password",
  "timestamp": "2025-12-04T14:30:00",
  "path": "/api/v1/auth/login"
}
```

### Authentication Errors (1000-1099)

| Code | Message | HTTP Status |
|------|---------|-------------|
| 1001 | Invalid username or password | 401 |
| 1002 | Account is locked. Please try again later | 423 |
| 1003 | Username already exists | 409 |
| 1004 | Email already exists | 409 |
| 1005 | User not found | 404 |
| 1006 | Unauthorized access | 401 |
| 1007 | Token has expired | 401 |
| 1008 | Invalid token | 401 |

### Validation Errors (2000-2099)

| Code | Message | HTTP Status |
|------|---------|-------------|
| 2001 | Validation failed | 400 |
| 2002 | Invalid input provided | 400 |
| 2003 | Required field is missing | 400 |

### Resource Errors (3000-3099)

| Code | Message | HTTP Status |
|------|---------|-------------|
| 3001 | Resource not found | 404 |
| 3002 | Account not found | 404 |
| 3003 | Category not found | 404 |
| 3004 | Transaction not found | 404 |
| 3005 | Budget not found | 404 |
| 3006 | Tag not found | 404 |
| 3007 | Recurring transaction not found | 404 |
| 3008 | Currency not found | 404 |

### Business Logic Errors (4000-4099)

| Code | Message | HTTP Status |
|------|---------|-------------|
| 4001 | Insufficient account balance | 400 |
| 4002 | Resource already exists | 409 |
| 4003 | Operation not allowed | 403 |
| 4004 | Invalid transfer - source and destination accounts must be different | 400 |
| 4005 | Budget limit exceeded | 400 |
| 4006 | Tag with this name already exists | 409 |
| 4007 | End date must be after start date | 400 |
| 4008 | Account type not found | 404 |
| 4009 | Invalid category type for this transaction | 400 |
| 4010 | Invalid operation | 400 |

### Server Errors (5000-5099)

| Code | Message | HTTP Status |
|------|---------|-------------|
| 5001 | An internal error occurred | 500 |
| 5002 | Database error occurred | 500 |
| 5003 | External service error | 503 |
| 5004 | External API error | 503 |

---

## Security Considerations

### Authentication

- **JWT Tokens**: Stored in HttpOnly cookies to prevent XSS attacks  
  - **Cookie name (dev/demo)**: `auth_token`  
  - **Cookie name (production)**: `finance_tracker_token`
- **Cookie Attributes**:  
  - **Dev/demo**: `HttpOnly`, `Secure=false` (allows HTTP for local/demo usage), `SameSite=Lax`  
  - **Production**: `HttpOnly`, `Secure` (HTTPS only), `SameSite=Strict`
- **Token Expiration**: 1 hour from login (configurable; 24 hours in demo mode)
- **Password Requirements**: Minimum 12 characters with complexity requirements

### CSRF Protection

- **CSRF Token**: Exposed via `XSRF-TOKEN` cookie
- **Header Required**: All state-changing requests (POST, PUT, DELETE) require `X-XSRF-TOKEN` header
- **Frontend Integration**: Axios automatically includes CSRF token from cookie

### CORS

- **Development**: Allows `http://localhost:5173` (Vite dev server)
- **Production**: Restricted to same origin (nginx proxy)
- **Credentials**: `withCredentials: true` required for cookie transmission

### Rate Limiting

- **Not Currently Implemented**: Consider implementing rate limiting for production
- **Recommended**: 100 requests per minute per user
- **Attack Prevention**: Prevents brute force attacks on login endpoint

### SQL Injection Prevention

- **JPA/Hibernate**: Parameterized queries prevent SQL injection
- **Repository Layer**: Spring Data JPA methods use prepared statements

### XSS Prevention

- **Input Validation**: All user inputs validated via `@Valid` annotations
- **Output Encoding**: Frontend sanitizes HTML in user-generated content
- **HttpOnly Cookies**: Tokens not accessible via JavaScript

### Authorization

- **User Isolation**: All queries filter by `userId` to prevent unauthorized access
- **Resource Ownership**: Users can only access their own resources
- **No Role-Based Access**: Currently single-user focused (future enhancement)

---

## API Versioning

### Current Version

- **Version**: `v1`
- **Base Path**: `/api/v1`
- **Stability**: Beta - Breaking changes may occur

### Versioning Strategy

- **URL Versioning**: Version included in URL path (`/api/v1`, `/api/v2`)
- **Backwards Compatibility**: New versions maintain backward compatibility when possible
- **Deprecation Policy**: 6-month notice before removing deprecated endpoints
- **Version Header**: Optional `API-Version` header for client tracking

### Future Versions

When breaking changes are necessary:

1. New version endpoint created (e.g., `/api/v2`)
2. Old version remains available with deprecation notice
3. Migration guide provided in documentation
4. Minimum 6-month transition period

---

## Date & Time Formats

- **Dates:** ISO 8601 format `yyyy-MM-dd` (e.g., "2025-12-04")
- **Timestamps:** ISO 8601 format `yyyy-MM-dd'T'HH:mm:ss` (e.g., "2025-12-04T14:30:00")
- **Timezone:** All timestamps in UTC (server timezone)

---

## Pagination

All paginated endpoints return:

```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 150,
  "totalPages": 8,
  "last": false,
  "first": true,
  "number": 0,
  "size": 20
}
```

**Query Parameters:**

- `page` (int, default: 0) - Zero-based page number
- `size` (int, default: 20) - Page size (max: 100)
- `sort` (String) - Sort field and direction (e.g., `transactionDate,desc`)

---

## Best Practices

### Request Headers

Always include:

```
Content-Type: application/json
X-XSRF-TOKEN: <token-from-cookie>
```

### Error Handling

Always check HTTP status codes and parse error response body:

```javascript
try {
  const response = await apiClient.post('/api/v1/transactions', data);
} catch (error) {
  if (error.response) {
    // Server responded with error
    const { code, message } = error.response.data;
    console.error(`Error ${code}: ${message}`);
  }
}
```

### Date Handling

Use ISO 8601 format for all dates:

```javascript
const transactionDate = new Date().toISOString().split('T')[0]; // "2025-12-04"
```

### Pagination

For large datasets, always use pagination:

```javascript
const fetchAllTransactions = async () => {
  let page = 0;
  let allTransactions = [];
  let hasMore = true;
  
  while (hasMore) {
    const response = await apiClient.get(`/api/v1/transactions?page=${page}&size=100`);
    allTransactions = [...allTransactions, ...response.content];
    hasMore = !response.last;
    page++;
  }
  
  return allTransactions;
};
```

---

## Contact & Support

For API issues or questions:

- GitHub Issues: [finance-tracker/issues](https://github.com/kattelsameer/finance-tracker/issues)
- Documentation: [docs/](../README.md)

---

**Last Updated:** December 4, 2025  
**API Version:** 1.0.0
