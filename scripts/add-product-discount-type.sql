ALTER TABLE products
  ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'percent';

ALTER TABLE products
  ALTER COLUMN discount_percent TYPE NUMERIC(10,2);

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_discount_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_discount_type_check
  CHECK (discount_type IN ('percent', 'flat'));

UPDATE products
SET discount_type = 'percent'
WHERE discount_type IS NULL;
