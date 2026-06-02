ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS notice_bar_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notice_bar_text TEXT DEFAULT 'Summer Sale - All Swim Suits OFF 50%! Free delivery on orders over ৳999.',
  ADD COLUMN IF NOT EXISTS notice_bar_bg_color TEXT DEFAULT '#6F1BE4',
  ADD COLUMN IF NOT EXISTS notice_bar_text_color TEXT DEFAULT '#FFFFFF';
