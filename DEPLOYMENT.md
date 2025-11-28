# Finance Tracker Deployment Guide

> **Version**: 1.0.0  
> **Last Updated**: November 28, 2025  
> **Supported Platforms**: Linux, macOS, Windows (with Docker)

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
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Disk** | 10 GB | 20 GB SSD |
| **OS** | Linux, macOS, Windows 10+ | Linux (Ubuntu 22.04 LTS) |

### Required Software

- **Docker**: 24.0+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.20+ (included with Docker Desktop)
- **Git**: 2.30+ (for cloning the repository)
- **OpenSSL**: For generating secrets (usually pre-installed)

### Port Requirements

The following ports must be available:

- **80** (HTTP - Frontend)
- **8080** (Backend API)
- **3306** (MySQL - only in development)

---

## Quick Start (Development)

Perfect for local development and testing.

### 1. Clone the Repository

```bash
git clone https://github.com/kattelsameer/finance-tracker.git
cd finance-tracker
```

### 2. Create Environment File

```bash
cp .env.example .env
```

**Edit `.env` and update the passwords** (or use defaults for development):

```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER=financeuser
MYSQL_PASSWORD=financepass
JWT_SECRET=your-256-bit-secret-key-for-jwt-token-generation-min-32-chars
```

### 3. Start Services

```bash
# Development mode (uses docker-compose.dev.yml)
docker-compose -f docker-compose.dev.yml up -d

# Or use default docker-compose.yml
docker-compose up -d
```

### 4. Verify Deployment

```bash
# Check all containers are running
docker-compose ps

# Expected output:
# NAME                      STATUS          PORTS
# finance-tracker-mysql     Up (healthy)    0.0.0.0:3306->3306/tcp
# finance-tracker-backend   Up (healthy)    0.0.0.0:8080->8080/tcp
# finance-tracker-frontend  Up (healthy)    0.0.0.0:80->80/tcp
```

### 5. Access the Application

- **Frontend**: <http://localhost>
- **Backend API**: <http://localhost:8080>
- **API Docs**: <http://localhost:8080/swagger-ui.html> (if enabled)
- **Health Check**: <http://localhost:8080/actuator/health>

### 6. Create First User

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

### 7. Login

Navigate to <http://localhost> and login with your credentials.

---

## Production Deployment

For production environments with enhanced security and performance.

### 1. Prepare Production Environment

```bash
# Clone repository
git clone https://github.com/kattelsameer/finance-tracker.git
cd finance-tracker

# Checkout stable release (recommended)
git checkout tags/v1.0.0  # Or latest stable release
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secret (64 characters)
openssl rand -base64 64

# Generate MySQL root password
openssl rand -base64 32

# Generate MySQL user password
openssl rand -base64 32
```

### 3. Configure Production Environment

Create `.env` file with **strong, unique passwords**:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=<your-generated-root-password>
MYSQL_USER=financeuser
MYSQL_PASSWORD=<your-generated-user-password>
MYSQL_DATABASE=finance_tracker

# Backend Configuration
SPRING_PROFILES_ACTIVE=prod
BACKEND_PORT=8080

# JWT Configuration
JWT_SECRET=<your-generated-jwt-secret>
JWT_EXPIRATION_MS=3600000

# Java Options (adjust based on available RAM)
JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC

# Logging
LOGGING_LEVEL=INFO

# Frontend Configuration
FRONTEND_PORT=80

# Timezone
TZ=America/New_York
```

### 4. Build and Deploy

```bash
# Pull latest images (if using pre-built images)
docker-compose -f docker-compose.prod.yml pull

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Verify health
docker-compose -f docker-compose.prod.yml ps
```

### 5. Verify Production Deployment

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test backend health
curl http://localhost:8080/actuator/health

# Expected output:
# {"status":"UP"}

# Test frontend
curl http://localhost/health

# Expected output:
# healthy
```

### 6. Set Up Reverse Proxy (Recommended)

For HTTPS support, use Nginx or Traefik as a reverse proxy:

#### Option A: Nginx Reverse Proxy

Create `/etc/nginx/sites-available/finance-tracker`:

