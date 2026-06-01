import { db } from '../config/db.js';

export const getSettings = async (req, res) => {
  try {
    // We assume there's always one row with id 1
    let { data: settings, error } = await db.database.from('settings').select('*').limit(1).single();

    if (!settings) {
      // Default settings if empty
      const defaultSettings = {
        otp_gateway: 'Simulated',
        otp_length: 6,
        otp_expiry: 5,
        checkout_otp_enabled: true,
        bkash_mode: 'Sandbox',
        bkash_enabled: true,
        bkash_merchant_number: '01700000000',
        nagad_mode: 'Sandbox',
        nagad_enabled: true,
        nagad_merchant_id: 'NAGAD12345',
        rupantor_pay_mode: 'Sandbox',
        rupantor_pay_enabled: true,
        rupantor_pay_store_id: '',
        rupantor_pay_signature_key: '',
        sslcommerz_mode: 'Sandbox',
        sslcommerz_enabled: true,
        sslcommerz_store_id: 'shopio_ssl_mock',
        cod_enabled: true,
        facebook_pixel_id: '',
        facebook_access_token: '',
        ga4_measurement_id: '',
        site_title: 'Shopio - MERN E-Commerce',
        favicon_url: '',
        header_logo: '',
        footer_logo: '',
        top_bar_helpline: '8801234567890',
        top_bar_store_link: 'https://maps.google.com',
        top_bar_play_store_link: 'https://play.google.com',
        top_bar_app_store_link: 'https://apps.apple.com',
        withdraw_min_amount: 500,
        // SAS Bulk SMS gateway configuration fields
        sas_sms_gateway_url: 'http://sms.sasbulksms.com:3040/',
        sas_sms_api_key: 'e5fb91d8b3275308',
        sas_sms_secret_key: 'bed1c287',
        sas_sms_sender_id: '8809640911650'
      };
      const { data: newSettings } = await db.database.from('settings').insert(defaultSettings).select().single();
      settings = newSettings;
    }

    const formatted = {
      ...settings,
      otpGateway: settings.otp_gateway,
      otpLength: settings.otp_length,
      otpExpiry: settings.otp_expiry,
      checkoutOtpEnabled: settings.checkout_otp_enabled !== false,
      bkashMode: settings.bkash_mode,
      bkashEnabled: settings.bkash_enabled,
      bkashMerchantNumber: settings.bkash_merchant_number,
      nagadMode: settings.nagad_mode,
      nagadEnabled: settings.nagad_enabled,
      nagadMerchantId: settings.nagad_merchant_id,
      rupantorPayMode: settings.rupantor_pay_mode,
      rupantorPayEnabled: settings.rupantor_pay_enabled,
      rupantorPayStoreId: settings.rupantor_pay_store_id,
      rupantorPaySignatureKey: settings.rupantor_pay_signature_key,
      sslcommerzMode: settings.sslcommerz_mode,
      sslcommerzEnabled: settings.sslcommerz_enabled,
      sslcommerzStoreId: settings.sslcommerz_store_id,
      codEnabled: settings.cod_enabled,
      facebookPixelId: settings.facebook_pixel_id,
      facebookAccessToken: settings.facebook_access_token,
      ga4MeasurementId: settings.ga4_measurement_id,
      siteTitle: settings.site_title,
      faviconUrl: settings.favicon_url,
      headerLogo: settings.header_logo,
      footerLogo: settings.footer_logo,
      footerDescription: settings.footer_description,
      topBarHelpline: settings.top_bar_helpline,
      topBarStoreLink: settings.top_bar_store_link,
      topBarPlayStoreLink: settings.top_bar_play_store_link,
      topBarAppStoreLink: settings.top_bar_app_store_link,
      withdraw_min_amount: settings.withdraw_min_amount,
      twilioSid: settings.twilio_sid || '',
      twilioAuthToken: settings.twilio_auth_token || '',
      twilioPhoneNumber: settings.twilio_phone_number || '',
      greenwebApiKey: settings.greenweb_api_key || '',
      greenwebSenderId: settings.greenweb_sender_id || '',
      customSmsApiUrl: settings.custom_sms_api_url || '',
      // SAS Bulk SMS gateway configuration fields
      sasSmsGatewayUrl: settings.sas_sms_gateway_url || '',
      sasSmsApiKey: settings.sas_sms_api_key || '',
      sasSmsSecretKey: settings.sas_sms_secret_key || '',
      sasSmsSenderId: settings.sas_sms_sender_id || ''
    };

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updateData = {
      otp_gateway: req.body.otpGateway,
      otp_length: req.body.otpLength,
      otp_expiry: req.body.otpExpiry,
      checkout_otp_enabled: req.body.checkoutOtpEnabled !== undefined ? req.body.checkoutOtpEnabled : true,
      bkash_mode: req.body.bkashMode,
      bkash_enabled: req.body.bkashEnabled,
      bkash_merchant_number: req.body.bkashMerchantNumber,
      nagad_mode: req.body.nagadMode,
      nagad_enabled: req.body.nagadEnabled,
      nagad_merchant_id: req.body.nagadMerchantId,
      rupantor_pay_mode: req.body.rupantorPayMode,
      rupantor_pay_enabled: req.body.rupantorPayEnabled,
      rupantor_pay_store_id: req.body.rupantorPayStoreId,
      rupantor_pay_signature_key: req.body.rupantorPaySignatureKey,
      sslcommerz_mode: req.body.sslcommerzMode,
      sslcommerz_enabled: req.body.sslcommerzEnabled,
      sslcommerz_store_id: req.body.sslcommerzStoreId,
      cod_enabled: req.body.codEnabled,
      facebook_pixel_id: req.body.facebookPixelId,
      facebook_access_token: req.body.facebookAccessToken,
      ga4_measurement_id: req.body.ga4MeasurementId,
      site_title: req.body.siteTitle,
      favicon_url: req.body.faviconUrl,
      header_logo: req.body.headerLogo,
      footer_logo: req.body.footerLogo,
      footer_description: req.body.footerDescription,
      top_bar_helpline: req.body.topBarHelpline,
      top_bar_store_link: req.body.topBarStoreLink,
      top_bar_play_store_link: req.body.topBarPlayStoreLink,
      top_bar_app_store_link: req.body.topBarAppStoreLink,
      withdraw_min_amount: req.body.withdraw_min_amount,
      twilio_sid: req.body.twilioSid,
      twilio_auth_token: req.body.twilioAuthToken,
      twilio_phone_number: req.body.twilioPhoneNumber,
      greenweb_api_key: req.body.greenwebApiKey,
      greenweb_sender_id: req.body.greenwebSenderId,
      custom_sms_api_url: req.body.customSmsApiUrl,
      sas_sms_gateway_url: req.body.sasSmsGatewayUrl,
      sas_sms_api_key: req.body.sasSmsApiKey,
      sas_sms_secret_key: req.body.sasSmsSecretKey,
      sas_sms_sender_id: req.body.sasSmsSenderId
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: settings, error } = await db.database.from('settings').select('id').limit(1).single();

    if (settings) {
      await db.database.from('settings').update(updateData).eq('id', settings.id);
    } else {
      await db.database.from('settings').insert(updateData);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const testFacebookPixel = async (req, res) => {
  try {
    const pixelId = req.body.pixelId?.trim();
    const accessToken = req.body.accessToken?.trim();

    if (!pixelId || !accessToken) {
      return res.status(400).json({ success: false, message: 'Pixel ID and Access Token are required.' });
    }
    
    // Test connection by sending a minimal test event to the Conversions API
    const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name: 'TestEvent',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system',
          user_data: {
            client_user_agent: 'TestAgent/1.0'
          }
        }]
      })
    });
    const data = await response.json();

    if (data.error) {
      let errorMsg = data.error.message || 'Invalid Facebook Pixel configuration.';
      if (errorMsg.includes('does not exist')) {
        errorMsg += ' (Make sure the Pixel ID is correct and the Token has permissions).';
      }
      // Return success: true so the frontend saves the settings, but show the error as a warning
      return res.json({ success: true, message: 'Settings saved! Note: Facebook API test failed with: ' + errorMsg });
    }

    res.json({ success: true, message: 'Connected successfully to Facebook Pixel.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
