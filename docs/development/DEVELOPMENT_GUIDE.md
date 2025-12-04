# Finance Tracker - Development Setup Guide

> **Comprehensive guide for setting up and running the Finance Tracker application locally**
>
> Version: 1.0.0 | Last Updated: December 4, 2025

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Local Development Setup](#3-local-development-setup)
4. [Environment Profiles](#4-environment-profiles)
5. [Backend Setup](#5-backend-setup)
6. [Frontend Setup](#6-frontend-setup)
7. [Docker Compose Setup](#7-docker-compose-setup)
8. [Database Setup](#8-database-setup)
9. [IDE Configuration](#9-ide-configuration)
10. [Common Commands Reference](#10-common-commands-reference)
11. [Testing](#11-testing)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Software

| Software | Minimum Version | Purpose | Installation |
|----------|----------------|---------|--------------|
| **Java** | 21 LTS | Backend runtime | [Download Oracle JDK 21](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html) or use [SDKMAN](https://sdkman.io/) |
| **Node.js** | 18.x or higher | Frontend build/runtime | [Download Node.js](https://nodejs.org/) |
| **MySQL** | 8.0+ | Database (for local dev) | [Download MySQL](https://dev.mysql.com/downloads/mysql/) |
| **Docker** | 20.x+ | Container runtime | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Docker Compose** | 2.x+ | Multi-container orchestration | Included with Docker Desktop |
| **Git** | 2.x+ | Version control | [Download Git](https://git-scm.com/) |

### 1.2 Recommended Software

| Software | Purpose |
|----------|---------|
| **IntelliJ IDEA** | Java/Spring Boot IDE |
| **VS Code** | Frontend development |
| **Postman** or **Insomnia** | API testing |
| **MySQL Workbench** | Database management |
| **Gradle** (optional) | Build tool (included via wrapper) |

### 1.3 System Requirements

- **OS**: macOS 10.15+, Windows 10+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 5GB free space
- **Ports Available**: 3000, 3306, 5173, 8080 (or configured alternatives)

---

## 2. Quick Start

### 2.1 Clone the Repository

```bash
# Clone the repository
git clone https://github.com/kattelsameer/finance-tracker.git
cd finance-tracker
```

### 2.2 Choose Your Development Path

#### Option A: Docker Compose (Recommended for Full Stack)

```bash
# Start all services (MySQL, Backend, Frontend)
docker compose up -d

# Wait for services to be healthy (~60 seconds)
docker compose ps

# Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:8080
# MySQL: localhost:3306
```

#### Option B: Local Development

```bash
# 1. Start MySQL (via Docker or local installation)
docker run -d \
  --name finance-mysql \
  -e MYSQL_DATABASE=finance_tracker \
  -e MYSQL_USER=financeuser \
  -e MYSQL_PASSWORD=financepass \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -p 3306:3306 \
  mysql:8.0

# 2. Start Backend (Terminal 1)
source ~/.bash_profile   # Load Java 21
cd backend
./gradlew bootRun

# 3. Start Frontend (Terminal 2)
cd frontend
npm install
npm run dev

# Access: http://localhost:5173
```

---

## 3. Local Development Setup

### 3.1 Initial Setup Steps

#### Step 1: Verify Java 21

```bash
# Check Java version
java -version

# Should output: openjdk version "21.x.x"
# If not, ensure Java 21 is installed and set in ~/.bash_profile or ~/.zshrc
```

#### Step 2: Configure Java Environment

Add to `~/.bash_profile` (or `~/.zshrc` for zsh):

```bash
# Java 21 Configuration
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH
```

Apply changes:

```bash
source ~/.bash_profile  # or source ~/.zshrc
```

#### Step 3: Verify Node.js

```bash
# Check Node version
node -v  # Should be v18.x or higher
npm -v   # Should be 9.x or higher
```

#### Step 4: Set Up MySQL Database

**Option A: Docker MySQL (Recommended)**

```bash
# Create and start MySQL container
docker run -d \
  --name finance-mysql \
  -e MYSQL_DATABASE=finance_tracker \
  -e MYSQL_USER=financeuser \
  -e MYSQL_PASSWORD=financepass \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -p 3306:3306 \
  mysql:8.0 \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# Verify MySQL is running
docker ps | grep finance-mysql
```

**Option B: Local MySQL Installation**

```bash
# Create database
mysql -u root -p

CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'financeuser'@'localhost' IDENTIFIED BY 'financepass';
GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. Environment Profiles

The application supports multiple environment profiles with different configurations:

### 4.1 Profile Overview

| Profile | Database | API URL | Use Case | Activation |
|---------|----------|---------|----------|------------|
| **dev** | `localhost:3306` | `localhost:8080` | Local backend development | Default profile |
| **docker** | `mysql:3306` (container) | nginx proxy | Docker Compose environment | Set in docker-compose.yml |
| **demo** | `mysql:3306` (demo container) | nginx proxy (port 81) | Demo mode with auto-reset data | Set in docker-compose.demo.yml |
| **prod** | Remote MySQL | Production domain | Production deployment | Manual configuration |
| **test** | H2 in-memory | - | Integration tests | Activated by test runner |

### 4.2 Profile Configuration Files

```
backend/src/main/resources/
├── application.yml                 # Base configuration
├── application-dev.yml             # Local development
├── application-docker.yml          # Docker Compose
├── application-demo.yml            # Demo mode
├── application-prod.yml            # Production
└── application-test.yml            # Testing
```

### 4.3 Dev Profile (`application-dev.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/finance_tracker?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: financeuser
    password: financepass
  jpa:
    show-sql: true

logging:
  level:
    com.financetracker: DEBUG
    org.hibernate.SQL: DEBUG
```

### 4.4 Docker Profile (`application-docker.yml`)

```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/finance_tracker?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    show-sql: false

logging:
  level:
    root: INFO
    com.financetracker: INFO
```

### 4.5 Environment Variables

**Backend Environment Variables:**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` | No |
| `DB_USER` | Database username | `financeuser` | No (dev) |
| `DB_PASSWORD` | Database password | `financepass` | No (dev) |
| `JWT_SECRET` | JWT signing key (256-bit min) | Dev default | Yes (prod) |
| `JWT_EXPIRATION` | Token expiration (ms) | `3600000` (1hr) | No |

**Frontend Environment Variables:**

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8080` | No (dev) |

**Docker Environment Variables (.env file):**

Create `.env` file in project root:

```bash
# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=financeuser
MYSQL_PASSWORD=financepass
MYSQL_PORT=3306

# Backend Configuration
SPRING_PROFILES_ACTIVE=docker
JWT_SECRET=your-secure-256-bit-secret-key-change-this-in-production-minimum-32-characters
JWT_EXPIRATION_MS=3600000
LOGGING_LEVEL=INFO

# Frontend Configuration
FRONTEND_PORT=80
BACKEND_PORT=8080

# Timezone
TZ=UTC
```

---

## 5. Backend Setup

### 5.1 Backend Project Structure

```
backend/
├── build.gradle                    # Gradle build configuration
├── gradlew                         # Gradle wrapper (Unix)
├── gradlew.bat                     # Gradle wrapper (Windows)
├── settings.gradle                 # Gradle settings
├── Dockerfile                      # Container image definition
└── src/
    ├── main/
    │   ├── java/com/financetracker/
    │   │   ├── config/             # Spring configuration
    │   │   ├── controller/         # REST controllers
    │   │   ├── dto/                # Data Transfer Objects
    │   │   ├── entity/             # JPA entities
    │   │   ├── repository/         # Data repositories
    │   │   ├── service/            # Business logic
    │   │   ├── security/           # Security components
    │   │   ├── exception/          # Exception handling
    │   │   └── util/               # Utilities
    │   └── resources/
    │       ├── application.yml     # Application config
    │       └── db/migration/       # Flyway migrations (V1-V17)
    └── test/                       # Test files
```

### 5.2 Running Backend Locally

#### Method 1: Using Gradle Wrapper (Recommended)

```bash
# Navigate to backend directory
cd backend

# Ensure Java 21 is loaded
source ~/.bash_profile

# Run with dev profile (default)
./gradlew bootRun

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Clean build and run
./gradlew clean bootRun
```

#### Method 2: Using JAR

```bash
# Build JAR
./gradlew build

# Run JAR
java -jar build/libs/finance-tracker-1.0.0-SNAPSHOT.jar
```

### 5.3 Backend Configuration

**Base Configuration (`application.yml`):**

```yaml
spring:
  application:
    name: finance-tracker
  profiles:
    active: dev  # Default profile

server:
  port: 8080

app:
  jwt:
    secret: ${JWT_SECRET:default-dev-secret-key-change-in-production}
    expiration-ms: ${JWT_EXPIRATION:3600000}
    cookie-name: auth_token
  cors:
    allowed-origins: http://localhost:5173,http://localhost:3000
```

### 5.4 Backend Build Commands

```bash
# Clean build artifacts
./gradlew clean

# Compile Java code
./gradlew compileJava

# Build without tests
./gradlew build -x test

# Build with tests
./gradlew build

# Check dependencies
./gradlew dependencies

# View available tasks
./gradlew tasks
```

### 5.5 Backend Health Check

```bash
# Check if backend is running
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

---

## 6. Frontend Setup

### 6.1 Frontend Project Structure

```
frontend/
├── package.json                    # npm dependencies
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind CSS config
├── index.html                      # HTML entry point
├── Dockerfile                      # Container image
├── nginx.conf                      # Nginx configuration
└── src/
    ├── main.tsx                    # App entry point
    ├── App.tsx                     # Root component
    ├── components/                 # React components
    ├── pages/                      # Page components
    ├── services/                   # API services
    ├── contexts/                   # React contexts
    ├── hooks/                      # Custom hooks
    ├── lib/                        # Libraries (api-client)
    ├── config/                     # Configuration (api.ts)
    ├── types/                      # TypeScript types
    └── utils/                      # Utility functions
```

### 6.2 Installing Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 6.3 Running Frontend Locally

```bash
# Start development server (with hot reload)
npm run dev

# Development server starts at: http://localhost:5173
# Automatically proxies API requests to http://localhost:8080
```

**Alternative Scripts:**

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run unit tests
npm test

# Run unit tests with coverage
npm run test:coverage
```

### 6.4 Frontend Configuration

**API Configuration (`src/config/api.ts`):**

```typescript
// Automatically uses localhost:8080 for local dev
// Uses nginx proxy in Docker environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL !== undefined 
  ? import.meta.env.VITE_API_BASE_URL 
  : 'http://localhost:8080';

export const API_VERSION = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;
```

**Vite Configuration (`vite.config.ts`):**

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### 6.5 Environment Variables

Create `.env.local` in `frontend/` directory:

```bash
# For local development (uses localhost:8080)
# VITE_API_BASE_URL=http://localhost:8080

# For Docker environment (uses nginx proxy)
# VITE_API_BASE_URL=
```

---

## 7. Docker Compose Setup

### 7.1 Services Overview

The application supports three Docker Compose configurations:

#### Development Mode (`docker-compose.yml`)
| Service | Container Name | Port | Dependencies |
|---------|---------------|------|--------------|
| **mysql** | finance-tracker-mysql | 3306 | - |
| **backend** | finance-tracker-backend | 8080 | mysql (healthy) |
| **frontend** | finance-tracker-frontend | 80 | backend (healthy) |

#### Demo Mode (`docker-compose.demo.yml`)
| Service | Container Name | Port | Dependencies |
|---------|---------------|------|--------------|
| **mysql** | finance-tracker-mysql-demo | 3307 | - |
| **backend** | finance-tracker-backend-demo | 8081 | mysql (healthy) |
| **frontend** | finance-tracker-frontend-demo | 81 | backend (healthy) |

**Demo Mode Features:**
- ✅ Pre-seeded with 180+ realistic transactions over 6 months
- ✅ Demo user: `demo@example.com` / `Demo123!`
- ✅ Automatic data reset daily at 2:00 AM UTC
- ✅ Demo banner displayed in UI
- ✅ Separate database and ports (no conflict with dev mode)

### 7.2 Starting Services

#### Development Mode
```bash
# Start all services in detached mode
docker compose up -d

# Start with rebuild (after code changes)
docker compose up -d --build

# View logs
docker compose logs -f
```

#### Demo Mode
```bash
# Start demo environment
docker compose -f docker-compose.demo.yml up -d

# Start with rebuild
docker compose -f docker-compose.demo.yml up -d --build

# View logs
docker compose -f docker-compose.demo.yml logs -f
```

#### Run Both Simultaneously
```bash
# Development on ports 80/8080/3306
docker compose up -d

# Demo on ports 81/8081/3307
docker compose -f docker-compose.demo.yml up -d
```

### 7.3 Stopping Services

#### Development Mode
```bash
# Stop all services (keeps containers)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (⚠️ deletes data)
docker compose down -v
```

#### Demo Mode
```bash
# Stop demo services
docker compose -f docker-compose.demo.yml stop

# Stop and remove demo containers
docker compose -f docker-compose.demo.yml down

# Reset demo data (remove volumes)
docker compose -f docker-compose.demo.yml down -v
```

### 7.4 Service Status

```bash
# Check running containers (development)
docker compose ps

# Check demo containers
docker compose -f docker-compose.demo.yml ps

# Check all finance-tracker containers
docker ps --filter "name=finance-tracker"
```

### 7.5 Accessing Services

#### Development Mode
**Frontend:**
- URL: <http://localhost> (port 80)
- Nginx serves React app and proxies `/api/*` to backend

**Backend API:**
- URL: <http://localhost:8080>
- Health: <http://localhost:8080/actuator/health>

**MySQL Database:**
- Host: localhost, Port: 3306
- Database: `finance_tracker`
- Username: `financeuser`, Password: `financepass`

#### Demo Mode
**Frontend:**
- URL: <http://localhost:81>
- Demo credentials displayed in banner: `demo@example.com` / `Demo123!`

**Backend API:**
- URL: <http://localhost:8081>
- Health: <http://localhost:8081/actuator/health>

**MySQL Database:**
- Host: localhost, Port: 3307
- Database: `finance_tracker_demo`
- Username: `financeuser`, Password: `financepass`

```bash
# Connect to demo database
mysql -h 127.0.0.1 -P 3307 -u financeuser -p finance_tracker_demo

# Or using Docker exec
docker exec -it finance-tracker-mysql-demo mysql -u financeuser -p finance_tracker_demo
```

### 7.6 Rebuilding Containers

```bash
# Rebuild all services
docker compose build --no-cache

# Rebuild specific service
docker compose build --no-cache backend

# Rebuild and restart
docker compose up -d --build
```

### 7.7 Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Since timestamp
docker compose logs --since 2024-12-04T10:00:00 backend
```

### 7.8 Docker Compose Configuration

**docker-compose.yml highlights:**

```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: finance_tracker
      MYSQL_USER: financeuser
      MYSQL_PASSWORD: financepass
    volumes:
      - mysql_data:/var/lib/mysql          # Persistent data
      - ./docker/mysql/init:/docker-entrypoint-initdb.d
      - ./backups:/backups
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      mysql:
        condition: service_healthy
    environment:
      SPRING_PROFILES_ACTIVE: docker
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/finance_tracker
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s

  frontend:
    build: ./frontend
    depends_on:
      backend:
        condition: service_healthy
```

---

## 8. Database Setup

### 8.1 Database Schema

The Finance Tracker uses **MySQL 8.0** with the following schema:

**Core Tables:**

- `users` - User accounts (V1)
- `account_types` - Account type definitions (V2)
- `accounts` - Financial accounts (V3)
- `categories` - Transaction categories (V4)
- `transactions` - Financial transactions (V5)
- `tags` - Transaction tags (V6)
- `transaction_tags` - Many-to-many tag relationship (V7)
- `budgets` - Budget definitions (V8)
- `recurring_transactions` - Scheduled transactions (V9)
- `audit_log` - Audit trail (V10)
- `revoked_tokens` - Invalidated JWT tokens (V11)
- `currencies` - Currency definitions (V13)
- `saved_searches` - Saved search filters (V15)
- `notifications` - User notifications (V16)
- `notification_preferences` - Notification settings (V17)

### 8.2 Flyway Migrations

Database schema is managed via **Flyway** migrations in `backend/src/main/resources/db/migration/`.

**Migration Files (V1-V17):**

```
V1__create_users_table.sql
V2__create_account_types_table.sql
V3__create_accounts_table.sql
V4__create_categories_table.sql
V5__create_transactions_table.sql
V6__create_tags_table.sql
V7__create_transaction_tags_table.sql
V8__create_budgets_table.sql
V9__create_recurring_transactions_table.sql
V10__create_audit_log_table.sql
V11__create_revoked_tokens_table.sql
V12__seed_default_categories.sql
V13__create_currencies_table.sql
V14__add_currency_relationships.sql
V15__create_saved_searches_table.sql
V16__create_notifications_table.sql
V17__create_notification_preferences_table.sql
```

### 8.3 Running Migrations

**Automatic (Recommended):**

Migrations run automatically when the backend starts:

```bash
# Flyway runs on application startup
./gradlew bootRun
```

**Manual Migration:**

```bash
# Run Flyway migrations directly
./gradlew flywayMigrate

# View migration info
./gradlew flywayInfo

# Validate migrations
./gradlew flywayValidate

# Repair metadata (if needed)
./gradlew flywayRepair
```

### 8.4 Database Initialization

**First-time Setup:**

1. **Create Database:**

   ```bash
   CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Start Backend:**

   ```bash
   cd backend
   ./gradlew bootRun
   ```

3. **Flyway Auto-Runs:**
   - Creates schema tables
   - Seeds default categories (V12)
   - Sets up system data

### 8.5 Seeded Data

**Default Categories (V12):**

- **Income**: Salary, Freelance, Investments, Other Income
- **Expense**: Food, Transportation, Housing, Utilities, Entertainment, Healthcare, Shopping, Education, Personal, Other

### 8.6 Database Connection

**Local MySQL:**

```bash
# Command line
mysql -u financeuser -p finance_tracker

# MySQL Workbench
Host: 127.0.0.1
Port: 3306
Username: financeuser
Password: financepass
Schema: finance_tracker
```

**Docker MySQL:**

```bash
# Using docker exec
docker exec -it finance-tracker-mysql mysql -u financeuser -p finance_tracker

# Using mysql client
mysql -h 127.0.0.1 -P 3306 -u financeuser -p finance_tracker
```

### 8.7 Database Backup & Restore

**Backup:**

```bash
# Create backup
docker exec finance-tracker-mysql mysqldump \
  -u financeuser -pfinancepass finance_tracker > backup_$(date +%Y%m%d).sql

# Or use backup script (if available)
./scripts/backup-database.sh
```

**Restore:**

```bash
# Restore from backup
docker exec -i finance-tracker-mysql mysql \
  -u financeuser -pfinancepass finance_tracker < backup_20241204.sql
```

### 8.8 Database Troubleshooting

**Common Issues:**

```bash
# Check if MySQL is running
docker ps | grep mysql
# Or
systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Test connection
telnet localhost 3306

# Check logs
docker logs finance-tracker-mysql

# Reset database (⚠️ deletes all data)
docker compose down -v
docker compose up -d
```

---

## 9. IDE Configuration

### 9.1 IntelliJ IDEA (Backend)

#### Recommended Plugins

1. **Lombok** - Annotation processor
2. **MapStruct Support** - DTO mapper support
3. **Spring Boot** - Spring framework support
4. **Database Tools** - SQL support (built-in)

#### Project Setup

1. **Import Project:**
   - File → Open → Select `backend/build.gradle`
   - Trust Gradle project

2. **Set JDK:**
   - File → Project Structure → Project Settings → Project
   - SDK: Java 21
   - Language Level: 21

3. **Enable Annotation Processing:**
   - Settings → Build, Execution, Deployment → Compiler → Annotation Processors
   - ✅ Enable annotation processing

4. **Run Configuration:**
   - Run → Edit Configurations → Add New → Spring Boot
   - Main class: `com.financetracker.FinanceTrackerApplication`
   - Active profiles: `dev`
   - Environment variables: `JWT_SECRET=dev-secret`

#### Database Tool Window

1. **Add Data Source:**
   - View → Tool Windows → Database
   - - → Data Source → MySQL
   - Host: localhost
   - Port: 3306
   - Database: finance_tracker
   - User: financeuser
   - Password: financepass

### 9.2 VS Code (Frontend)

#### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "Orta.vscode-jest",
    "ms-playwright.playwright"
  ]
}
```

#### Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ]
}
```

#### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src"
    }
  ]
}
```

### 9.3 VS Code (Full Stack)

#### Multi-Root Workspace

Create `finance-tracker.code-workspace`:

```json
{
  "folders": [
    {
      "name": "Frontend",
      "path": "./frontend"
    },
    {
      "name": "Backend",
      "path": "./backend"
    }
  ],
  "settings": {
    "files.exclude": {
      "**/node_modules": true,
      "**/build": true,
      "**/.gradle": true
    }
  }
}
```

---

## 10. Common Commands Reference

### 10.1 Docker Commands

```bash
# Start/Stop Services
docker compose up -d                    # Start all services
docker compose down                     # Stop and remove
docker compose restart backend          # Restart specific service
docker compose stop                     # Stop without removing

# Logs
docker compose logs -f                  # Follow all logs
docker compose logs -f backend          # Follow backend logs
docker compose logs --tail=100 mysql    # Last 100 lines

# Build
docker compose build --no-cache         # Rebuild all
docker compose build backend            # Rebuild backend only
docker compose up -d --build            # Build and start

# Status
docker compose ps                       # Service status
docker ps                               # Running containers
docker stats                            # Resource usage

# Clean Up
docker compose down -v                  # Remove volumes
docker system prune -a                  # Clean everything
docker volume prune                     # Clean volumes
```

### 10.2 Backend Commands

```bash
# Build & Run
source ~/.bash_profile                  # Load Java 21
cd backend
./gradlew bootRun                       # Run application
./gradlew bootRun --args='--spring.profiles.active=dev'  # With profile
./gradlew build                         # Build JAR
./gradlew clean build                   # Clean build
./gradlew build -x test                 # Build without tests

# Testing
./gradlew test                          # Run all tests
./gradlew test --tests "com.financetracker.ApiTestSuite"  # Run suite
./gradlew test --tests "*ControllerIntegrationTest"      # Controller tests
./gradlew test --continuous             # Watch mode

# Database
./gradlew flywayMigrate                 # Run migrations
./gradlew flywayInfo                    # Migration status
./gradlew flywayValidate                # Validate migrations
./gradlew flywayRepair                  # Repair metadata

# Dependencies
./gradlew dependencies                  # View dependencies
./gradlew dependencyUpdates             # Check for updates
```

### 10.3 Frontend Commands

```bash
cd frontend

# Development
npm install                             # Install dependencies
npm run dev                             # Start dev server
npm run build                           # Production build
npm run preview                         # Preview build
npm run lint                            # Run ESLint

# Testing
npm test                                # Run Vitest tests
npm run test:run                        # Run once
npm run test:coverage                   # With coverage
npm run test:e2e                        # Playwright E2E tests
npm run test:e2e:ui                     # Playwright UI mode
npm run test:e2e:debug                  # Debug tests
npm run test:e2e:report                 # View test report

# Dependencies
npm outdated                            # Check updates
npm update                              # Update packages
npm audit                               # Security audit
npm audit fix                           # Fix vulnerabilities
```

### 10.4 Database Commands

```bash
# MySQL Access
mysql -h 127.0.0.1 -P 3306 -u financeuser -p finance_tracker
docker exec -it finance-tracker-mysql mysql -u financeuser -p finance_tracker

# Backup
docker exec finance-tracker-mysql mysqldump \
  -u financeuser -pfinancepass finance_tracker > backup.sql

# Restore
docker exec -i finance-tracker-mysql mysql \
  -u financeuser -pfinancepass finance_tracker < backup.sql

# Quick Queries
docker exec -it finance-tracker-mysql mysql -u financeuser -pfinancepass \
  -e "USE finance_tracker; SHOW TABLES;"

docker exec -it finance-tracker-mysql mysql -u financeuser -pfinancepass \
  -e "USE finance_tracker; SELECT * FROM flyway_schema_history;"
```

### 10.5 Git Commands

```bash
# Branch Management
git checkout develop                    # Switch to develop
git checkout -b feature/new-feature     # Create feature branch
git checkout -b bugfix/fix-issue        # Create bugfix branch

# Committing
git status                              # Check status
git add .                               # Stage all changes
git commit -m "feat: add new feature"   # Commit changes
git push origin feature/new-feature     # Push to remote

# Syncing
git pull origin develop                 # Pull latest changes
git fetch --all                         # Fetch all branches
git merge develop                       # Merge develop into current

# Viewing
git log --oneline                       # Commit history
git diff                                # View changes
git branch -a                           # List all branches
```

---

## 11. Testing

### 11.1 Backend Testing

**Integration Tests:**

```bash
# Run all integration tests
./gradlew test

# Run specific test suite
./gradlew test --tests "com.financetracker.ApiTestSuite"

# Run controller tests only
./gradlew test --tests "*ControllerIntegrationTest"

# Run with coverage
./gradlew test jacocoTestReport

# View coverage report
open build/reports/jacoco/test/html/index.html
```

**Test Structure:**

```java
// Extend BaseIntegrationTest for authenticated tests
public class TransactionControllerIntegrationTest extends BaseIntegrationTest {
    
    @Test
    void testCreateTransaction() throws Exception {
        Cookie authCookie = registerAndLogin("user", "user@test.com", "password123");
        
        mockMvc.perform(post("/api/v1/transactions")
                .cookie(authCookie)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isCreated());
    }
}
```

### 11.2 Frontend Testing

**Unit Tests (Vitest):**

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/Button.test.tsx
```

**E2E Tests (Playwright):**

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (recommended)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- tests/auth.spec.ts

# Debug mode
npm run test:e2e:debug

# View last report
npm run test:e2e:report
```

### 11.3 API Testing

**Using cURL:**

```bash
# Register user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser","password":"SecurePass123!"}'

# Get accounts (with auth cookie)
curl -X GET http://localhost:8080/api/v1/accounts \
  -b cookies.txt
```

**Using Postman:**

1. Import environment: `docs/postman/finance-tracker.postman_environment.json`
2. Import collection: `docs/postman/finance-tracker.postman_collection.json`
3. Run collection with tests

---

## 12. Demo Mode Guide

### 12.1 What is Demo Mode?

Demo mode is a fully functional environment pre-populated with realistic data to showcase all features of Finance Tracker. It's perfect for:
- **Product demonstrations** to potential users
- **Feature exploration** without setting up test data
- **Screenshots and marketing** materials
- **Testing workflows** with realistic scenarios

### 12.2 Demo Data Overview

The demo environment includes:
- **1 Demo User**: `demo@example.com` / `Demo123!`
- **6 Diverse Accounts**: Checking, Savings, Cash, Credit Card, Investment, Car Loan
- **180+ Transactions** over 6 months including:
  - 15 income transactions (bi-weekly salary + bonuses)
  - 100+ expense transactions across 15 categories
  - 20 transfer transactions (savings, investments, loan payments)
  - 45 recurring bills and subscriptions
- **10 Budgets**: Monthly, quarterly, and annual budgets
- **7 Recurring Transactions**: Rent, utilities, subscriptions
- **7 Notifications**: Budget alerts and payment reminders
- **5 Saved Searches**: Common search patterns
- **7 Custom Tags**: Work-related, tax-deductible, vacation, etc.
- **15 Custom Categories**: Coffee shops, gas stations, streaming services, etc.

### 12.3 Starting Demo Mode

```bash
# Start demo environment
docker compose -f docker-compose.demo.yml up -d

# View logs
docker compose -f docker-compose.demo.yml logs -f

# Check status
docker compose -f docker-compose.demo.yml ps
```

**Access:**
- Frontend: <http://localhost:81>
- Backend: <http://localhost:8081>
- Database: `localhost:3307`

### 12.4 Demo Mode Features

#### Automatic Data Reset
- **Schedule**: Every day at 2:00 AM UTC
- **Process**: Deletes all demo user data and re-seeds from migrations
- **Purpose**: Keeps demo environment fresh and consistent

#### Demo Banner
- Displayed at top of application when `VITE_DEMO_MODE=true`
- Shows demo credentials prominently
- Includes link to create real account
- Dismissible (reappears on refresh)

#### Isolated Environment
- Separate database: `finance_tracker_demo`
- Separate ports: 81 (frontend), 8081 (backend), 3307 (MySQL)
- Can run alongside development environment

### 12.5 Demo Mode Configuration

**Backend (`application-demo.yml`):**
```yaml
app:
  demo:
    enabled: true
    username: demo@example.com
    password: Demo123!
    reset-schedule: "0 0 2 * * *"  # Daily at 2 AM UTC
    show-banner: true
```

**Frontend Environment:**
```bash
VITE_DEMO_MODE=true  # Enables demo banner
```

### 12.6 Manually Resetting Demo Data

```bash
# Stop demo services
docker compose -f docker-compose.demo.yml down

# Remove demo database volume
docker volume rm finance-tracker-mysql-demo

# Restart (will recreate database and seed data)
docker compose -f docker-compose.demo.yml up -d
```

### 12.7 Customizing Demo Data

Demo data is stored in SQL migration files:

```
backend/src/main/resources/db/demo/
├── V100__seed_demo_user_and_accounts.sql       # User & 6 accounts
├── V101__seed_demo_categories_and_tags.sql     # Categories & tags
├── V102__seed_demo_income_transactions.sql     # 15 income transactions
├── V103__seed_demo_expenses_part1.sql          # 60 expense transactions
├── V104__seed_demo_expenses_part2.sql          # 40 expense transactions
├── V105__seed_demo_transfers_and_investments.sql  # 20 transfers
└── V106__seed_demo_budgets_and_recurring.sql   # Budgets, recurring, notifications
```

**To modify demo data:**
1. Edit the appropriate SQL file
2. Rebuild backend: `docker compose -f docker-compose.demo.yml build --no-cache backend`
3. Reset demo: `docker compose -f docker-compose.demo.yml down -v && docker compose -f docker-compose.demo.yml up -d`

### 12.8 Demo Mode vs Development Mode

| Feature | Development Mode | Demo Mode |
|---------|-----------------|-----------|
| **Port (Frontend)** | 80 | 81 |
| **Port (Backend)** | 8080 | 8081 |
| **Port (MySQL)** | 3306 | 3307 |
| **Database** | `finance_tracker` | `finance_tracker_demo` |
| **Initial Data** | Empty | 180+ transactions |
| **Auto-Reset** | No | Yes (daily at 2 AM) |
| **Demo Banner** | No | Yes |
| **User Credentials** | Register manually | `demo@example.com` / `Demo123!` |
| **Purpose** | Feature development | Product demonstration |

### 12.9 Production Deployment Note

⚠️ **Never deploy demo mode to production**. Demo mode includes:
- Hardcoded demo credentials
- Automatic data deletion (reset schedule)
- Public demo user information

To disable demo mode, ensure `app.demo.enabled=false` or omit the property entirely.

---

## 13. Troubleshooting

### 12.1 Java/Backend Issues

#### Issue: "java: release version 21 not found"

**Solution:**

```bash
# Verify Java 21 is installed
java -version

# Update ~/.bash_profile or ~/.zshrc
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
export PATH=$JAVA_HOME/bin:$PATH

# Apply changes
source ~/.bash_profile
```

#### Issue: "Could not connect to MySQL"

**Solution:**

```bash
# Check MySQL is running
docker ps | grep mysql

# Check connection
telnet localhost 3306

# Verify credentials in application-dev.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/finance_tracker
    username: financeuser
    password: financepass

# Check MySQL logs
docker logs finance-tracker-mysql
```

#### Issue: "Flyway migration failed"

**Solution:**

```bash
# Check migration history
./gradlew flywayInfo

# Repair metadata
./gradlew flywayRepair

# If corrupted, reset (⚠️ deletes data)
docker exec -it finance-tracker-mysql mysql -u root -prootpassword \
  -e "DROP DATABASE finance_tracker; CREATE DATABASE finance_tracker;"
./gradlew bootRun
```

#### Issue: "Port 8080 already in use"

**Solution:**

```bash
# Find process using port
lsof -i :8080
# Or
netstat -ano | grep 8080

# Kill process
kill -9 <PID>

# Or change port in application.yml
server:
  port: 8081
```

### 12.2 Frontend Issues

#### Issue: "CORS error when calling API"

**Solution:**

Check `application.yml`:

```yaml
app:
  cors:
    allowed-origins: http://localhost:5173,http://localhost:3000
```

Restart backend after changes.

#### Issue: "Module not found" errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Issue: "Build fails with TypeScript errors"

**Solution:**

```bash
# Check TypeScript version
npm list typescript

# Verify tsconfig.json
cat tsconfig.json

# Run type check
npx tsc --noEmit

# Fix specific errors shown in output
```

### 12.3 Docker Issues

#### Issue: "Unhealthy" service status

**Solution:**

```bash
# Check specific service health
docker inspect finance-tracker-backend --format='{{json .State.Health}}'

# View health check logs
docker logs finance-tracker-backend | grep health

# Restart service
docker compose restart backend

# Check dependencies
docker compose ps
```

#### Issue: "Cannot connect to database from backend container"

**Solution:**

```bash
# Verify MySQL is healthy
docker compose ps mysql

# Check network
docker network ls
docker network inspect finance-tracker_finance-network

# Test connection from backend container
docker exec -it finance-tracker-backend ping mysql

# Verify environment variables
docker exec -it finance-tracker-backend env | grep SPRING
```

#### Issue: "Out of disk space"

**Solution:**

```bash
# Check disk usage
docker system df

# Clean up
docker system prune -a          # All unused data
docker volume prune             # Unused volumes
docker image prune -a           # Unused images

# Remove specific volumes
docker volume rm finance-tracker_mysql_data
```

### 12.4 Database Issues

#### Issue: "Access denied for user"

**Solution:**

```bash
# Connect as root
docker exec -it finance-tracker-mysql mysql -u root -prootpassword

# Grant permissions
GRANT ALL PRIVILEGES ON finance_tracker.* TO 'financeuser'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### Issue: "Table doesn't exist"

**Solution:**

```bash
# Check Flyway status
./gradlew flywayInfo

# Verify migrations ran
docker exec -it finance-tracker-mysql mysql -u financeuser -pfinancepass \
  -e "USE finance_tracker; SELECT * FROM flyway_schema_history;"

# Re-run migrations
./gradlew flywayMigrate
```

### 12.5 Authentication Issues

#### Issue: "CSRF token validation failed"

**Solution:**

Frontend should automatically handle CSRF via `api-client.ts`. Check:

```typescript
// Verify axios interceptor in src/lib/api-client.ts
apiClient.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken(); // From cookie
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  return config;
});
```

#### Issue: "401 Unauthorized on valid requests"

**Solution:**

```bash
# Check JWT configuration
# Backend application.yml
app:
  jwt:
    secret: <must be same value>
    expiration-ms: 3600000

# Verify cookie is set
# Browser DevTools → Application → Cookies
# Should see: auth_token, XSRF-TOKEN

# Check backend logs for JWT errors
docker logs finance-tracker-backend | grep JWT
```

### 12.6 Performance Issues

#### Issue: "Slow API responses"

**Solution:**

```bash
# Check database query performance
# Enable SQL logging in application-dev.yml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

# Optimize database connections
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10

# Check for N+1 queries in logs
```

#### Issue: "Frontend build is slow"

**Solution:**

```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Use faster dependency pre-bundling
# vite.config.ts
export default defineConfig({
  optimizeDeps: {
    include: ['react', 'react-dom', 'axios'],
  },
})
```

### 12.7 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Connection refused` | Backend not running | Start backend: `./gradlew bootRun` |
| `ERR_CONNECTION_REFUSED` | Frontend proxy misconfigured | Check Vite proxy in `vite.config.ts` |
| `ClassNotFoundException` | Dependency issue | Run `./gradlew clean build` |
| `Access to XMLHttpRequest blocked by CORS` | CORS not configured | Add origin to `application.yml` |
| `flyway_schema_history doesn't exist` | Fresh database | Migrations will auto-run |
| `Port already in use` | Service already running | Kill process or change port |

---

## Additional Resources

### Documentation

- [Architecture Overview](../architecture/ARCHITECTURE.md)
- [Database Schema](../architecture/DATABASE.md)
- [API Reference](../api/API_REFERENCE.md)
- [User Guide](../USER_GUIDE.md)
- [Deployment Guide](../../DEPLOYMENT.md)

### External Links

- [Spring Boot Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Docker Documentation](https://docs.docker.com/)

### Support

- **GitHub Issues**: [https://github.com/kattelsameer/finance-tracker/issues](https://github.com/kattelsameer/finance-tracker/issues)
- **Project README**: [../../README.md](../../README.md)

---

**Last Updated**: December 4, 2025  
**Version**: 1.0.0  
**Maintainer**: Finance Tracker Development Team
