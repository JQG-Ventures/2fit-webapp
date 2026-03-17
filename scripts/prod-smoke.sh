#!/usr/bin/env bash

set -euo pipefail

docker compose -f compose.yaml -f compose.prod.yaml up --build -d "$@"
docker compose -f compose.yaml -f compose.prod.yaml ps
