# Chapter 2 — Literature Review & Background

> **Report Navigation:** [← Chapter 1](./CH01_INTRODUCTION.md) | [Index](./README.md) | [Chapter 3 →](./CH03_REQUIREMENTS.md)

---

## 2.1 Overview

This chapter situates Finance Tracker within its theoretical, competitive, and technological context. It covers foundational personal finance theory, a comparative analysis of existing tools, the Nepal fintech ecosystem, and the software engineering concepts that informed the project's technical choices.

---

## 2.2 Personal Finance Management — Theoretical Foundation

### 2.2.1 Budgeting Theory

Personal finance management (PFM) is the process of planning, saving, investing, spending, or otherwise overseeing an individual's or a family's financial activities. Key academic frameworks include:

- **Envelope Budgeting** (Ramsey, 2003): Allocating fixed amounts of cash to spending categories in separate "envelopes." Finance Tracker implements a digital version through its budget-per-category system.
- **Zero-Based Budgeting** (Pyhrr, 1970): Every dollar of income is assigned a purpose so that income minus expenditure equals zero. Supported by Finance Tracker through budget allocation features.
- **50/30/20 Rule** (Warren & Tyagi, 2006): 50% of income to needs, 30% to wants, and 20% to savings/debt. The reporting module enables users to visualise this split across categories.

### 2.2.2 Behavioural Finance Insights

Research in behavioural economics identifies several tendencies with direct relevance to PFM tool design. Thaler & Sunstein (2008) demonstrate that individuals make systematically suboptimal financial decisions when feedback is delayed or opaque; real-time visibility of spending patterns counteracts this. Kahneman (2011) shows that intuitive (System 1) thinking leads to consistent underestimation of discretionary expenditure [SOURCE NEEDED — specific figure], while deliberate tracking shifts users toward reflective (System 2) decision-making. Automated savings mechanisms, which reduce the need for active decision-making, are shown to increase savings rates (Thaler & Sunstein, 2008).

Finance Tracker addresses each of these: spending is made visible through dashboards and category charts; balance updates are immediate upon each transaction entry; and recurring transactions automate the savings and expense commitments that benefit from reduced decision friction.

### 2.2.3 Financial Technology (Fintech) Definition

The Financial Stability Board (2017) defines FinTech as "technology-enabled innovation in financial services that could result in new business models, applications, processes, or products with an associated material effect on financial markets and institutions and the provision of financial services." Personal finance management applications sit within the consumer-fintech sub-category.

---

## 2.3 Existing Personal Finance Management Systems

### 2.3.1 Comparative Analysis

**Table 2.1 — Comparison of Major PFM Applications**

| Feature | Mint (Discontinued) | YNAB | Money Manager | Wallet | **Finance Tracker** |
|---------|---------------------|------|---------------|--------|---------------------|
| **Cost** | Free (ads) | $14.99/month | Free / Paid | Freemium | **Free (Open Source)** |
| **Platform** | Web + Mobile | Web + Mobile | Mobile | Web + Mobile | **Web** |
| **NPR Support** | ❌ | ❌ | ✅ (manual) | ✅ (manual) | **✅ (native default)** |
| **Data Hosting** | US cloud | US cloud | On-device | EU cloud | **Self-hosted / Own** |
| **Bank Feed** | ✅ (US only) | ✅ (US/CA/UK) | Manual | Manual | **Manual (future)** |
| **Budgets** | ✅ | ✅ | ✅ | ✅ | **✅** |
| **Recurring Trans.** | ✅ | ✅ | ✅ | ✅ | **✅ (automated)** |
| **Reports** | Basic | Advanced | Basic | Advanced | **Interactive charts** |
| **CSV Import** | ✅ | ✅ | ❌ | ✅ | **✅** |
| **Open Source** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Self-Hostable** | ❌ | ❌ | ❌ | ❌ | **✅ (Docker)** |
| **API Access** | Limited | ✅ | ❌ | Limited | **✅ (Full REST API)** |