```nginx
server {
    listen 443 ssl http2;
    server_name finance.example.com;

    ssl_certificate /etc/letsencrypt/live/finance.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finance.example.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name finance.example.com;
    return 301 https://$server_name$request_uri;
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/finance-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Environment Configuration

### Environment Variables Reference

| Variable | Default | Description | Required |
|----------|---------|-------------|----------|
| `MYSQL_ROOT_PASSWORD` | - | MySQL root password | Yes |
| `MYSQL_USER` | financeuser | MySQL application user | Yes |
| `MYSQL_PASSWORD` | - | MySQL user password | Yes |
| `MYSQL_DATABASE` | finance_tracker | Database name | No |
| `MYSQL_PORT` | 3306 | MySQL external port | No |
| `JWT_SECRET` | - | JWT signing secret (min 32 chars) | Yes |
| `JWT_EXPIRATION_MS` | 3600000 | JWT expiration (1 hour) | No |
| `SPRING_PROFILES_ACTIVE` | docker | Spring profile (dev/docker/prod) | No |
| `BACKEND_PORT` | 8080 | Backend API port | No |
| `FRONTEND_PORT` | 80 | Frontend web port | No |
| `JAVA_OPTS` | -Xms256m -Xmx512m | JVM options | No |
| `LOGGING_LEVEL` | INFO | Logging level | No |
| `TZ` | UTC | Timezone | No |
| `CORS_ALLOWED_ORIGINS` | <http://localhost> | Allowed CORS origins | No |
| `COOKIE_SECURE` | false | Enable secure cookies (HTTPS only) | No |

### Spring Profiles

| Profile | Use Case | Config File |
|---------|----------|-------------|
| `dev` | Local development | `application-dev.yml` |
| `docker` | Docker Compose development | `application-docker.yml` |
| `prod` | Production deployment | `application-prod.yml` |

---

## Database Management

### Access MySQL Database

#### Development (Port Exposed)

```bash
# Using Docker exec
docker exec -it finance-tracker-mysql mysql -u financeuser -p finance_tracker

# Using MySQL client on host
mysql -h 127.0.0.1 -P 3306 -u financeuser -p finance_tracker
```

#### Production (No Port Exposed)

```bash
# Using Docker exec (recommended in production)
docker exec -it finance-tracker-mysql-prod mysql -u financeuser -p finance_tracker
```

### Database Migrations

Flyway handles database migrations automatically on startup.

#### Check Migration Status

```bash
# View Flyway schema history
docker exec -it finance-tracker-backend-prod \
  java -cp /app/app.jar \
  org.springframework.boot.loader.JarLauncher \
  org.flywaydb.commandline.Main info
```

#### View Applied Migrations

```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

### Manual Schema Backup

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker exec finance-tracker-mysql mysqldump \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  finance_tracker > backups/finance_tracker_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker exec -i finance-tracker-mysql mysql \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  finance_tracker < backups/finance_tracker_20251128_120000.sql
```

---

## Monitoring & Logging

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Application Logs

Backend logs are stored in `/app/logs` inside the container and mounted to `backend_logs` volume.

```bash
# View backend logs
docker exec finance-tracker-backend-prod tail -f /app/logs/finance-tracker.log

# Copy logs to host
docker cp finance-tracker-backend-prod:/app/logs/. ./logs/
```

### Health Checks

```bash
# Backend health
curl http://localhost:8080/actuator/health

# Backend info
curl http://localhost:8080/actuator/info

# Prometheus metrics
curl http://localhost:8080/actuator/prometheus
```

### Resource Monitoring

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Volume usage
docker volume ls
```

---

## Backup & Recovery

### Automated Backup Script

Create `scripts/backup.sh`:

```bash
#!/bin/bash
set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="finance-tracker-mysql-prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
echo "Backing up database..."
docker exec $DB_CONTAINER mysqldump \
  -u root -p${MYSQL_ROOT_PASSWORD} \
  --single-transaction \
  --routines \
  --triggers \
  finance_tracker > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

Make executable and run:

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Schedule Automated Backups

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/finance-tracker && ./scripts/backup.sh >> /var/log/finance-backup.log 2>&1
```

### Disaster Recovery

