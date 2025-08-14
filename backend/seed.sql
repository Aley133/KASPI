INSERT INTO cities(id, name) VALUES
  ('750000000','Алматы') ON CONFLICT (id) DO NOTHING,
  ('710000000','Астана') ON CONFLICT (id) DO NOTHING,
  ('551000000','Шымкент') ON CONFLICT (id) DO NOTHING;

-- Demo orders over ~60 days
INSERT INTO orders (code, city_id, total_price, created_at)
SELECT 
  'ORD-'||g::text,
  (ARRAY['750000000','710000000','551000000'])[1 + (random()*2)::int],
  (5000 + random()*150000)::numeric(14,2),
  (now() - ((60 - g) * interval '1 day'))
FROM generate_series(1, 600) g;
