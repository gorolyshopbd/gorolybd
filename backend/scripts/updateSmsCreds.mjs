import { createAdminClient } from '@insforge/sdk';

const db = createAdminClient({
  baseUrl: 'https://z6zhffa4.ap-southeast.insforge.app',
  apiKey: 'ik_e2f70bf5adc92ce6720b07120514399a'
});

const { data, error } = await db.database
  .from('settings')
  .update({
    sas_sms_api_key: 'e5fb91d8b3275308',
    sas_sms_sender_id: '8809640911650',
    sas_sms_gateway_url: 'http://sms.sasbulksms.com:3040'
  })
  .eq('id', 'f2a9cc6d-97a0-48ba-9cbf-68cc12c80783');

if (error) {
  console.error('Error updating:', error);
} else {
  console.log('Updated:', JSON.stringify(data));
}

const { data: check } = await db.database
  .from('settings')
  .select('sas_sms_api_key, sas_sms_sender_id, sas_sms_gateway_url')
  .single();
console.log('Current values:', JSON.stringify(check));
