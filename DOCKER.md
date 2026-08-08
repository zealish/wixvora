# Docker Setup Guide

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Configure Environment Variables

The application uses environment variables from `docker-compose.yaml`. You can override them by creating a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit the values (optional for Docker setup)
# The DATABASE_URL is automatically configured in docker-compose.yaml
```

**Important:** For production, change these values in `docker-compose.yaml` or via `.env`:

- `BETTER_AUTH_SECRET` - Use a strong random secret
- SMTP credentials for email functionality

### 2. Build and Start

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

The first startup will automatically:

1. ✅ Start PostgreSQL database
2. ✅ Wait for database to be ready
3. ✅ Run database migrations
4. ✅ Seed initial data
5. ✅ Start Next.js application

### 3. Access the Application

- **Application:** http://localhost:3000
- **PostgreSQL:** localhost:5432
  - Database: `wixvora`
  - User: `wixvora_user`
  - Password: `wixvora_pass`

## Docker Commands

```bash
# View logs
docker-compose logs -f

# View app logs only
docker-compose logs -f app

# View database logs only
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

## Database Management

### Access PostgreSQL Shell

```bash
docker-compose exec postgres psql -U wixvora_user -d wixvora
```

### Run Migrations Manually

```bash
docker-compose exec app pnpm run db:migrate
```

### Seed Database Manually

```bash
docker-compose exec app pnpm run db:seed
```

### Drizzle Studio (Database GUI)

```bash
docker-compose exec app pnpm run db:studio
```

Then access at http://localhost:4983

## Troubleshooting

### Database Connection Issues

If the app fails to connect to the database:

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check database health
docker-compose exec postgres pg_isready -U wixvora_user

# View database logs
docker-compose logs postgres
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
```

### Port Conflicts

If ports 3000 or 5432 are already in use, modify `docker-compose.yaml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432" # Change host port

  app:
    ports:
      - "3001:3000" # Change host port
```

## Production Deployment

For production deployment:

1. **Update secrets** in `docker-compose.yaml`:

   ```yaml
   environment:
     BETTER_AUTH_SECRET: "your-strong-random-secret-here"
     BETTER_AUTH_URL: "https://yourdomain.com"
   ```

2. **Use external PostgreSQL** (recommended):
   - Remove the `postgres` service from `docker-compose.yaml`
   - Set `DATABASE_URL` to your production database

3. **Enable SSL/TLS** using a reverse proxy (nginx, Traefik, Caddy)

4. **Set resource limits**:
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: "1"
             memory: 1G
   ```

## Architecture

```
┌─────────────────────┐
│   Next.js App       │
│   (Port 3000)       │
│                     │
│ - Auto migrations   │
│ - Auto seeding      │
│ - Health checks     │
└──────────┬──────────┘
           │
           │ DATABASE_URL
           │
┌──────────▼──────────┐
│   PostgreSQL 16     │
│   (Port 5432)       │
│                     │
│ - Persistent volume │
│ - Health checks     │
└─────────────────────┘
```

## File Structure

```
.
├── Dockerfile              # Multi-stage production build
├── docker-compose.yaml     # Service orchestration
├── docker-entrypoint.sh    # Startup script (migrations + seed)
├── .dockerignore          # Build context exclusions
└── DOCKER.md              # This file
```
