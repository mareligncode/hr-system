@echo off
echo Stopping containers...
docker compose down

echo Building backend with new dependencies...
docker compose build backend --no-cache

echo Starting containers...
docker compose up -d

echo Checking backend logs...
docker logs hr-system-dev-backend-1 --tail 20

echo Done!