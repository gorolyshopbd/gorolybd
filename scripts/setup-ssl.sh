#!/bin/bash
# Run this on the VPS after the domain (gorolyshop.com) points to the server IP
# Usage: bash scripts/setup-ssl.sh your@email.com

set -e

DOMAIN="gorolyshop.com"
EMAIL="${1:-admin@${DOMAIN}}"

echo "=== Installing certbot ==="
apt-get update && apt-get install -y certbot

echo "=== Stopping nginx container to free port 80 ==="
docker compose stop nginx

echo "=== Obtaining SSL certificate ==="
certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive

echo "=== Copying certificates to nginx/ssl ==="
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/
chmod 644 nginx/ssl/*.pem

echo "=== Switching nginx to SSL config ==="
cp nginx/nginx-ssl.conf nginx/nginx.conf

echo "=== Restarting nginx ==="
docker compose up -d nginx

echo "=== Setting up auto-renewal ==="
echo "0 3 * * * root certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $(pwd)/nginx/ssl/ && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $(pwd)/nginx/ssl/ && docker compose exec nginx nginx -s reload" > /etc/cron.d/certbot-renew

echo "=== SSL setup complete! ==="
