import fs from 'fs/promises';
import path from 'path';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';

export const generateElevenLabsAudio = async ({ text, apiKey, voiceId, outputPath }) => {
  const key = apiKey || process.env.ELEVENLABS_API_KEY;
  if (!key) {
    return { skipped: true, message: 'ElevenLabs API key is not configured' };
  }

  const response = await fetch(`${ELEVENLABS_API_BASE}/text-to-speech/${voiceId || DEFAULT_VOICE_ID}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2',
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `ElevenLabs request failed with status ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buffer);

  return { outputPath };
};
