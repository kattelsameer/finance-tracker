# Finance Tracker User Guide

> **Version**: 1.0.0  
> **Last Updated**: March 18, 2026

Welcome to Finance Tracker! This guide documents implemented features and how to navigate them.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Accounts Management](#accounts-management)
4. [Transactions](#transactions)
5. [Categories](#categories)
6. [Budgets](#budgets)
7. [Recurring Transactions](#recurring-transactions)
8. [Reports](#reports)
9. [Tags](#tags)
10. [Notifications](#notifications)
11. [Advanced Search](#advanced-search)
12. [Import & Export](#import--export)
13. [Settings & Profile](#settings--profile)

---

## Getting Started

### Create Your Account

1. Navigate to the Finance Tracker application
2. Click **"Register"** on the login page (`/register`)
3. Fill in your details:
   - **Username**: Your unique username (3-20 characters)
   - **Email**: Your email address
   - **Password**: Must be at least 12 characters (with uppercase, lowercase, digit, and special character)
   - **Display Name**: How you want to be addressed
4. Click **"Create Account"**
5. You'll be automatically logged in

### First Login

1. Enter your **username** and **password** on `/login`
2. Click **"Sign In"**
3. On success, you are redirected to the **Dashboard** (`/`)

---

## Dashboard

The Dashboard (`/`) shows summary cards and trends.

### Overview Cards

- **Total Balance**: Sum of all active accounts
- **Monthly Income**: Income for the current month
- **Monthly Expenses**: Expenses for the current month
- **Net Savings**: Income minus expenses

### Trends & Recent Activity

- **Top Spending Categories**: Pie chart showing where your money goes
- **Income vs Expenses**: Line chart showing trends over time
- **Recent Transactions**: Last 10 transactions
- **Budget Progress**: Visual indicators for budget goals

### Dashboard Screenshot

![Dashboard Overview Placeholder](./images/dashboard-overview.png)

---

## Accounts Management

Manage accounts at `/accounts`.

### Account Types

| Type | Description | Examples |
|------|-------------|----------|
| **Checking** | Day-to-day banking | Bank checking account |
| **Savings** | Interest-bearing savings | Savings account, CDs |
| **Cash** | Physical cash | Wallet, safe |
| **Credit Card** | Revolving credit | Visa, Mastercard |
| **Investment** | Investment accounts | Brokerage, 401(k) |
| **Loan** | Debt accounts | Mortgage, car loan |

### Create an Account

1. Navigate to **Accounts** (`/accounts`)
2. Click **"+ New Account"**
3. Fill in the details:
   - **Account Name**: e.g., "Chase Checking"
   - **Account Type**: Select from dropdown
   - **Currency**: USD, EUR, GBP, etc.
   - **Initial Balance**: Starting balance
   - **Institution**: Bank name (optional)
   - **Color**: For visual identification
4. Click **"Create Account"**

### Edit an Account

1. Click on the account card
2. Click **"Edit"** button
3. Update fields as needed
4. Click **"Save Changes"**

### Archive an Account

Archiving removes an account from active view without deleting history:

1. Click the account
2. Click **Archive**
3. Confirm the action

### Accounts Screenshot

![Accounts Page Placeholder](./images/accounts.png)

---

## Transactions

Manage transactions at `/transactions`.

### Transaction Types

- **Income**: Money received (salary, gifts, refunds)
- **Expense**: Money spent (groceries, bills, entertainment)
- **Transfer**: Move money between your accounts

### Add a Transaction

1. Navigate to **Transactions** (`/transactions`)
2. Click **"+ New Transaction"**
3. Fill in the details:
   - **Type**: Income, Expense, or Transfer
   - **Amount**: Transaction amount
   - **Account**: Which account (source for expense/transfer)
   - **Category**: What type of transaction
   - **Date**: When it occurred
   - **Description**: Brief note
   - **Tags**: Optional labels for better organization
4. Click **"Save"**

### For Transfers

- Select **"Transfer"** type
- Choose **"From Account"** and **"To Account"**
- The system creates linked transactions automatically

### Edit a Transaction

1. Find the transaction in the list
2. Click the transaction row
3. Update fields as needed
4. Click **"Save Changes"**

### Delete a Transaction

1. Click on the transaction
2. Click **"Delete"** button
3. Confirm the action
4. Account balance updates automatically

### Filtering & Pagination

- Filter by date, account, category, type
- Full-text search in description and notes
- Paginated list for large datasets

### Transactions Screenshot

![Transactions Page Placeholder](./images/transactions.png)

- **Filter**: By date, account, category, type
- **Sort**: By date, amount, description
- **Search**: Full-text search in description and notes

---

## Categories

Manage hierarchical categories at `/categories`.

### Built-in Categories

The system comes with default categories:

**Income**:

- Salary
- Freelance
- Investments
- Gifts
- Other Income

**Expenses**:

- Food & Dining
- Transportation
- Housing
- Utilities
- Healthcare
- Entertainment
- Shopping
- Education
- Insurance
- Personal Care
- Other

### Create or Edit Categories

1. Navigate to **Categories** (`/categories`)
2. Click **"+ New Category"**
3. Enter:
   - **Name**: Category name
   - **Type**: Income or Expense
   - **Parent**: Optional (for subcategories)
   - **Color**: Visual identifier
   - **Icon**: Choose an icon
4. Click **"Create"

### Categories Screenshot

![Categories Page Placeholder](./images/categories.png)

## Tags

Manage tags at `/tags`. Tags can be added on transaction create/edit and used in search filters.

### Tags Screenshot

![Tags Page Placeholder](./images/tags.png)

---

## Budgets

Manage budgets with alerts at `/budgets`.

### Create a Budget

1. Navigate to **Budgets** (`/budgets`)
2. Click **"+ New Budget"**
3. Set parameters:
   - **Name**: e.g., "Groceries Budget"
   - **Amount**: Monthly limit
   - **Category**: What to track
   - **Period**: Monthly, Quarterly, Yearly
   - **Start Date**: When it begins
4. Click **"Create Budget"**

### Monitor Budget Progress

- **Green**: Under 75% of budget
- **Yellow**: 75-95% of budget
- **Orange**: 95-100% of budget
- **Red**: Over budget

### Budget Alerts

Get notified when:

- Reaching 80% of budget
- Reaching 95% of budget
- Exceeding budget

Configure thresholds in **Settings → Notifications** (`/settings?tab=notifications`).

### Budgets Screenshot

![Budgets Page Placeholder](./images/budgets.png)

---

## Recurring Transactions

Manage recurring items at `/recurring-transactions`.

### Supported Frequencies

- **Daily**: Every day
- **Weekly**: Every 7 days
- **Bi-weekly**: Every 14 days
- **Monthly**: Same day each month
- **Quarterly**: Every 3 months
- **Yearly**: Same date each year

### Create Recurring Transaction

1. Navigate to **Recurring Transactions** (`/recurring-transactions`)
2. Click **"+ New Recurring Transaction"**
3. Fill in details:
   - **Type**: Income, Expense, or Transfer
   - **Amount**: Transaction amount
   - **Frequency**: How often
   - **Start Date**: First occurrence
   - **End Date**: Optional (leave blank for indefinite)
   - **Auto-post**: Automatically create transactions
4. Click **"Create"**

### Manage Recurring Transactions

- **Edit**: Update amount, frequency, or dates
- **Pause**: Temporarily disable
- **Resume**: Reactivate a paused transaction
- **Delete**: Permanently remove

### Manual Posting

If auto-post is disabled:

1. View upcoming transactions
2. Click **"Post Now"** to create the transaction
3. Useful for verifying before posting

### Recurring Transactions Screenshot

![Recurring Transactions Placeholder](./images/recurring.png)

---

## Reports

View reports at `/reports`.

### Available Reports

#### 1. Income vs Expenses

- Line chart comparing monthly income and expenses
- Identify spending trends
- See seasonal patterns

#### 2. Spending by Category

- Pie chart showing expense distribution
- Identify top spending categories
- Find areas to cut back

#### 3. Net Worth Trend

- Track total assets over time
- Include/exclude accounts as needed
- Long-term financial health indicator

#### 4. Cash Flow

- Monthly cash inflows and outflows
- Understand liquidity
- Plan for large expenses

#### 5. Category Trends

- Track specific category spending over time
- Compare to budgets
- Identify anomalies

### Filters & Export

- **Date Range**: Custom, common presets
- **Accounts**: Filter by specific accounts
- **Categories**: Include/exclude categories
- **Export**: Download CSV

### Reports Screenshot

![Reports Page Placeholder](./images/reports.png)

---

## Advanced Search

Search across transactions at `/search`.

### Search Filters

- **Text Search**: Search in description and notes
- **Date Range**: Specific start and end dates
- **Accounts**: One or multiple accounts
- **Categories**: Filter by category
- **Type**: Income, Expense, Transfer
- **Amount Range**: Min and max amounts
- **Tags**: Match all selected tags

### Advanced Search Screenshot

![Advanced Search Placeholder](./images/search.png)

### Tips for Effective Searching

- Use **AND** logic for tags (must have all)
- Combine filters for precision
- Save complex searches for reuse
- Use amount ranges for large transactions

---

## Import & Export

Import/export CSV at `/import-export`.

### Import Transactions

#### CSV Import

1. Navigate to **"Import/Export"** (`/import-export`)
2. Click **"Import"** tab
3. Select **"CSV"** format
4. Choose your CSV file
5. Map columns:
   - Date
   - Description
   - Amount
   - Type (income/expense)
   - Category (optional)
6. Click **"Preview"**
7. Review and click **"Import"**

**CSV Format Example**:

```csv
Date,Description,Amount,Type,Category
2025-01-15,Grocery Store,45.67,expense,Food & Dining
2025-01-16,Salary,3000.00,income,Salary
```

### Import/Export Screenshot

![Import Export Placeholder](./images/import-export.png)

### Export Data

#### Export to CSV

1. Navigate to **"Import/Export"**
2. Click **"Export"** tab
3. Choose date range
4. Select accounts (or all)
5. Click **"Export CSV"**
6. File downloads to your computer

#### Backup All Data

Export complete database:

1. Select **"Full Backup"** option
2. Choose JSON format
3. Includes all transactions, accounts, budgets
4. Store safely for disaster recovery

---

## Currency Converter

Convert amounts between currencies.

### Using the Converter

1. Find the Currency Converter widget on Dashboard
2. Enter amount in **"From"** field
3. Select source currency
4. Select target currency
5. Click **"Convert"**
6. Result shows with current exchange rate

### Features

- Real-time exchange rates
- Rates updated every 6 hours
- Supports 30+ currencies
- Swap currencies with one click

### Supported Currencies

USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, and more.

---

## Notifications

Notifications are shown in-app and configurable in **Settings → Notifications** (`/settings?tab=notifications`).

### Notification Types

- **Budget Alerts**: Approaching or exceeded budgets
- **Recurring Reminders**: Upcoming recurring transactions

### Configuring Notifications

1. Open **Settings → Notifications** (`/settings?tab=notifications`)
2. Toggle alert types and set thresholds
3. Save preferences

### Notifications Screenshot

![Notifications Settings Placeholder](./images/notifications.png)

### Managing Notifications

- **Mark as Read**: Click checkmark icon
- **Delete**: Click trash icon
- **Mark All as Read**: Quick action
- **Auto-cleanup**: Notifications older than 30 days deleted automatically

---

## Settings & Profile

Manage account settings and profile at `/settings`.

- General app preferences
- Notification thresholds and preferences (`/settings?tab=notifications`)
- Profile details

### Settings Screenshot

![Settings Page Placeholder](./images/settings.png)

---

## FAQ

### General

**Q: Is my financial data secure?**  
A: Use HTTPS in production and strong credentials. See Deployment Guide.

**Q: Can I use this with multiple bank accounts?**  
A: Yes! Add unlimited accounts from different institutions.

**Q: Does it support multiple currencies?**  
A: Transactions support a currency field; reporting is normalized to your selected currency.

**Q: Can multiple people use one account?**  
A: The app is designed for single-user sessions.

### Accounts

**Q: What happens to transactions when I archive an account?**  
A: Historical transactions are preserved. The account just won't show in active lists.

**Q: Can I restore an archived account?**  
A: Yes, click "Show Archived" and then "Restore".

**Q: How do I track credit card debt?**  
A: Create a Credit Card type account with negative initial balance.

### Transactions

**Q: Can I edit past transactions?**  
A: Yes, click on any transaction to edit. Changes update account balances automatically.

**Q: What if I delete a transaction by mistake?**  
A: Deleted transactions cannot be recovered. Consider using exports as backups.

**Q: How do transfers work?**  
A: Transfers create two linked transactions - money out of one account and into another.

### Budgets

**Q: Can I have multiple budgets for the same category?**  
A: No, one budget per category. Adjust amounts or split into subcategories.

**Q: Do budgets rollover unused amounts?**  
A: No, budgets reset each period. Track manually if needed.

**Q: Can I set a budget for all expenses?**  
A: Yes, create a budget without specifying a category.

### Recurring Transactions

**Q: What if I miss a recurring transaction?**  
A: With auto-post disabled, they'll queue up. With auto-post enabled, they're created automatically.

**Q: Can I pause recurring transactions?**  
A: Yes, toggle the "Active" status without deleting.

**Q: How far in advance can I see recurring transactions?**  
A: View upcoming occurrences up to 12 months ahead.

### Import/Export

**Q: What CSV format do you support?**  
A: Flexible format with column mapping during import.

**Q: Can I import from QuickBooks?**  
A: Export QuickBooks data to CSV, then import to Finance Tracker.

**Q: How often should I export data?**  
A: Monthly exports recommended for backup purposes.

### Technical

**Q: What browsers are supported?**  
A: Chrome, Firefox, Safari, Edge (latest versions).

**Q: Is there a mobile app?**  
A: Not yet, but the web interface is mobile-responsive.

**Q: Can I access this offline?**  
A: No, an internet connection is required.

**Q: Where is my data stored?**  
A: In a MySQL database. For self-hosted, on your server.

---

## Getting Help

Need assistance?

- **Documentation**: Check this guide first
- **Deployment Guide**: See `DEPLOYMENT.md` for technical setup
- **GitHub Issues**: Report bugs or request features
- **Email Support**: <contact@example.com>

---

**Last Updated**: March 18, 2026  
**Document Version**: 1.0.0
