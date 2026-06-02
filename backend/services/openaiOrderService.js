const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.2';

const extractOutputText = (data) => {
  if (data?.output_text) return data.output_text;
  const textChunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.text) textChunks.push(content.text);
    }
  }
  return textChunks.join('\n').trim();
};

export const buildFallbackConfirmationScript = ({ order, items = [] }) => {
  const names = items.map((item) => `${item.name} ${item.qty} piece`).join(', ');
  return `Hello ${order.shipping_name || 'customer'}, this is Goroly Shop. Your order ${String(order.id).slice(0, 8)} for ${names || 'your product'} has been confirmed. Total amount is ${Number(order.total_price || 0)} taka. Our courier partner will contact you soon. Thank you.`;
};

export const generateOrderConfirmationScript = async ({ order, items = [], apiKey, model }) => {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    return buildFallbackConfirmationScript({ order, items });
  }

  const prompt = [
    'Write a short customer phone-call confirmation script for a Bangladesh ecommerce order.',
    'Tone: polite, concise, natural, Bengali-English friendly but write in simple English.',
    'Do not ask for private information. Mention order confirmation, total amount, and courier follow-up.',
    `Customer: ${order.shipping_name || 'Customer'}`,
    `Phone: ${order.shipping_phone || ''}`,
    `Order ID: ${order.id}`,
    `Total: ${order.total_price || 0} BDT`,
    `Items: ${items.map((item) => `${item.name} x ${item.qty}`).join(', ') || 'Order items'}`,
  ].join('\n');

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      input: prompt,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `OpenAI request failed with status ${response.status}`);
  }

  return extractOutputText(data) || buildFallbackConfirmationScript({ order, items });
};
