ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS google_tag_manager_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS google_tag_manager_enabled BOOLEAN DEFAULT false;
