# Chapter 8 — Conclusion & Future Work

> **Report Navigation:** [← Chapter 7](./CH07_RESULTS.md) | [Index](./README.md) | [References →](./REFERENCES.md)

---

## 8.1 Conclusion

This project set out to design and implement a full-stack personal finance management web application with first-class support for Nepali Rupee (NPR), robust security, and comprehensive test coverage. The resulting system — **Finance Tracker** — has met or exceeded every one of its twelve original objectives and delivered two additional bonus features.

### 8.1.1 Summary of Achievements

**Technical achievements:**
- A production-ready REST API with **82 endpoints** across 14 controllers, built with Spring Boot 3.2 / Java 21, secured with JWT + CSRF, and containerised via Docker.
- A modern single-page application built with React 19 / TypeScript / Vite, employing TanStack Query, React Hook Form + Zod, and Recharts for interactive financial visualisations.
- A version-controlled relational database with **20 Flyway migrations** creating 16 tables, with NPR as the default currency.
- **168 automated tests** across three layers (103 backend integration, 18 frontend unit, 47 E2E) running in GitHub Actions CI.

**Feature achievements:**
- Multi-account management (6 types), transaction tracking (INCOME/EXPENSE/TRANSFER), hierarchical categories, budget management with alert thresholds, automated recurring transactions via Spring Scheduler, in-app notifications, CSV import/export, advanced search with saved queries, and multi-currency support.

**Process achievements:**
- Comprehensive documentation (9 technical documents + this 11-part academic report).
- Five Docker Compose deployment profiles (standard, dev, demo, CI, production).
- All security NFRs verified: HttpOnly JWT cookies, CSRF double-submit, BCrypt hashing, account lockout, token revocation, per-user data isolation.

### 8.1.2 Research Questions Answered

| Research Question | Answer |
|------------------|--------|
| Can a feature-complete PFM system be built with open-source tools? | ✅ Yes — React 19 + Spring Boot 3.2 + MySQL 8 + Docker |
| Can NPR be a native first-class currency in a web PFM? | ✅ Yes — V19/V20 migrations set NPR as default |
| Can enterprise-grade security be applied at student project scale? | ✅ Yes — JWT, CSRF, BCrypt, lockout, token revocation |
| Can 168 automated tests be maintainable in a student project? | ✅ Yes — with clear base class patterns and CI |

---

## 8.2 Project Evaluation Against Objectives

| Objective | Status | Evidence |
|-----------|--------|----------|
| FR-01 Authentication | ✅ Exceeded | CSRF, lockout, revocable tokens |
| FR-02 Account Management | ✅ Achieved | 6 types, soft delete, balance tracking |
| FR-03 Transaction Management | ✅ Achieved | Atomic transfers, pagination, CSV |
| FR-04 Category Management | ✅ Achieved | 2-level hierarchy, system defaults |
| FR-05 Budget Management | ✅ Achieved | Alert threshold, notifications |
| FR-06 Recurring Transactions | ✅ Achieved | Spring Scheduler, daily processing |
| FR-07 Notifications | ✅ Exceeded | Budget + recurring + system types |
| FR-08 Financial Reports | ✅ Achieved | Interactive Recharts, date filters |
| FR-09 Currency Support | ✅ Exceeded | NPR default, multi-currency table |
| FR-10 Advanced Search | ⭐ Bonus | Saved search queries |
| NFR Security (7 items) | ✅ All verified | Integration tests + manual |
| NFR Performance | ✅ Observed | <2s on all core pages |
| NFR Portability | ✅ Achieved | `docker compose up` in ~60s |

---

## 8.3 Contribution to the Field

Finance Tracker makes the following contributions:

1. **Open-source NPR-native PFM:** The first open-source, self-hostable, Docker-deployable personal finance application with NPR as the system default currency — filling a genuine gap in the Nepali fintech ecosystem.
2. **Architecture blueprint:** The three-tier Spring Boot + React architecture, with JWT/CSRF security, Flyway migrations, and Playwright E2E tests, serves as a replicable reference design for future student projects.
3. **Localisation approach:** The V19/V20 migration pattern for setting regional currency defaults provides a reproducible method for other open-source projects targeting emerging markets.

---

## 8.4 Future Work

The following enhancements are planned for future development cycles:

### 8.4.1 Short-Term (Next 6 Months)

| Enhancement | Description | Priority |
|------------|-------------|----------|
| **2FA / TOTP** | Two-factor authentication using authenticator apps | High |
| **Live exchange rates** | Connect to an exchange rate API (e.g., Open Exchange Rates, free tier) | High |
| **Nepali language UI** | i18n support; Devanagari script localisation | Medium |
| **Dark mode** | System-aware dark/light mode toggle | Medium |
| **Password reset via email** | Forgot-password email flow (Spring Mail + SMTP) | High |

### 8.4.2 Medium-Term (6–18 Months)

| Enhancement | Description | Priority |
|------------|-------------|----------|
| **React Native mobile app** | iOS + Android app using the existing REST API | High |
| **Bank API integration** | ConnectIPS or Khalti API for automatic transaction import | High |
| **Multi-user / households** | Family accounts with shared budgets and spending visibility | Medium |
| **Financial goal tracking** | Savings goals with milestone notifications | Medium |
| **Receipt scanning (OCR)** | Photo → transaction auto-fill using Tesseract.js | Low |

### 8.4.3 Long-Term (18+ Months)

| Enhancement | Description |
|------------|-------------|
| **Investment tracking** | Stock portfolio, mutual fund NAV, crypto holdings |
| **Tax reporting** | Annual income/expense summary in formats compatible with Nepal tax forms |
| **SaaS offering** | Cloud-hosted version with per-user subscription (while keeping self-hosted free) |
| **Open banking standard** | NRB-compliant open banking API integration when regulation matures |
| **Machine learning** | Automatic transaction categorisation using ML |

---

## 8.5 Reflections

This project was a significant personal milestone, encompassing the full software development lifecycle from requirements analysis through deployment and documentation. Key reflections:

- **Scope management:** The addition of 8 migrations and 4 controllers beyond the original plan reflects natural growth during implementation. Better initial scope definition would have reduced scope creep, though the additions genuinely improved the system.
- **Testing investment:** Writing 168 tests added significant development time but paid off through confident refactoring and early bug detection. The investment was worthwhile.
- **Documentation:** Comprehensive documentation (9 technical docs + this report) is time-consuming but essential for project longevity and academic evaluation.
- **Nepal context:** The NPR-first design decision grounded the project in a real-world use case beyond a generic tutorial application.

---

## 8.6 Final Statement

Finance Tracker demonstrates that a secure, feature-complete, open-source personal finance management system can be built by a single developer using modern open-source technologies within an academic timeframe. The project is ready for real-world use by individuals in Nepal and similar emerging markets, and provides a solid foundation for community-driven future enhancement.

The system is available at: [https://github.com/kattelsameer/finance-tracker](https://github.com/kattelsameer/finance-tracker)

---

> **[← Chapter 7](./CH07_RESULTS.md) | [Index](./README.md) | [References →](./REFERENCES.md)**
