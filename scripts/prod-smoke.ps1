$ErrorActionPreference = "Stop"

docker compose -f compose.yaml -f compose.prod.yaml up --build -d @args
docker compose -f compose.yaml -f compose.prod.yaml ps
