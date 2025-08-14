SUMMARY = """
WITH base AS (
  SELECT * FROM orders WHERE created_at >= :from_ts AND created_at < :to_ts
)
SELECT COALESCE(SUM(total_price),0) AS gmv,
       COUNT(*) AS orders_count,
       CASE WHEN COUNT(*)>0 THEN SUM(total_price)/COUNT(*) ELSE 0 END AS aov
FROM base;
"""


TIMESERIES = """
WITH base AS (
  SELECT (created_at AT TIME ZONE :tz) AS local_ts, total_price
  FROM orders
  WHERE created_at >= :from_ts AND created_at < :to_ts
)
SELECT CASE WHEN :granularity = 'month'
            THEN date_trunc('month', local_ts)
            ELSE date_trunc('day',   local_ts)
       END AS bucket,
       SUM(total_price) AS gmv,
       COUNT(*) AS orders_count
FROM base
GROUP BY 1
ORDER BY 1;
"""


TOP_CITIES = """
WITH base AS (
  SELECT city_id, total_price
  FROM orders
  WHERE created_at >= :from_ts AND created_at < :to_ts
)
SELECT c.name AS city, SUM(b.total_price) AS gmv, COUNT(*) AS orders_count
FROM base b
LEFT JOIN cities c ON c.id = b.city_id
GROUP BY c.name
ORDER BY gmv DESC
LIMIT :limit;
"""
