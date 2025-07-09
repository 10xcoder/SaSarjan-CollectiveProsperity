# 🏠 Self-Hosted Deployment Guide

**Complete guide for deploying SaSarjan App Store on your own infrastructure**

---

## 🚀 Quick Start

### Prerequisites
```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Node.js and pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh
```

### Basic Deployment
```bash
# Clone repository
git clone https://github.com/your-org/SaSarjan-AppStore.git
cd SaSarjan-AppStore

# Configure environment
cp .env.example .env.production
# Edit .env.production with your values

# Build and deploy
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📋 Infrastructure Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **Memory**: 4GB RAM
- **Storage**: 50GB SSD
- **Network**: 1Gbps connection
- **OS**: Ubuntu 22.04 LTS (recommended)

### Recommended Requirements
- **CPU**: 4+ cores
- **Memory**: 8GB+ RAM
- **Storage**: 100GB+ SSD
- **Network**: 1Gbps+ connection
- **Load Balancer**: NGINX/HAProxy
- **SSL**: Let's Encrypt certificates

### Production Requirements
- **CPU**: 8+ cores
- **Memory**: 16GB+ RAM
- **Storage**: 200GB+ SSD
- **Database**: Separate PostgreSQL server
- **CDN**: CloudFlare/AWS CloudFront
- **Monitoring**: Prometheus + Grafana

---

## 🐳 Docker Deployment

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  # Main SaSarjan App
  sasarjan-web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # TalentExcel App
  talentexcel:
    build:
      context: ./apps/talentexcel
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3005:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # 10xGrowth App
  growth-app:
    build:
      context: ./apps/10x-growth
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3003:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # SevaPremi App
  sevapremi:
    build:
      context: ./apps/sevapremi
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3002:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Admin Dashboard
  admin:
    build:
      context: ./apps/admin
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3004:3000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

  # NGINX Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - sasarjan-web
      - talentexcel
      - growth-app
      - sevapremi
      - admin
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Application Dockerfile
```dockerfile
# apps/web/Dockerfile.prod
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

# Copy built application
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public

# Install production dependencies only
RUN npm install -g pnpm
COPY package*.json ./
RUN pnpm install --production --frozen-lockfile

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 🌐 NGINX Configuration

### Main Configuration
```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Main SaSarjan App
    server {
        listen 80;
        server_name sasarjan.app www.sasarjan.app;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name sasarjan.app www.sasarjan.app;

        ssl_certificate /etc/nginx/ssl/sasarjan.app.crt;
        ssl_certificate_key /etc/nginx/ssl/sasarjan.app.key;

        location / {
            proxy_pass http://sasarjan-web:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://sasarjan-web:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://sasarjan-web:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # TalentExcel App
    server {
        listen 443 ssl http2;
        server_name talentexcel.com www.talentexcel.com;

        ssl_certificate /etc/nginx/ssl/talentexcel.com.crt;
        ssl_certificate_key /etc/nginx/ssl/talentexcel.com.key;

        location / {
            proxy_pass http://talentexcel:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # 10xGrowth App
    server {
        listen 443 ssl http2;
        server_name 10xgrowth.com www.10xgrowth.com;

        ssl_certificate /etc/nginx/ssl/10xgrowth.com.crt;
        ssl_certificate_key /etc/nginx/ssl/10xgrowth.com.key;

        location / {
            proxy_pass http://growth-app:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # SevaPremi App
    server {
        listen 443 ssl http2;
        server_name sevapremi.com www.sevapremi.com;

        ssl_certificate /etc/nginx/ssl/sevapremi.com.crt;
        ssl_certificate_key /etc/nginx/ssl/sevapremi.com.key;

        location / {
            proxy_pass http://sevapremi:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Admin Dashboard
    server {
        listen 443 ssl http2;
        server_name admin.sasarjan.app;

        ssl_certificate /etc/nginx/ssl/admin.sasarjan.app.crt;
        ssl_certificate_key /etc/nginx/ssl/admin.sasarjan.app.key;

        # IP whitelist for admin access
        allow 192.168.1.0/24;
        allow 10.0.0.0/8;
        deny all;

        location / {
            proxy_pass http://admin:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## 🔐 SSL Certificate Setup

### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d sasarjan.app -d www.sasarjan.app
sudo certbot --nginx -d talentexcel.com -d www.talentexcel.com
sudo certbot --nginx -d 10xgrowth.com -d www.10xgrowth.com
sudo certbot --nginx -d sevapremi.com -d www.sevapremi.com
sudo certbot --nginx -d admin.sasarjan.app

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Setup
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Generate self-signed certificates (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/sasarjan.app.key \
  -out nginx/ssl/sasarjan.app.crt \
  -subj "/C=IN/ST=State/L=City/O=SaSarjan/OU=IT/CN=sasarjan.app"
```

