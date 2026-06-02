import twilio from 'twilio';

const normalizePhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('8801') && digits.length === 13) return `+${digits}`;
  if (digits.startsWith('01') && digits.length === 11) return `+88${digits}`;
  if (digits.startsWith('1') && digits.length === 10) return `+880${digits}`;
  if (digits.startsWith('+')) return digits;
  return digits ? `+${digits}` : '';
};

const escapeXml = (text = '') => String(text)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const getTwilioConfig = (credentials = {}) => ({
  accountSid: credentials.accountSid || process.env.TWILIO_ACCOUNT_SID,
  authToken: credentials.authToken || process.env.TWILIO_AUTH_TOKEN,
  fromNumber: credentials.fromNumber || process.env.TWILIO_FROM_NUMBER,
});

export const sendOrderSms = async ({ to, message, credentials = {} }) => {
  const config = getTwilioConfig(credentials);
  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    return { skipped: true, message: 'Twilio SMS credentials are not configured' };
  }

  const client = twilio(config.accountSid, config.authToken);
  const result = await client.messages.create({
    body: message,
    from: config.fromNumber,
    to: normalizePhone(to),
  });

  return { sid: result.sid, status: result.status };
};

export const makeOrderCall = async ({ to, script, audioUrl, confirmActionUrl, credentials = {} }) => {
  const config = getTwilioConfig(credentials);
  if (!config.accountSid || !config.authToken || !config.fromNumber) {
    return { skipped: true, message: 'Twilio voice credentials are not configured' };
  }

  const prompt = ' Press 1 to confirm this order. Press 2 to cancel this order.';
  const promptTwiml = audioUrl
    ? `<Play>${escapeXml(audioUrl)}</Play><Say voice="alice">${escapeXml(prompt)}</Say>`
    : `<Say voice="alice">${escapeXml(`${script}${prompt}`)}</Say>`;
  const twiml = confirmActionUrl
    ? `<Response><Gather numDigits="1" timeout="8" action="${escapeXml(confirmActionUrl)}" method="POST">${promptTwiml}</Gather><Say voice="alice">We did not receive your confirmation. Our support team may contact you again. Thank you.</Say></Response>`
    : `<Response>${promptTwiml}</Response>`;

  const client = twilio(config.accountSid, config.authToken);
  const result = await client.calls.create({
    from: config.fromNumber,
    to: normalizePhone(to),
    twiml,
  });

  return { sid: result.sid, status: result.status };
};
