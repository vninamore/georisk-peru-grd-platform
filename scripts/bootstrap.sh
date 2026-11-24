#!/usr/bin/env sh
set -eu

if [ ! -f .env ]; then
  cp .env.example .env
fi

python scripts/generate_sample_data.py
docker compose up --build