---

## 🗄️ Database Setup

### PostgreSQL Configuration
```bash
# Create database initialization script
cat > scripts/init-db.sql << 'EOF'
-- Create databases
CREATE DATABASE sasarjan_main;
CREATE DATABASE sasarjan_talentexcel;
CREATE DATABASE sasarjan_10xgrowth;
CREATE DATABASE sasarjan_sevapremi;
CREATE DATABASE sasarjan_admin;

-- Create users
CREATE USER sasarjan_user WITH PASSWORD 'secure_password';
CREATE USER readonly_user WITH PASSWORD 'readonly_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE sasarjan_main TO sasarjan_user;
GRANT ALL PRIVILEGES ON DATABASE sasarjan_talentexcel TO sasarjan_user;
GRANT ALL PRIVILEGES ON DATABASE sasarjan_10xgrowth TO sasarjan_user;
GRANT ALL PRIVILEGES ON DATABASE sasarjan_sevapremi TO sasarjan_user;
GRANT ALL PRIVILEGES ON DATABASE sasarjan_admin TO sasarjan_user;

-- Enable extensions
\c sasarjan_main;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
EOF
```

### Database Backup Script
```bash
# Create backup script
cat > scripts/backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sasarjan"
mkdir -p $BACKUP_DIR

# Backup all databases
docker exec sasarjan-postgres pg_dumpall -U $POSTGRES_USER > $BACKUP_DIR/full_backup_$DATE.sql

# Backup individual databases
docker exec sasarjan-postgres pg_dump -U $POSTGRES_USER sasarjan_main > $BACKUP_DIR/main_$DATE.sql
docker exec sasarjan-postgres pg_dump -U $POSTGRES_USER sasarjan_talentexcel > $BACKUP_DIR/talentexcel_$DATE.sql

# Compress backups
gzip $BACKUP_DIR/*_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x scripts/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/scripts/backup-db.sh
```

---

## 🚀 Deployment Scripts

### Deployment Script
```bash
# Create deployment script
cat > scripts/deploy.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Stop existing containers
docker-compose -f docker-compose.prod.yml down

# Pull latest code
git pull origin main

# Build new images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 30

# Check health
curl -f http://localhost:3000/api/health || exit 1
curl -f http://localhost:3005/api/health || exit 1
curl -f http://localhost:3003/api/health || exit 1
curl -f http://localhost:3002/api/health || exit 1
curl -f http://localhost:3004/api/health || exit 1

echo "✅ Deployment completed successfully!"
EOF

chmod +x scripts/deploy.sh
```

### Zero-Downtime Deployment
```bash
# Create blue-green deployment script
cat > scripts/deploy-zero-downtime.sh << 'EOF'
#!/bin/bash
set -e

CURRENT_ENV=$(docker-compose -f docker-compose.prod.yml ps -q | head -1)
if [ -z "$CURRENT_ENV" ]; then
    NEW_ENV="blue"
else
    NEW_ENV="green"
fi

echo "🚀 Deploying to $NEW_ENV environment..."

# Build new environment
docker-compose -f docker-compose.$NEW_ENV.yml build --no-cache
docker-compose -f docker-compose.$NEW_ENV.yml up -d

# Wait for health check
sleep 30
curl -f http://localhost:8080/api/health || exit 1

# Switch NGINX to new environment
sed -i "s/blue/green/g" nginx/nginx.conf
docker-compose restart nginx

# Stop old environment
if [ "$NEW_ENV" = "blue" ]; then
    docker-compose -f docker-compose.green.yml down
else
    docker-compose -f docker-compose.blue.yml down
fi

echo "✅ Zero-downtime deployment completed!"
EOF

chmod +x scripts/deploy-zero-downtime.sh
```

