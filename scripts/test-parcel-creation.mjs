process.env.STEADFAST_API_URL = 'https://portal.packzy.com/api/v1/create_order';
process.env.STEADFAST_API_KEY = 'ls6thwgklvy5xarpezhxh9pswqv7vwwa';
process.env.STEADFAST_SECRET_KEY = 'yop6zsyqqqlfgvoxr0evnwc0';

const { createSteadfastParcel } = await import('../backend/services/steadfastService.js');

const mockOrder = {
  id: 'TEST-ORDER-001',
  payment_method: 'Cash on Delivery',
  total_price: 1500,
  advance_amount: 0,
  shipping_name: 'Test Customer',
  shipping_phone: '01712345678',
  shipping_address: '123 Test Street, Dhaka',
  shipping_city: 'Dhaka',
  shipping_postal_code: '1200',
};

const mockItems = [
  { name: 'Test Product 1', qty: 2 },
  { name: 'Test Product 2', qty: 1 },
];

console.log('=== Parcel Creation Test ===\n');
console.log('Mock Order:', JSON.stringify(mockOrder, null, 2));
console.log('Items:', JSON.stringify(mockItems, null, 2));

try {
  const result = await createSteadfastParcel({
    order: mockOrder,
    items: mockItems,
  });

  if (result.skipped) {
    console.log('\nSkipped:', result.message);
  } else {
    console.log('\nSteadFast API Response:');
    console.log(JSON.stringify(result, null, 2));
    console.log('\nTracking Code:', result.trackingCode);
    console.log('Status:', result.status);
  }
} catch (error) {
  console.error('\nError:', error.message);
}

console.log('\n=== Webhook Payload Test ===\n');

const trackingPayload = {
  notification_type: 'tracking_update',
  consignment_id: 12345,
  invoice: 'TEST-ORDER-001',
  tracking_message: 'Package arrived at the sorting center.',
  updated_at: '2025-03-02 13:15:00',
};

const deliveryPayload = {
  notification_type: 'delivery_status',
  consignment_id: 12345,
  invoice: 'TEST-ORDER-001',
  cod_amount: 1500.00,
  status: 'Delivered',
  delivery_charge: 100.00,
  tracking_message: 'Your package has been delivered successfully.',
  updated_at: '2025-03-02 12:45:30',
};

console.log('Sample tracking_update payload:', JSON.stringify(trackingPayload, null, 2));
console.log('\nSample delivery_status payload:', JSON.stringify(deliveryPayload, null, 2));
console.log('\nWebhook endpoint: POST /api/orders/courier-webhook');
console.log('The webhook handler will:');
console.log('  1. Look up order by invoice or consignment_id');
console.log('  2. For tracking_update: update courier_status with tracking message');
console.log('  3. For delivery_status + Delivered: mark order as Delivered, collect COD if applicable');
