#!/bin/bash
set -euo pipefail

# Verify Docker BuildKit is enabled
export DOCKER_BUILDKIT=1

# Verify .env.production exists
if [ ! -f .env.production ]; then
  echo "Error: .env.production file not found"
  exit 1
fi

# Create temporary API URL secret file
echo "https://dashboard-backend.mrbeas.net/api/" > /tmp/api_url.secret

# Build with secrets
docker build -t millionmulugeta/frontend:latest \
  --secret id=firebase_env,src=.env.production \
  --secret id=api_url,src=/tmp/api_url.secret \
  -f Dockerfile.prod .

# Clean up temporary files
rm /tmp/api_url.secret

echo "Production image built successfully: millionmulugeta/frontend:latest"