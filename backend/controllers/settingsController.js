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
        sslcommerz_mode: 'Sandbox',
        sslcommerz_enabled: true,
        sslcommerz_store_id: 'shopio_ssl_mock',
        cod_enabled: true,
        facebook_pixel_id: '',
        ga4_measurement_id: '',
        site_title: 'Shopio - MERN E-Commerce',
        favicon_url: '',
        header_logo: '',
        footer_logo: '',
        top_bar_helpline: '8801234567890',
        top_bar_store_link: 'https://maps.google.com',
        top_bar_play_store_link: 'https://play.google.com',
        top_bar_app_store_link: 'https://apps.apple.com',
        withdraw_min_amount: 500
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
      sslcommerzMode: settings.sslcommerz_mode,
      sslcommerzEnabled: settings.sslcommerz_enabled,
      sslcommerzStoreId: settings.sslcommerz_store_id,
      codEnabled: settings.cod_enabled,
      facebookPixelId: settings.facebook_pixel_id,
      ga4MeasurementId: settings.ga4_measurement_id,
      siteTitle: settings.site_title,
      faviconUrl: settings.favicon_url,
      headerLogo: settings.header_logo,
      footerLogo: settings.footer_logo,
      topBarHelpline: settings.top_bar_helpline,
      topBarStoreLink: settings.top_bar_store_link,
      topBarPlayStoreLink: settings.top_bar_play_store_link,
      topBarAppStoreLink: settings.top_bar_app_store_link,
      withdraw_min_amount: settings.withdraw_min_amount,
      twilioSid: settings.twilio_sid || '',
      twilioAuthToken: settings.twilio_auth_token || '',
      twilioPhoneNumber: settings.twilio_phone_number || '',
      greenwebApiKey: settings.greenweb_api_key || '',
      greenwebSenderId: settings.greenweb_sender_id || ''
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
      sslcommerz_mode: req.body.sslcommerzMode,
      sslcommerz_enabled: req.body.sslcommerzEnabled,
      sslcommerz_store_id: req.body.sslcommerzStoreId,
      cod_enabled: req.body.codEnabled,
      facebook_pixel_id: req.body.facebookPixelId,
      ga4_measurement_id: req.body.ga4MeasurementId,
      site_title: req.body.siteTitle,
      favicon_url: req.body.faviconUrl,
      header_logo: req.body.headerLogo,
      footer_logo: req.body.footerLogo,
      top_bar_helpline: req.body.topBarHelpline,
      top_bar_store_link: req.body.topBarStoreLink,
      top_bar_play_store_link: req.body.topBarPlayStoreLink,
      top_bar_app_store_link: req.body.topBarAppStoreLink,
      withdraw_min_amount: req.body.withdraw_min_amount,
      twilio_sid: req.body.twilioSid,
      twilio_auth_token: req.body.twilioAuthToken,
      twilio_phone_number: req.body.twilioPhoneNumber,
      greenweb_api_key: req.body.greenwebApiKey,
      greenweb_sender_id: req.body.greenwebSenderId
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
