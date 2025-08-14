from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from sqlalchemy import text
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/kaspi")
engine: AsyncEngine = create_async_engine(DATABASE_URL, pool_pre_ping=True)

async def fetch_all(query: str, **params):
    async with engine.connect() as conn:
        res = await conn.execute(text(query), params)
        rows = res.mappings().all()
        return [dict(r) for r in rows]

async def fetch_one(query: str, **params):
    async with engine.connect() as conn:
        res = await conn.execute(text(query), params)
        row = res.mappings().first()
        return dict(row) if row else None
