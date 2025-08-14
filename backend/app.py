from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
from typing import List, Optional
from db import fetch_all, fetch_one
from schemas import Summary, SeriesPoint, TopCity
import queries as q

app = FastAPI(title="Kaspi DMP — Analytics API", openapi_url="/api/openapi.json", docs_url="/api/docs")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _parse_range(date_from: Optional[str], date_to: Optional[str]):
    # ISO strings expected (UTC). If absent, default 30 days back until now.
    if date_to is None:
        date_to = datetime.utcnow().isoformat()
    if date_from is None:
        date_from = (datetime.utcnow() - timedelta(days=30)).isoformat()
    return datetime.fromisoformat(date_from), datetime.fromisoformat(date_to)

@app.get("/api/analytics/summary", response_model=Summary)
async def summary(date_from: Optional[str] = None, date_to: Optional[str] = None):
    f, t = _parse_range(date_from, date_to)
    row = await fetch_one(q.SUMMARY, from_ts=f, to_ts=t)
    return Summary(**row)

@app.get("/api/analytics/timeseries", response_model=List[SeriesPoint])
async def timeseries(
    granularity: str = Query("day", pattern="^(day|month)$"),
    tz: str = "Asia/Almaty",
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
):
    f, t = _parse_range(date_from, date_to)
    rows = await fetch_all(q.TIMESERIES, from_ts=f, to_ts=t, tz=tz, granularity=granularity)
    # pydantic will coerce ISO datetime strings if needed
    return [SeriesPoint(**r) for r in rows]

@app.get("/api/analytics/top-cities", response_model=List[TopCity])
async def top_cities(limit: int = 10, date_from: Optional[str] = None, date_to: Optional[str] = None):
    f, t = _parse_range(date_from, date_to)
    rows = await fetch_all(q.TOP_CITIES, from_ts=f, to_ts=t, limit=limit)
    return [TopCity(**r) for r in rows]

@app.get("/api/health")
async def health():
    return {"ok": True}
