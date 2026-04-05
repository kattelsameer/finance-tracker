# Finance Tracker — Personal Finance Management System

---

## Title Page

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         FINANCE TRACKER — PERSONAL FINANCE MANAGEMENT SYSTEM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                  A Project Report Submitted to

            [Name of College / University — Placeholder]

        In Partial Fulfillment of the Requirements for the Degree of

         Bachelor of Science in Computer Science / Information Technology

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        Submitted by:
                    Sameer Kattel  (Roll No. — TBD)

                        Supervised by:
               [Supervisor Name & Designation — Placeholder]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                     [Department Name — Placeholder]
                   [Faculty / School Name — Placeholder]
                        Kathmandu, Nepal
                            April 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Declaration

I hereby declare that the project entitled **"Finance Tracker — Personal Finance Management System"** is my own original work and that it has not been submitted elsewhere for any academic award. All sources have been appropriately acknowledged and references cited.

| | |
|---|---|
| **Name:** | Sameer Kattel |
| **Date:** | April 2026 |
| **Signature:** | ___________________________ |

---

## Certificate of Approval

This is to certify that the project entitled **"Finance Tracker — Personal Finance Management System"** submitted by **Sameer Kattel** has been examined and approved for the award of the degree of Bachelor of Science in Computer Science.

| Role | Name | Signature |
|------|------|-----------|
| Supervisor | [Supervisor Name — Placeholder] | ___________ |
| External Examiner | [Examiner Name — Placeholder] | ___________ |
| Head of Department | [HOD Name — Placeholder] | ___________ |

**Date of Examination:** ___________________________

---

## Acknowledgements

First and foremost, I would like to express my sincere gratitude to my supervisor, **[Supervisor Name — Placeholder]**, for their invaluable guidance, constructive feedback, and encouragement throughout the development of this project.

I am deeply grateful to the faculty members of the **[Department Name — Placeholder]** for their academic support and for fostering a learning environment that encouraged practical, industry-relevant projects.

My heartfelt thanks go to my family and friends for their unwavering moral support and patience during the long development and documentation phases of this work.

I would also like to acknowledge the open-source communities behind **Spring Boot**, **React**, **MySQL**, **Flyway**, **TanStack Query**, **Tailwind CSS**, and all other libraries used in this project. Their collective contributions made this system possible.

Finally, I thank **GitHub** and all AI-assisted coding tools that helped accelerate development and improve code quality.

---

## Abstract

**Background:** Digital personal finance management has become increasingly important in Nepal as smartphone penetration grows and digital banking services expand. However, most available finance applications are either too complex, not localised for Nepali financial contexts, or require paid subscriptions for core features.

**Objective:** This project develops **Finance Tracker**, a full-stack, open-source personal finance management web application that allows users to track income and expenses, manage multiple bank accounts, set budgets, receive automated notifications, and generate financial reports — with first-class support for Nepali Rupee (NPR).

**Methodology:** The system was developed using an iterative agile approach. The backend was built with Spring Boot 3.2 and Java 21, exposing a RESTful API secured by JWT authentication stored in HttpOnly cookies with CSRF protection. The frontend was developed with React 19, TypeScript 5, Vite 7, and Tailwind CSS 4. MySQL 8 was used as the relational database, with schema changes managed through 20 Flyway migrations. The entire system is containerised with Docker Compose.

**Key Features Implemented:**
- Multi-account management (Checking, Savings, Credit Card, Cash, Investment, Loan)
- Income, Expense, and Transfer transaction recording
- Hierarchical category system with system defaults
- Budget tracking with configurable alert thresholds
- Recurring transaction automation via Spring Scheduler
- Advanced search and saved searches
- CSV import/export
- In-app notification system
- Financial reports with interactive Recharts visualisations
- NPR as system-default currency with multi-currency support

**Testing:** 168 automated tests were written, comprising 103 backend integration tests (JUnit 5 / MockMvc), 18 frontend unit tests (Vitest / React Testing Library), and 47 end-to-end tests (Playwright).

**Results:** All originally planned features were delivered and 2 significant enhancements were added beyond scope. The system achieved 97% alignment with the original specification while extending it with multi-currency, notification, and advanced-search capabilities.

**Conclusion:** Finance Tracker demonstrates that a secure, feature-complete personal finance management system can be built with modern open-source technologies. The project is well-positioned for community adoption in Nepal and similar emerging markets, with clear pathways for future enhancement including mobile applications and bank API integration.

**Keywords:** Personal Finance, Web Application, Spring Boot, React, Nepal, NPR, REST API, JWT Authentication, MySQL, Docker, Budget Tracking, Financial Reports

---

## Table of Contents

1. [Introduction](./CH01_INTRODUCTION.md)
2. [Literature Review & Background](./CH02_LITERATURE_REVIEW.md)
3. [System Analysis & Requirements](./CH03_REQUIREMENTS.md)
4. [System Design & Architecture](./CH04_SYSTEM_DESIGN.md)
5. [Implementation](./CH05_IMPLEMENTATION.md)
6. [Testing & Quality Assurance](./CH06_TESTING.md)
7. [Results & Discussion](./CH07_RESULTS.md)
8. [Conclusion & Future Work](./CH08_CONCLUSION.md)
9. [References & Bibliography](./REFERENCES.md)
10. [Appendices](./APPENDICES.md)

---

## List of Figures

| Figure | Caption | Chapter |
|--------|---------|---------|
| 4.1 | System Architecture Overview | Ch. 4 |
| 4.2 | Docker Compose Service Stack | Ch. 4 |
| 4.3 | Entity Relationship Diagram | Ch. 4 |
| 4.4 | Frontend Application Layers | Ch. 4 |
| 4.5 | JWT Authentication Flow | Ch. 4 |
| 5.1 | Flyway Migration Timeline (V1–V20) | Ch. 5 |
| 5.2 | Backend Package Structure | Ch. 5 |
| 5.3 | Frontend Component Hierarchy | Ch. 5 |
| 6.1 | Test Distribution by Type | Ch. 6 |
| 7.1 | Dashboard — Summary Cards | Ch. 7 |
| 7.2 | Transactions Page | Ch. 7 |
| 7.3 | Budget Tracking View | Ch. 7 |
| 7.4 | Reports — Income vs. Expense Chart | Ch. 7 |

---

## List of Tables

| Table | Caption | Chapter |
|-------|---------|---------|
| 2.1 | Comparison of Personal Finance Applications | Ch. 2 |
| 3.1 | Functional Requirements | Ch. 3 |
| 3.2 | Non-Functional Requirements | Ch. 3 |
| 3.3 | Use Case Summary | Ch. 3 |
| 4.1 | Frontend Technology Stack | Ch. 4 |
| 4.2 | Backend Technology Stack | Ch. 4 |
| 4.3 | Database Tables Summary | Ch. 4 |
| 5.1 | Flyway Migrations V1–V20 | Ch. 5 |
| 5.2 | API Controllers and Endpoint Count | Ch. 5 |
| 6.1 | Test Coverage Summary | Ch. 6 |
| 7.1 | Planned vs. Actual Delivery | Ch. 7 |

---

*Word Count Estimate: ~[TBD] words across all chapters.*
