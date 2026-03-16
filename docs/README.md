# Finance Tracker - Documentation

> **Version**: 1.0.0  
> **Last Updated**: December 3, 2025  
> **Status**: Production Ready

Welcome to the comprehensive documentation for the Finance Tracker application. This directory contains all technical and user documentation organized by category.

---

## Quick Navigation

| Document | Description | Audience |
|----------|-------------|----------|
| **[User Guide](USER_GUIDE.md)** | End-user documentation for all features | End Users |
| **[Development Guide](development/DEVELOPMENT_GUIDE.md)** | Local setup and development workflow | Developers |
| **[Testing Guide](testing/TESTING_GUIDE.md)** | Test infrastructure and writing tests | Developers, QA |
| **[Deployment Guide](deployment/DEPLOYMENT.md)** | Docker deployment and production setup | DevOps |
| **[API Reference](api/API_REFERENCE.md)** | Complete REST API documentation | API Consumers |
| **[Architecture](architecture/ARCHITECTURE.md)** | System architecture and design patterns | Architects, Developers |
| **[Database Schema](architecture/DATABASE.md)** | Complete database schema reference | Database Admins, Developers |
| **[Frontend Guide](development/FRONTEND_GUIDE.md)** | React development patterns | Frontend Developers |
| **[Backend Guide](development/BACKEND_GUIDE.md)** | Spring Boot development patterns | Backend Developers |
| **[Deviation Report](PROJECT_DEVIATION_REPORT.md)** | Original plan vs actual implementation | Project Managers, Stakeholders |

---

## Documentation Structure

```
docs/
├── README.md (this file)                  # Documentation index
├── USER_GUIDE.md                          # End-user documentation
├── PROJECT_DEVIATION_REPORT.md            # Plan vs implementation comparison
│
├── architecture/                          # System architecture
│   ├── ARCHITECTURE.md                    # High-level architecture
│   └── DATABASE.md                        # Database schema (17 migrations)
│
├── api/                                   # API documentation
│   └── API_REFERENCE.md                   # All 73+ REST endpoints
│
├── development/                           # Development guides
│   ├── DEVELOPMENT_GUIDE.md               # Local setup and workflow
│   ├── FRONTEND_GUIDE.md                  # React development (13 pages, 35+ components)
│   └── BACKEND_GUIDE.md                   # Spring Boot development (13 controllers)
│
├── testing/                               # Testing documentation
│   └── TESTING_GUIDE.md                   # 168 tests (103 backend + 18 frontend + 47 E2E)
│
└── deployment/                            # Deployment guides
    └── DEPLOYMENT.md                      # Docker Compose deployment
```

---

## Getting Started

### For End Users

Start with the **[User Guide](USER_GUIDE.md)** to learn how to use all features:

- Dashboard and financial overview
- Managing transactions, accounts, and categories
- Setting up budgets and recurring transactions
- Generating reports
- Importing/exporting data

### For Developers (First Time Setup)

1. **Read**: [Development Guide](development/DEVELOPMENT_GUIDE.md) - Prerequisites and local setup
2. **Review**: [Architecture](architecture/ARCHITECTURE.md) - Understand system design
3. **Explore**: [Database Schema](architecture/DATABASE.md) - Database structure
4. **Reference**: [API Documentation](api/API_REFERENCE.md) - Available endpoints

### For Frontend Developers

