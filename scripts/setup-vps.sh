#!/bin/bash
set -e

echo "=== Updating system ==="
apt-get update && apt-get upgrade -y

echo "=== Installing Docker ==="
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
fi

echo "=== Installing Docker Compose ===""
if ! command -v docker compose &> /dev/null; then
    apt-get install -y docker-compose-plugin
fi

echo "=== Creating project directory ==="
mkdir -p /opt/shopio

echo "=== VPS setup complete! ==="
echo "Next steps:"
echo "  1. Copy project to VPS: scp -r /path/to/project root@2.25.182.96:/opt/shopio/"
echo "  2. Run: cd /opt/shopio && docker compose up -d --build"
echo "  3. Run SSL setup: bash scripts/setup-ssl.sh"