### 2.3.2 Key Observations

1. **Mint's shutdown (January 2024)** left a significant gap in the free PFM market, affecting millions of users globally. This validates the demand for an open-source alternative.
2. **YNAB's pricing** ($14.99/month, billed monthly) is prohibitive for students and users in developing economies.
3. **Mobile-only apps** (Money Manager, Spendee) do not cater to desktop power users or developers who prefer web interfaces.
4. **None of the major tools are self-hostable**, creating data-sovereignty concerns especially relevant in Nepal where local data residency is preferred.
5. **NPR support** is an afterthought in all international tools; Finance Tracker makes NPR the system default.

### 2.3.3 Open-Source Alternatives

| Tool | Technology | Status | Limitation |
|------|-----------|--------|------------|
| **Firefly III** | PHP / Laravel | Active | Complex setup; no mobile app |
| **Actual Budget** | Node.js / React | Active | Local-first; limited multi-device sync |
| **GnuCash** | GTK / C | Active | Desktop only; steep learning curve |
| **HomeBank** | GTK / C | Active | Desktop only; no web interface |

Finance Tracker occupies a unique niche: a modern web-first, Docker-deployable, REST API-backed finance manager with NPR support and a comprehensive test suite.

---

## 2.4 Nepal Fintech Ecosystem

### 2.4.1 Digital Payments Landscape

Nepal's digital payments sector has expanded significantly over the past decade:

- **eSewa** (launched 2009) and **Khalti** (launched 2017) are the dominant mobile wallets [SOURCE NEEDED — registered user counts].
- **ConnectIPS** (Nepal Clearing House Ltd., 2024) enables real-time interbank transfers.
- **Nepal Rastra Bank (NRB)** issued a Payment System Directive in 2019 and has progressively updated regulations to accommodate digital finance.
- QR-code payments (NEPALPAY QR) are accepted by merchants nationwide [SOURCE NEEDED — merchant count].

### 2.4.2 Challenges in Nepali Financial Context

1. **Multi-account fragmentation:** A typical Nepali professional may have accounts at 2–3 banks, an eSewa/Khalti wallet, and cash — Finance Tracker aggregates all of these.
2. **Salary in NPR, remittances in USD/AED:** Multi-currency support is essential given Nepal's large remittance economy (remittances constituted approximately 27% of GDP in 2023 [SOURCE NEEDED — World Bank or NRB citation]).
3. **Limited credit card penetration:** Cash and debit transactions dominate. Finance Tracker supports all transaction types without forcing credit-card-centric workflows.
4. **Low financial literacy:** Visual dashboards and budget alerts educate users about their financial habits incrementally.

### 2.4.3 Regulatory Context

Nepal Rastra Bank (NRB) regulations relevant to a PFM tool:

- No payment processing license required for a budgeting/tracking application (it does not move money).
- Data privacy is governed by the **Electronic Transaction Act 2008** and the draft **Privacy Act 2023**.
- A self-hosted deployment means user data stays on the user's own server or local machine, which aligns with data sovereignty principles.

### 2.4.4 Market Opportunity

Given approximately 11 million smartphone users in Nepal (NTA, 2024 [SOURCE NEEDED — full report citation]) and an estimated urban internet penetration rate among working-age adults [SOURCE NEEDED], even a 1% adoption rate would represent over 100,000 potential users.

---

## 2.5 Relevant Software Engineering Concepts

### 2.5.1 RESTful API Design

REST (Representational State Transfer), introduced by Fielding (2000), provides a stateless, resource-oriented architectural style for distributed systems. Finance Tracker follows REST principles:

- Resources identified by URI (e.g., `/api/v1/transactions/{id}`)
- HTTP verbs (GET, POST, PUT, DELETE) map to CRUD operations
- JSON as the uniform data interchange format
- Stateless server (state kept in client-side JWT cookies)