1. **Setup**: [Development Guide](development/DEVELOPMENT_GUIDE.md#frontend-setup)
2. **Learn**: [Frontend Guide](development/FRONTEND_GUIDE.md) - React architecture and patterns
3. **Test**: [Testing Guide](testing/TESTING_GUIDE.md#frontend-testing) - Unit and E2E tests

### For Backend Developers

1. **Setup**: [Development Guide](development/DEVELOPMENT_GUIDE.md#backend-setup)
2. **Learn**: [Backend Guide](development/BACKEND_GUIDE.md) - Spring Boot architecture
3. **Test**: [Testing Guide](testing/TESTING_GUIDE.md#backend-testing) - Integration tests

### For DevOps/SRE

1. **Deploy**: [Deployment Guide](deployment/DEPLOYMENT.md) - Docker Compose setup
2. **Monitor**: [Deployment Guide - Monitoring](deployment/DEPLOYMENT.md#monitoring--logging)
3. **Backup**: [Deployment Guide - Backup](deployment/DEPLOYMENT.md#backup--recovery)

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | 19.2.0 |
| | TypeScript | 5.9.3 |
| | Vite | 7.2.4 |
| | TailwindCSS | 4.1.17 |
| **Backend** | Spring Boot | 3.2.5 |
| | Java | 21 LTS |
| | MySQL | 8.0 |
| | Flyway | 10.x |
| **Testing** | JUnit 5 | 5.x |
| | Vitest | 4.0.16 |
| | Playwright | 1.57.0 |
| **Deployment** | Docker | 24.x+ |
| | Docker Compose | 2.x+ |
| | Nginx | 1.25+ |

For complete technology details, see [Architecture Documentation](architecture/ARCHITECTURE.md#technology-stack).

---

## Key Features

✅ **Authentication & Security**

- JWT authentication with HttpOnly cookies
- CSRF protection
- Password complexity requirements
- Account lockout after failed attempts

✅ **Financial Management**

- Multi-account support (checking, savings, credit cards, cash)
- Transaction tracking (income, expense, transfers)
- Hierarchical categories with system defaults
- Budget tracking with alerts
- Recurring transactions (daily, weekly, monthly, etc.)

✅ **Analytics & Reports**

- Dashboard with summary cards and trends
- Category-based spending reports
- Date range filtering
- CSV export

✅ **Advanced Features**

- Multi-currency support with exchange rates
- Tag-based organization
- Advanced search with saved filters
- In-app notifications
- CSV import/export

For complete feature documentation, see [User Guide](USER_GUIDE.md).

---

## Project Statistics

| Metric | Count |
|--------|-------|
| **Backend Controllers** | 14 |
| **REST API Endpoints** | 73+ |
| **Database Tables** | 15 |
| **Flyway Migrations** | 20 |
| **Frontend Pages** | 13 |
| **React Components** | 35+ |
| **Service Files** | 15 |
| **Custom Hooks** | 7 |
| **Backend Tests** | 103 |
| **Frontend Unit Tests** | 18 |
| **E2E Tests** | 47 |
| **Total Test Coverage** | 168 tests |

For deviation analysis, see [Project Deviation Report](PROJECT_DEVIATION_REPORT.md).

---

## Quick Reference

### Common Commands

```bash
# Development
cd frontend && npm run dev              # Start frontend dev server
cd backend && ./gradlew bootRun         # Start backend API

# Testing
./gradlew test                          # Run backend tests
npm test                                # Run frontend unit tests
npm run test:e2e                        # Run E2E tests

# Docker
docker compose up -d                    # Start all services
docker compose logs -f backend          # View backend logs
docker compose down                     # Stop all services

# Database
docker exec -it finance-tracker-mysql mysql -u financeuser -p finance_tracker
```

For complete command reference, see [Development Guide - Common Commands](development/DEVELOPMENT_GUIDE.md#common-commands-reference).

---

### Environment Configuration

| Profile | Use Case | Database | Frontend | Backend |
|---------|----------|----------|----------|---------|
| `dev` | Local development | localhost:3306 | localhost:5173 | localhost:8080 |
| `docker` | Docker Compose | mysql:3306 | nginx proxy | nginx proxy |
| `prod` | Production | mysql:3306 (internal) | nginx proxy | nginx proxy |
| `test` | Integration tests | H2 in-memory | - | - |

For detailed configuration, see [Development Guide - Environment Profiles](development/DEVELOPMENT_GUIDE.md#environment-profiles).

---

## Documentation Versions

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-03 | Initial comprehensive documentation release |

---

## Contributing to Documentation

When updating documentation:

1. **Update the relevant file** in the appropriate category
2. **Update this README.md** if structure changes
3. **Update version number** in document headers
4. **Update "Last Updated" date** in document headers
5. **Cross-reference** related documents

---

## Additional Resources

### External Documentation

- **Spring Boot**: <https://docs.spring.io/spring-boot/docs/current/reference/html/>
- **React**: <https://react.dev/>
- **TailwindCSS**: <https://tailwindcss.com/docs>
- **MySQL**: <https://dev.mysql.com/doc/>
- **Docker**: <https://docs.docker.com/>

### Related Files (Root Directory)

- **README.md** - Original Technical Design Document (TDD) - **DO NOT MODIFY**
- **QA_REPORT.md** - Quality assurance report
- **FRONTEND_RESTRUCTURING_SUMMARY.md** - Frontend refactoring summary
- **PHASE_7_PROGRESS.md** - Testing and deployment phase summary

---

## Support

### For Users

- **User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
- **FAQ**: See [User Guide - FAQ](USER_GUIDE.md#faq)

### For Developers

- **Development Setup**: [DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md)
- **Troubleshooting**: [DEVELOPMENT_GUIDE.md - Troubleshooting](development/DEVELOPMENT_GUIDE.md#troubleshooting)
- **API Issues**: [API_REFERENCE.md](api/API_REFERENCE.md)

### For DevOps

- **Deployment Issues**: [DEPLOYMENT.md - Troubleshooting](deployment/DEPLOYMENT.md#troubleshooting)
- **Database Issues**: [DEPLOYMENT.md - Database Management](deployment/DEPLOYMENT.md#database-management)

---

## License

This documentation is part of the Finance Tracker project.  
See root directory for license information.

---

**Last Updated**: December 3, 2025  
**Documentation Version**: 1.0.0  
**Project Status**: ✅ Production Ready
