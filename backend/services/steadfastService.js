const STEADFAST_API_URL = process.env.STEADFAST_API_URL || 'https://portal.packzy.com/api/v1/create_order';
const STEADFAST_API_KEY = process.env.STEADFAST_API_KEY;
const STEADFAST_SECRET_KEY = process.env.STEADFAST_SECRET_KEY;

const normalizePhone = (phone = '') => {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('8801') && digits.length === 13) return digits;
  if (digits.startsWith('01') && digits.length === 11) return `88${digits}`;
  if (digits.startsWith('1') && digits.length === 10) return `880${digits}`;
  return digits || String(phone);
};

const extractTrackingCode = (data) => {
  return (
    data?.consignment?.tracking_code ||
    data?.consignment?.consignment_id ||
    data?.tracking_code ||
    data?.consignment_id ||
    ''
  );
};

export const isSteadfastConfigured = (credentials = {}) => {
  return Boolean(
    (credentials.apiKey && credentials.secretKey) ||
    (STEADFAST_API_KEY && STEADFAST_SECRET_KEY)
  );
};

export const createSteadfastParcel = async ({ order, items = [], credentials = {} }) => {
  const apiKey = credentials.apiKey || STEADFAST_API_KEY;
  const secretKey = credentials.secretKey || STEADFAST_SECRET_KEY;

  if (!isSteadfastConfigured({ apiKey, secretKey })) {
    return { skipped: true, message: 'SteadFast API credentials are not configured' };
  }

  const codAmount = order.payment_method === 'Cash on Delivery'
    ? Number(order.total_price || 0)
    : Math.max(Number(order.total_price || 0) - Number(order.advance_amount || 0), 0);

  const itemSummary = items
    .map((item) => `${item.name} x ${item.qty}`)
    .join(', ')
    .slice(0, 450);

  const payload = {
    invoice: String(order.id),
    recipient_name: order.shipping_name || 'Customer',
    recipient_phone: normalizePhone(order.shipping_phone),
    recipient_address: [order.shipping_address, order.shipping_city, order.shipping_postal_code]
      .filter(Boolean)
      .join(', '),
    cod_amount: codAmount,
    note: itemSummary || `Order ${order.id}`,
  };

  const response = await fetch(STEADFAST_API_URL, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Secret-Key': secretKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.status === 0 || data.status === false || data.status === 'error') {
    const message = data.message || data.error || `SteadFast API failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    data,
    trackingCode: extractTrackingCode(data),
    status: data?.delivery_status || data?.consignment?.status || 'Booked',
  };
};
