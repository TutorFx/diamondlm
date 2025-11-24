#!/bin/bash
set -e

echo "Running database migrations..."
bun db:migrate

echo "Running database seed..."
bun run scripts/seed.ts

echo "Building the application..."
bun run build

echo "Starting the application..."
bun run preview
