ALTER TABLE users
  ADD COLUMN IF NOT EXISTS steadfast_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS steadfast_secret_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS steadfast_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS order_automation_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS twilio_account_sid TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS twilio_auth_token TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS twilio_from_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS elevenlabs_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS elevenlabs_voice_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS openai_api_key TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS openai_model TEXT DEFAULT 'gpt-5.2';