---

## 📊 Monitoring Setup

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sasarjan-apps'
    static_configs:
      - targets: ['sasarjan-web:3000', 'talentexcel:3000', 'growth-app:3000', 'sevapremi:3000', 'admin:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:9121']
```

### Grafana Dashboard
```yaml
# monitoring/grafana/dashboards/sasarjan.json
{
  "dashboard": {
    "title": "SaSarjan App Store",
    "panels": [
      {
        "title": "App Response Times",
        "type": "graph",
        "targets": [
          {
            "expr": "http_request_duration_seconds{job=\"sasarjan-apps\"}",
            "legendFormat": "{{app}}"
          }
        ]
      },
      {
        "title": "Error Rates",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{app}} errors"
          }
        ]
      }
    ]
  }
}
```

---

## 🔄 Backup & Recovery

### Automated Backup System
```bash
# Create comprehensive backup script
cat > scripts/full-backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sasarjan"
mkdir -p $BACKUP_DIR

# Database backup
docker exec sasarjan-postgres pg_dumpall -U $POSTGRES_USER > $BACKUP_DIR/db_$DATE.sql

# File system backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  /opt/sasarjan-appstore

# Docker volumes backup
docker run --rm -v sasarjan_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar -czf /backup/postgres_volume_$DATE.tar.gz -C /data .
docker run --rm -v sasarjan_redis_data:/data -v $BACKUP_DIR:/backup alpine tar -czf /backup/redis_volume_$DATE.tar.gz -C /data .

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/ s3://sasarjan-backups/ --recursive

echo "Backup completed: $DATE"
EOF

chmod +x scripts/full-backup.sh
```

### Recovery Script
```bash
# Create recovery script
cat > scripts/recover.sh << 'EOF'
#!/bin/bash
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "🔄 Starting recovery from $BACKUP_FILE..."

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
gunzip -c $BACKUP_FILE | docker exec -i sasarjan-postgres psql -U $POSTGRES_USER

# Restart services
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Recovery completed!"
EOF

chmod +x scripts/recover.sh
```

---

## 🎯 Production Checklist

### Initial Setup
- [ ] Server provisioned with adequate resources
- [ ] Docker and Docker Compose installed
- [ ] SSL certificates configured
- [ ] DNS records configured
- [ ] Environment variables set
- [ ] Database initialized
- [ ] Backup system configured

### Security
- [ ] Firewall configured
- [ ] SSH keys only (no password auth)
- [ ] Regular security updates scheduled
- [ ] Admin access IP whitelisted
- [ ] Rate limiting enabled
- [ ] Security headers configured

### Monitoring
- [ ] Health checks configured
- [ ] Monitoring stack deployed
- [ ] Alerts configured
- [ ] Log rotation enabled
- [ ] Backup monitoring active

### Performance
- [ ] NGINX optimized
- [ ] Database tuned
- [ ] Caching enabled
- [ ] CDN configured
- [ ] Load testing completed

---

## 🚨 Troubleshooting Self-Hosted

### Common Issues
```bash
# Container fails to start
docker logs sasarjan-web

# Database connection issues
docker exec sasarjan-postgres pg_isready -U $POSTGRES_USER

# NGINX configuration issues
docker exec nginx nginx -t

# SSL certificate issues
openssl x509 -in /etc/ssl/certs/sasarjan.app.crt -text -noout
```

### Performance Monitoring
```bash
# Monitor resource usage
docker stats

# Check disk usage
df -h

# Monitor network
netstat -tulpn

# Check logs
tail -f /var/log/nginx/access.log
```

---

**✅ Self-hosted deployment is complete when all services are running healthy and accessible through their respective domains.**