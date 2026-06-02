ALTER TABLE products
  ADD COLUMN IF NOT EXISTS shipping_days INT DEFAULT 2;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS cash_on_delivery BOOLEAN DEFAULT true;

UPDATE products
SET shipping_days = 2
WHERE shipping_days IS NULL;

UPDATE products
SET cash_on_delivery = true
WHERE cash_on_delivery IS NULL;
