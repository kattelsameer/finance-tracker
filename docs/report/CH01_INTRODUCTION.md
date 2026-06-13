# Chapter 1 — Introduction

> **Report Navigation:** [← Title Page](./TITLE_ABSTRACT.md) | [Index](./README.md) | [Chapter 2 →](./CH02_LITERATURE_REVIEW.md)

---

## 1.1 Background

Sound personal finance management — tracking income, expenses, savings, and debts — is a prerequisite for informed financial decision-making. Yet many individuals, particularly in developing economies, have no structured tool for doing so.

In Nepal, the situation presents unique challenges:

- **Rapid digital growth:** Nepal's internet penetration surpassed 75% in 2024 [SOURCE NEEDED] and smartphone usage continues to climb, bringing new users online who need accessible financial tools.
- **Expanding digital banking:** Connectips, eSewa, Khalti, and bank mobile applications have dramatically increased digital transaction volumes, yet a unified view of personal finances across these services is absent.
- **Limited local tools:** Most widely-used finance apps (Mint, YNAB, Money Manager) are designed for USD/EUR contexts, lack NPR support, require subscriptions, or are unavailable on local app stores.
- **Financial literacy gap:** Many young Nepali professionals have no structured way to track spending categories, set savings goals, or understand where their money goes each month.

These factors together create a strong case for a locally-aware, open-source personal finance management system built with modern web technologies and available to any user with a web browser.

---

## 1.2 Problem Statement

The core problem addressed by this project can be stated as:

> *There is no freely available, locally-relevant, full-featured web-based personal finance management system that supports Nepali Rupee (NPR) natively, provides multi-account tracking, budget alerts, recurring transactions, and financial reporting in a single secure application.*

Existing solutions either:

1. Require a paid subscription for core functionality (YNAB, Quicken);
2. Are discontinued or data-privacy–compromised (Mint, shut down in January 2024);
3. Do not support NPR or local account structures;
4. Are mobile-only with no desktop web interface;
5. Lock financial data in proprietary cloud storage with no export capability.

---

## 1.3 Objectives

The primary objectives of this project are:

1. **Design and develop** a full-stack web application for personal finance management.
2. **Implement core financial features:** multi-account management, income/expense/transfer tracking, hierarchical categories, budget management, and recurring transactions.
3. **Ensure security:** Token-based authentication, anti-forgery protection, and strict per-user data isolation.
4. **Support NPR natively** while providing multi-currency capability.
5. **Automate routine tasks:** scheduled recurring transactions, budget threshold alerts, and in-app notifications.
6. **Provide actionable insights:** financial reports with interactive charts.
7. **Enable data portability:** CSV import/export.
8. **Deploy with minimal effort** to make the application accessible on any server or local machine using a single command.
9. **Achieve comprehensive test coverage:** unit, integration, and end-to-end tests.

### 1.3.1 Specific Objectives

| # | Objective | Measurement of Success |
|---|-----------|----------------------|
| 1 | User authentication and authorisation | Secure login and logout, automatic account lockout after repeated failures |
| 2 | Account management | Support at least six account types with full create, read, update, and delete operations |
| 3 | Transaction management | Support income, expense, and transfer types with pagination and multi-criteria filtering |
| 4 | Budget tracking | Period-based budgets with a configurable alert threshold percentage |
| 5 | Recurring transactions | Automatically create transactions from templates on a daily schedule |
| 6 | Category hierarchy | System defaults plus user-defined subcategories |
| 7 | Reports and charts | Interactive charts with date range filtering |
| 8 | CSV import and export | Accept multiple date formats and column name conventions from other finance tools |
| 9 | NPR support | Nepali Rupee as the default system currency |
| 10 | Notifications | Budget alerts and system notifications |
| 11 | Containerisation | Complete application stack deployable with a single command |
| 12 | Test coverage | At least 150 automated tests across all layers |

---

## 1.4 Scope

### 1.4.1 In Scope

- **Backend REST API** built with a modern Java web framework
- **Frontend single-page application** built with a component-based JavaScript framework
- **Relational database** managed through incremental, versioned migration scripts
- **Container-based deployment** enabling consistent setup across different environments
- **Automated testing:** server-side integration tests, frontend unit tests, and browser-based end-to-end tests
- **Documentation:** API reference, architecture guide, development guide, deployment guide, user guide, and this academic report

### 1.4.2 Out of Scope

- **Native mobile applications** (iOS / Android) — future work
- **Bank API integration** (direct feed from Nepali banks) — future work
- **Real-time exchange rate fetching** (stored rates only, not live API) — future work
- **Multi-user household / family sharing** — future work
- **Payment processing / bill payment** — out of scope
- **Investment portfolio tracking (market prices)** — future work

---

## 1.5 Significance of the Study

This project is significant for several reasons:

1. **Open-source contribution:** Finance Tracker is freely available under an open license, making it accessible to any individual or organisation in Nepal or elsewhere.
2. **Local relevance:** First-class NPR support positions the tool for immediate adoption in the Nepali market without configuration overhead.
3. **Modern architecture blueprint:** The layered backend-and-frontend architecture, with industry-standard security, container deployment, and comprehensive automated testing, provides a replicable reference pattern for future student projects.
4. **Financial literacy enablement:** By making spending patterns visible through charts and budget alerts, the system helps users develop better financial habits.
5. **Academic contribution:** The project demonstrates how enterprise-grade practices (CSRF protection, database migrations, E2E testing, containerisation) can be applied at the student project level.

---

## 1.6 Report Organisation

The remainder of this report is structured as follows:

| Chapter | Content |
|---------|---------|
| **Chapter 2** | Literature Review — examination of related work, existing systems, Nepal fintech ecosystem |
| **Chapter 3** | System Analysis & Requirements — detailed functional and non-functional requirements, use cases |
| **Chapter 4** | System Design & Architecture — system diagrams, database ER, technology choices |
| **Chapter 5** | Implementation — backend, frontend, database, security, and deployment details |
| **Chapter 6** | Testing & Quality Assurance — testing strategy, test cases, coverage results |
| **Chapter 7** | Results & Discussion — feature delivery, screenshots, performance, and comparison with objectives |
| **Chapter 8** | Conclusion & Future Work — summary of achievements and roadmap |
| **References** | APA-formatted citations |
| **Appendices** | API endpoint table, migration list, configuration reference |

---

> **[← Title Page](./TITLE_ABSTRACT.md) | [Index](./README.md) | [Chapter 2 →](./CH02_LITERATURE_REVIEW.md)**
