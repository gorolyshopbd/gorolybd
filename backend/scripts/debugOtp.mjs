import { createAdminClient } from '@insforge/sdk';

const db = createAdminClient({
  baseUrl: 'https://z6zhffa4.ap-southeast.insforge.app',
  apiKey: 'ik_e2f70bf5adc92ce6720b07120514399a'
});

// Same query as sendOTP
const { data: settings, error } = await db.database.from('settings').select('*').limit(1).single();
console.log('Error:', JSON.stringify(error));
console.log('Settings:', JSON.stringify(settings, null, 2));

if (settings) {
  console.log('otp_gateway:', settings.otp_gateway);
  console.log('sas_sms_api_key:', settings.sas_sms_api_key);
  console.log('sas_sms_sender_id:', settings.sas_sms_sender_id);
  console.log('sas_sms_gateway_url:', settings.sas_sms_gateway_url);
  console.log('sas_sms_secret_key:', settings.sas_sms_secret_key);

  const gateway = settings.otp_gateway || 'Simulated';
  console.log('gateway:', gateway);
  console.log('will send via SAS?', gateway !== 'Simulated');
}
