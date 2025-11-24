#!/bin/bash
set -e
cd "$(dirname "$0")"

# Source the .env.prod file to load environment variables
if [ -f ../.env.prod ]; then
    export $(grep -v '^#' ../.env.prod | xargs)
fi

# Source the script that detects the docker compose command
. ./utils/detect_docker_compose.sh

# Start database
echo "Starting database..."
$DOCKER_COMPOSE_CMD -f ../docker-compose.prod.yml up -d

echo "Waiting for database on $POSTGRES_HOSTNAME:$POSTGRES_PORT..."

# Instala o netcat se não estiver presente e depois verifica a conexão com o banco de dados
if ! command -v nc &> /dev/null; then
    apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*
fi

while ! nc -z $POSTGRES_HOSTNAME $POSTGRES_PORT; do
    echo "Database is unavailable - sleeping"
    sleep 1
done

# Run migrations
echo "Running database migrations..."
cd .. # Go to the project root to run bun commands
bun db:migrate

# Run seed
echo "Running database seed..."
bun run scripts/seed.ts

# Build the application for production
echo "Building the application for production..."
bun run build:prod

cd scripts # Go back to the scripts directory

# Stop any running production server
echo "Stopping previous production server if it exists..."
if [ -f ../.pid ]; then
    kill $(cat ../.pid)
    rm ../.pid
fi

# Start the application in the background
echo "Starting application in production mode..."
nohup bun --env-file=../.env.prod ../.output/server/index.mjs -o &> ../app.log &
echo $! > ../.pid

echo "Application started. Log available in app.log"
echo "PID: $(cat ../.pid)"
