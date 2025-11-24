#!/bin/bash

# This script detects the correct docker compose command and sets DOCKER_COMPOSE_CMD

if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "Error: Neither 'docker compose' nor 'docker-compose' command found." >&2
    exit 1
fi
