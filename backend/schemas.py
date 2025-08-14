from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Summary(BaseModel):
    gmv: float = 0
    orders_count: int = 0
    aov: float = 0

class SeriesPoint(BaseModel):
    bucket: datetime
    gmv: float
    orders_count: int

class TopCity(BaseModel):
    city: Optional[str]
    gmv: float
    orders_count: int
