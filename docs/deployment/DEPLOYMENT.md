# Finance Tracker Deployment Guide

> Version: 1.0.0  
> Last Updated: December 4, 2025  
> Supported Platforms: Linux, macOS, Windows (with Docker)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Development)](#quick-start-development)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Management](#database-management)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Disk | 10 GB | 20 GB SSD |
| OS | Linux, macOS, Windows 10+ | Linux (Ubuntu 22.04 LTS) |

### Required Software

- Docker: 24.0+ (Docker Desktop includes compose v2)
- Git: 2.30+
- OpenSSL: for generating secrets (typically pre-installed)

### Port Requirements

- 80 (Frontend HTTP)
- 8080 (Backend API)
- 3306 (MySQL – development only)

---

## Quick Start (Development)

This uses the root `docker-compose.yml` and maps ports directly on localhost.

### 1. Clone the Repository

```bash
git clone https://github.com/kattelsameer/finance-tracker.git
cd finance-tracker
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` (defaults are safe for local dev):

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=financeuser
MYSQL_PASSWORD=financepass
JWT_SECRET=your-256-bit-secret-key-for-jwt-token-generation-min-32-chars
BACKEND_PORT=8080
FRONTEND_PORT=80
SPRING_PROFILES_ACTIVE=docker
```

### 3. Start Services

```bash
docker compose up -d
```

### 4. Verify Containers

```bash
docker compose ps
```

Expected containers and ports (from `docker-compose.yml`):

- `finance-tracker-mysql` → `3306:3306`
- `finance-tracker-backend` → `8080:8080`
- `finance-tracker-frontend` → `80:80`

Health checks configured:

- Backend: `http://localhost:8080/actuator/health`
- Frontend: `http://localhost/health`

### 5. Access the App

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`
- Health: `http://localhost:8080/actuator/health`

### 6. First User

Use the UI Register page at `http://localhost/register`. Alternatively:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin123!",
    "displayName": "Admin User"
  }'
```

---

## Production Deployment

Use `docker-compose.prod.yml` with stronger secrets and hardened settings.

### 1. Prepare Environment

```bash
git clone https://github.com/kattelsameer/finance-tracker.git
cd finance-tracker
```

### 2. Generate Secrets

```bash
openssl rand -base64 64   # JWT secret
openssl rand -base64 32   # MySQL root password
openssl rand -base64 32   # MySQL app user password
```

### 3. Configure `.env`

```env
# Database
MYSQL_ROOT_PASSWORD=<secure>
MYSQL_USER=financeuser
MYSQL_PASSWORD=<secure>
MYSQL_DATABASE=finance_tracker

# Backend
SPRING_PROFILES_ACTIVE=prod
BACKEND_PORT=8080
JWT_SECRET=<secure>
JWT_EXPIRATION_MS=3600000
JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
LOGGING_LEVEL=INFO

# Frontend
FRONTEND_PORT=80

# Misc
TZ=UTC
```

### 4. Deploy

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

### 5. Verify

```bash
docker compose -f docker-compose.prod.yml logs -f backend
curl http://localhost:8080/actuator/health   # {"status":"UP"}
curl http://localhost/health                 # healthy
```

### 6. Reverse Proxy (HTTPS)

Place an HTTPS reverse proxy (e.g., Nginx, Traefik) in front of the frontend on port 80. The proxy should forward `https://<host>/` → `http://localhost:80` and set standard security headers. Certificates can be provisioned via Let’s Encrypt.

---

## Environment Configuration

Environment variables used by `docker-compose.yml`:

- `MYSQL_ROOT_PASSWORD` (required)
- `MYSQL_USER` (default `financeuser`)
- `MYSQL_PASSWORD` (required)
- `MYSQL_DATABASE` (default `finance_tracker`)
- `MYSQL_PORT` (default `3306`)
- `SPRING_PROFILES_ACTIVE` (default `docker`)
- `JWT_SECRET` (required)
- `JWT_EXPIRATION_MS` (default `3600000`)
- `BACKEND_PORT` (default `8080`)
- `FRONTEND_PORT` (default `80`)
- `JAVA_OPTS` (default `-Xms256m -Xmx512m`)
- `LOGGING_LEVEL` (default `INFO` via `LOGGING_LEVEL_ROOT`)
- `TZ` (default `UTC`)

Backend datasource is wired in compose:

```
SPRING_DATASOURCE_URL=jdbc:mysql://mysql:3306/finance_tracker?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=${MYSQL_USER}
SPRING_DATASOURCE_PASSWORD=${MYSQL_PASSWORD}
```

Volumes (from compose):

- `mysql_data` → `/var/lib/mysql`
- `backend_logs` → `/app/logs`
- Host `./backups` → backend `/app/backups` and MySQL `/backups`

Health checks (from compose):

- MySQL: `mysqladmin ping`
- Backend: `GET http://localhost:8080/actuator/health`
- Frontend: `GET http://localhost/health`

Profiles:

- `dev` → local backend run (`./gradlew bootRun`)
- `docker` → compose development
- `prod` → production deployment

---

## Database Management

### Connect to MySQL (Dev)

```bash
docker exec -it finance-tracker-mysql mysql -u financeuser -p finance_tracker
mysql -h 127.0.0.1 -P 3306 -u financeuser -p finance_tracker
```

### Migrations (Flyway)

Applied automatically on backend startup. Check history:

```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

---

## Monitoring & Logging

### Logs

```bash
docker compose logs -f
docker compose logs -f backend
docker exec finance-tracker-backend tail -f /app/logs/finance-tracker.log
```

### Health

```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/info
curl http://localhost:8080/actuator/prometheus
```

---

## Backup & Recovery

### Backup

```bash
mkdir -p backups
docker exec finance-tracker-mysql mysqldump \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  finance_tracker > backups/finance_tracker_$(date +%Y%m%d_%H%M%S).sql
```

### Restore

```bash
docker exec -i finance-tracker-mysql mysql \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  finance_tracker < backups/finance_tracker_YYYYMMDD_HHMMSS.sql
```

---

## Troubleshooting

- Backend unhealthy: check `JWT_SECRET` is set and MySQL creds match
- MySQL fails: validate `MYSQL_ROOT_PASSWORD`, disk space, and healthcheck
- Frontend unhealthy: ensure backend is UP; check `http://localhost/health`
- Ports in use: adjust `BACKEND_PORT`, `FRONTEND_PORT`, `MYSQL_PORT` in `.env`

---

## Security Considerations

- Use HTTPS in production via a reverse proxy
- Set `COOKIE_SECURE=true` when serving over HTTPS
- Rotate JWT secret and database passwords periodically
- Restrict access to the `backups/` directory and volumes
