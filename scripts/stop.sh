#!/bin/bash
set -e

# Source the script that detects the docker compose command
. ./scripts/utils/detect_docker_compose.sh

echo "Stopping production server..."
sh ./scripts/utils/kill_port.sh 3000

echo "Stopping database..."
$DOCKER_COMPOSE_CMD -f ../docker-compose.prod.yml down
