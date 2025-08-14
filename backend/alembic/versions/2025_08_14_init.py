from alembic import op

revision = '2025_08_14_init'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.execute('''
    CREATE TABLE IF NOT EXISTS cities (
      id   varchar PRIMARY KEY,
      name varchar NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      id bigserial PRIMARY KEY,
      code varchar,
      city_id varchar REFERENCES cities(id),
      total_price numeric(14,2) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      status varchar,
      state varchar
    );
    CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
    CREATE INDEX IF NOT EXISTS idx_orders_city ON orders (city_id);
    CREATE TABLE IF NOT EXISTS order_items (
      id bigserial PRIMARY KEY,
      order_id bigint REFERENCES orders(id) ON DELETE CASCADE,
      sku varchar,
      qty int,
      price numeric(14,2)
    );
    ''')
def downgrade():
    op.execute('''
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS cities;
    ''')
