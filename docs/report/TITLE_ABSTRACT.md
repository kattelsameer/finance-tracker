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

**Background:** The growth of digital banking and mobile internet access in Nepal has created an unmet need for personal finance management tools that are free, locally relevant, and suitable for self-hosting. Existing applications are predominantly foreign-developed, subscription-based, and designed around currencies and financial conventions that do not reflect the Nepali context.

**Objective:** This project designs, implements, and evaluates Finance Tracker — an open-source, full-stack personal finance management web application with native support for Nepali Rupee (NPR). The system enables individuals to track income and expenditure across multiple accounts, manage budgets, automate recurring transactions, receive in-application notifications, and analyse spending patterns through interactive financial reports.

**Methodology:** Development followed an iterative, feature-driven approach in which each functional area progressed through database design, server-side implementation, user interface development, and automated testing before work on the next feature began. The backend exposes a structured REST API secured by industry-standard token-based authentication with anti-forgery protection. The frontend is a component-based single-page application incorporating schema-validated forms and server-state caching for a responsive user experience. Schema changes are managed through twenty incremental, versioned migration scripts, ensuring the database structure is reproducible across all deployment environments. The entire system is packaged for portable container deployment.

**Results:** All twelve originally planned objectives were delivered, with two additional features — advanced search with saved queries and a multi-currency framework — implemented beyond the original scope. The system encompasses seventy-three API endpoints, fifteen database tables, and thirty-five reusable interface components. A suite of 168 automated tests — comprising backend integration tests, frontend unit tests, and browser-based end-to-end tests — executes automatically on every code change. All seven security requirements were verified, and observed response times fell within the two-second threshold defined in the non-functional requirements.

**Conclusion:** Finance Tracker demonstrates that a secure, feature-complete personal finance management system can be built at student project scale using open-source technologies. The system is well-positioned for community adoption in Nepal and comparable emerging markets, and provides a clear architectural reference for future projects in the domain. Identified avenues for future development include a native mobile application, live exchange rate integration, and direct bank data feed connectivity.

**Keywords:** Personal Finance Management, Web Application, Nepal, Nepali Rupee, REST API, Token-Based Authentication, Relational Database, Container Deployment, Budget Tracking, Financial Reporting

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
| 4.2 | Application Container Stack | Ch. 4 |
| 4.3 | Backend Layered Architecture | Ch. 4 |
| 4.4 | Frontend Application Layers | Ch. 4 |
| 4.5 | Entity Relationship Diagram | Ch. 4 |
| 5.1 | Database Migration Timeline (V1–V20) | Ch. 5 |
| 6.1 | Test Distribution by Type | Ch. 6 |
| 7.1 | Login Page | Ch. 7 |
| 7.2 | Dashboard Overview | Ch. 7 |
| 7.3 | Transactions Page | Ch. 7 |
| 7.4 | Budget Tracking View | Ch. 7 |
| 7.5 | Financial Reports Page | Ch. 7 |

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
| 5.1 | Database Migration Scripts V1–V20 | Ch. 5 |
| 5.2 | API Functional Areas and Endpoint Count | Ch. 5 |
| 6.1 | Test Coverage Summary | Ch. 6 |
| 7.1 | Planned vs. Actual Delivery | Ch. 7 |

---

*Word Count Estimate: ~[TBD] words across all chapters.*