### 2.5.2 Token-Based Authentication

Rather than maintaining server-side session records for every logged-in user, modern web applications often use self-contained authentication tokens. Upon a successful login, the server issues a digitally signed string — a compact proof of the user's identity. This token is returned to the browser where it is stored in a way that prevents it from being accessed by page scripts, protecting it from theft. All subsequent requests include this token, allowing the server to verify the user's identity without consulting a central session store — a stateless design that improves scalability (Jones et al., 2015).

Tokens are configured to expire after one hour by default, or after thirty days if the user selects the "Remember Me" option. Logging out invalidates the token on the server side, preventing any further use even if the token were captured.

### 2.5.3 Incremental Database Schema Management

As software evolves, the structure of its underlying database must change alongside it. An increasingly common practice is to manage these changes through small, numbered scripts — each one making a specific, documented alteration. A migration tool runs these scripts in order the first time the application starts in any environment, guaranteeing that an exact, reproducible schema is established wherever the software is deployed. This eliminates the danger of environments drifting out of sync and makes the history of all structural changes fully auditable (Ambler & Sadalage, 2006).

Finance Tracker uses twenty such migration scripts, covering the creation of fifteen database tables and the seeding of reference and localisation data.

### 2.5.4 Containerisation

Containerisation packages an application together with all of its dependencies and configuration into a single portable unit. Each container runs in isolation, ensuring that the application behaves identically regardless of the underlying host environment — a developer's laptop, a university server, or a cloud platform.

The Finance Tracker system is composed of three containers that together form the complete application stack: a database container, a backend application container, and a frontend web server container. They are orchestrated by a single configuration file that defines how they interact, in what order to start, and how their data is preserved between restarts. Starting the entire system requires a single command.

### 2.5.5 Component-Based User Interface Development

Modern frontend development has shifted away from page-centric models toward a component-based approach, where the user interface is assembled from small, reusable, self-contained pieces. Each component manages its own rendering logic and state, making the codebase easier to maintain and test as it grows in complexity (Mikkonen & Taivalsaari, 2008).

Finance Tracker's user interface is built with React — the most widely adopted component framework at the time of development. A dedicated server-state management library handles the complexities of caching fetched data, re-fetching when data becomes stale, and synchronising the display after user actions. A schema-based form validation library ensures that all user inputs are validated both at runtime and captured as typed definitions used throughout the codebase.

### 2.5.6 Layered Automated Testing

The testing pyramid model (Cohn, 2009) provides practical guidance on how to distribute automated tests across three levels:

- **Unit tests** — the most numerous and the fastest to run, verifying individual functions or components in isolation.
- **Integration tests** — fewer in number, verifying that components work correctly together at their boundaries.
- **End-to-end tests** — the smallest group, automating a real browser to confirm that complete user workflows function from start to finish.

This distribution ensures that most defects are caught quickly and cheaply at the unit level, while the slowest tests are reserved for the highest-value scenarios. Finance Tracker implements all three levels, totalling 168 automated tests that run automatically on every code change.

---

## 2.6 Summary

The review of PFM theory, competing tools, Nepal's fintech context, and relevant software engineering concepts yields four conclusions that directly shaped the project's design:

- Budgeting, categorisation, and recurring automation are the core features a PFM tool must support, as established by Ramsey (2003), Pyhrr (1970), and behavioural economics research.
- No free, self-hostable, NPR-native web PFM tool currently exists; Finance Tracker targets this gap explicitly.
- Nepal's expanding digital payments ecosystem and remittance economy create concrete demand for a locally relevant tool.
- The chosen open-source technology stack (Spring Boot, React, MySQL, Docker) provides a production-grade foundation appropriate for this project's scope and future growth.

Chapter 3 translates these findings into formal system requirements.

---

> **[← Chapter 1](./CH01_INTRODUCTION.md) | [Index](./README.md) | [Chapter 3 →](./CH03_REQUIREMENTS.md)**
