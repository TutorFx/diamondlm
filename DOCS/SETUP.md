# Setup & Installation

Follow these steps to set up **Diamond LLM** in your local environment.

## 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v20+)
- **Bun** (latest)
- **Docker** & **Docker Compose**
- **Git**

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/TutorFx/diamondlm.git

# Enter project directory
cd diamond-llm

# Install dependencies
bun install
```

## ⚙️ Configuration

Copy the example configuration or create a `.env` file in the root directory.

```bash
cp .env.example .env
```

**Required Variables**:

```env
# Database
POSTGRES_USER="testuser"
POSTGRES_PASSWORD="testpass"
POSTGRES_DB="dbname"
POSTGRES_PORT=9293
POSTGRES_HOSTNAME="127.0.0.1"

# Redis (BullMQ)
REDIS_PASSWORD=secret
REDIS_PORT=6379

# AI Providers
OLLAMA_BASE_URL="http://127.0.0.1:11434/api"
KOKORO_API_URL="http://localhost:8880"

# Security
NUXT_SESSION_PASSWORD="password-with-at-least-32-characters"
```

## ⚡ Initialization

### 1. Start Infrastructure

Launch PostgreSQL (with `pgvector`) and Redis using Docker Compose.

```bash
docker-compose up -d
```

### 2. Database Migration

Apply the specific schema to your database.

```bash
bun run db:generate
bun run db:migrate
```

### 3. Database Seeding

Populate the database with initial users, groups, and guides.

> [!WARNING]
> **Data Loss:** This command wipes all existing data in the database before reseeding.

```bash
bun run seed
```

> See **[Seeding Documentation](./SEEDING.md)** for `admins.json` usage.

## 🚀 Development

Start the development server.

```bash
bun run dev
```

Visit `http://localhost:3000` to start using Diamond LLM.

## 🏗️ Production Build

To build the application for production:

```bash
bun run build
```

Then run the built server:

```bash
bun run .output/server/index.mjs
```
