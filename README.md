# Kaspi DMP — Starter

Готовая структура для деплоя **FastAPI + React**: backend на Fly.io, фронт на Fly.io (Nginx), БД — Neon/Fly PG.

## Быстрый старт (локально)
```bash
docker compose -f docker-compose.dev.yml up --build
```
API: http://localhost:8787/api  
Фронт (если соберете отдельно): http://localhost:5173

## Деплой (Fly + GitHub Actions)
1. `fly auth login`
2. Добавьте секрет `FLY_API_TOKEN` в GitHub → Settings → Secrets → Actions
3. Создайте БД (Neon/Fly) и установите секрет Fly:
   ```bash
   flyctl secrets set DATABASE_URL="postgresql+asyncpg://..." -c fly.backend.toml
   ```
4. Пушьте в `main` — Actions задеплоят backend и frontend.
5. Выполните миграции:
   ```bash
   flyctl ssh console -C "bash -lc 'cd /app && alembic upgrade head'" -a kaspi-dmp-backend
   ```

## Структура
- `backend/` — FastAPI (аналитика: KPI, таймсерии, топ‑города)
- `frontend/` — React + Vite (страница «Аналитика»)
- `.github/workflows/` — CI/CD для Fly
- `fly.backend.toml`, `fly.frontend.toml` — конфиги приложений Fly
```