```bash
# 1. Stop services
docker-compose -f docker-compose.prod.yml down

# 2. Restore database
zcat backups/db_backup_20251128_020000.sql.gz | \
  docker exec -i finance-tracker-mysql-prod mysql \
  -u root -p${MYSQL_ROOT_PASSWORD} finance_tracker

# 3. Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:80 failed: port is already allocated`

**Solution**:

```bash
# Find process using port
sudo lsof -i :80  # or :8080, :3306

# Kill process or change port in .env
FRONTEND_PORT=8000
```

#### 2. Database Connection Failed

**Error**: `Communications link failure`

**Solution**:

```bash
# Check MySQL container is running
docker ps | grep mysql

# Check MySQL logs
docker logs finance-tracker-mysql

# Verify environment variables
docker-compose config

# Restart MySQL
docker-compose restart mysql
```

#### 3. Backend Won't Start

**Error**: `Application run failed`

**Solution**:

```bash
# Check backend logs
docker logs finance-tracker-backend

# Common causes:
# - Database not ready: Wait for MySQL healthy status
# - Invalid JWT_SECRET: Must be at least 32 characters
# - Flyway migration errors: Check migration scripts

# Restart with fresh logs
docker-compose restart backend
docker logs -f finance-tracker-backend
```

#### 4. Frontend Shows Blank Page

**Solution**:

```bash
# Check frontend logs
docker logs finance-tracker-frontend

# Check nginx configuration
docker exec finance-tracker-frontend cat /etc/nginx/conf.d/default.conf

# Verify backend is accessible
curl http://backend:8080/actuator/health

# Rebuild frontend
docker-compose up -d --build frontend
```

#### 5. Out of Memory

**Error**: `java.lang.OutOfMemoryError: Java heap space`

**Solution**:

```env
# Increase JVM memory in .env
JAVA_OPTS=-Xms1024m -Xmx2048m

# Restart backend
docker-compose restart backend
```

### Debug Mode

Enable debug logging:

```env
LOGGING_LEVEL=DEBUG
```

Restart services:

```bash
docker-compose restart backend
docker logs -f finance-tracker-backend
```

### Reset Everything

**Warning**: This will delete all data!

```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Remove all application images
docker rmi finance-tracker-backend:latest finance-tracker-frontend:latest

# Clean up system
docker system prune -a --volumes

# Start fresh
docker-compose up -d --build
```

---

## Security Considerations

### Production Checklist

- [ ] **Strong Passwords**: Use generated passwords (min 32 chars)
- [ ] **JWT Secret**: Use cryptographically random secret (min 64 chars)
- [ ] **HTTPS**: Enable SSL/TLS with valid certificates
- [ ] **Firewall**: Restrict access to necessary ports only
- [ ] **Database Access**: Do NOT expose MySQL port (3306) in production
- [ ] **Regular Updates**: Keep Docker images and dependencies updated
- [ ] **Backups**: Implement automated daily backups
- [ ] **Monitoring**: Set up health checks and alerting
- [ ] **Log Rotation**: Configure log limits to prevent disk space issues
- [ ] **Secure Cookies**: Set `COOKIE_SECURE=true` when using HTTPS
- [ ] **CORS**: Configure `CORS_ALLOWED_ORIGINS` for your domain
- [ ] **Rate Limiting**: Consider adding Nginx rate limiting
- [ ] **WAF**: Consider Web Application Firewall (Cloudflare, AWS WAF)

### Secure Deployment Example

```env
# Production .env with security best practices
MYSQL_ROOT_PASSWORD=<generated-64-char-password>
MYSQL_USER=financeuser
MYSQL_PASSWORD=<generated-64-char-password>
JWT_SECRET=<generated-128-char-secret>
SPRING_PROFILES_ACTIVE=prod
COOKIE_SECURE=true
CORS_ALLOWED_ORIGINS=https://finance.example.com
TZ=UTC
```

### SSL/TLS Configuration

Use Let's Encrypt for free SSL certificates:

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d finance.example.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

---

## Support

For issues and questions:

- **GitHub Issues**: <https://github.com/kattelsameer/finance-tracker/issues>
- **Documentation**: See `docs/USER_GUIDE.md`
- **Email**: <support@example.com>

---

**Last Updated**: November 28, 2025  
**Document Version**: 1.0.0
