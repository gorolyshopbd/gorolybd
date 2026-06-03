ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS flash_sale_gradient_start TEXT DEFAULT '#052e2b',
  ADD COLUMN IF NOT EXISTS flash_sale_gradient_mid TEXT DEFAULT '#047857',
  ADD COLUMN IF NOT EXISTS flash_sale_gradient_end TEXT DEFAULT '#00B894',
  ADD COLUMN IF NOT EXISTS flash_sale_radial_color TEXT DEFAULT '#5eead4',
  ADD COLUMN IF NOT EXISTS flash_sale_accent_color TEXT DEFAULT '#00B894';
