import path from 'path';
import { fileURLToPath } from 'url';
import { generateOrderConfirmationScript, buildFallbackConfirmationScript } from './openaiOrderService.js';
import { generateElevenLabsAudio } from './elevenlabsService.js';
import { makeOrderCall, sendOrderSms } from './twilioAutomationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getPublicBaseUrl = () => (process.env.BACKEND_URL || process.env.PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

export const runOrderAutomation = async ({ order, items = [], seller }) => {
  if (!seller?.order_automation_enabled && process.env.ORDER_AUTOMATION_ENABLED !== 'true') {
    return { skipped: true, message: 'Order automation is disabled' };
  }

  const result = {
    script: '',
    sms: null,
    call: null,
    audio: null,
    errors: [],
  };

  const openaiApiKey = seller?.openai_api_key || process.env.OPENAI_API_KEY;
  const openaiModel = seller?.openai_model || process.env.OPENAI_MODEL;
  const elevenApiKey = seller?.elevenlabs_api_key || process.env.ELEVENLABS_API_KEY;
  const elevenVoiceId = seller?.elevenlabs_voice_id || process.env.ELEVENLABS_VOICE_ID;
  const twilioCredentials = {
    accountSid: seller?.twilio_account_sid,
    authToken: seller?.twilio_auth_token,
    fromNumber: seller?.twilio_from_number,
  };

  try {
    result.script = await generateOrderConfirmationScript({
      order,
      items,
      apiKey: openaiApiKey,
      model: openaiModel,
    });
  } catch (error) {
    result.errors.push(`OpenAI: ${error.message}`);
    result.script = buildFallbackConfirmationScript({ order, items });
  }

  const smsText = result.script.length > 300 ? `${result.script.slice(0, 297)}...` : result.script;
  try {
    result.sms = await sendOrderSms({
      to: order.shipping_phone,
      message: smsText,
      credentials: twilioCredentials,
    });
  } catch (error) {
    result.errors.push(`Twilio SMS: ${error.message}`);
  }

  let audioUrl = '';
  try {
    const audioFileName = `${order.id}.mp3`;
    const outputPath = path.join(__dirname, '..', 'uploads', 'order-calls', audioFileName);
    result.audio = await generateElevenLabsAudio({
      text: result.script,
      apiKey: elevenApiKey,
      voiceId: elevenVoiceId,
      outputPath,
    });
    if (!result.audio?.skipped) {
      audioUrl = `${getPublicBaseUrl()}/uploads/order-calls/${audioFileName}`;
    }
  } catch (error) {
    result.errors.push(`ElevenLabs: ${error.message}`);
  }

  try {
    result.call = await makeOrderCall({
      to: order.shipping_phone,
      script: result.script,
      audioUrl,
      confirmActionUrl: `${getPublicBaseUrl()}/api/orders/${order.id}/voice-confirmation`,
      credentials: twilioCredentials,
    });
  } catch (error) {
    result.errors.push(`Twilio Call: ${error.message}`);
  }

  return result;
};
