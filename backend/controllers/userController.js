import { db } from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import { saveOTP, verifyOTP as checkOTP } from '../config/otpStore.js';
import bcrypt from 'bcryptjs';
import twilio from 'twilio';
import fs from 'fs';
import csv from 'csv-parser';
import { sendEmail } from '../utils/sendEmail.js';

const resetTokens = new Map();

const ALL_PERMISSIONS = ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings', 'users'];

const ROLE_PERMISSIONS = {
  superadmin: ALL_PERMISSIONS,
  admin: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat', 'settings'],
  manager: ['orders', 'products', 'categories', 'brands', 'coupons', 'shipping', 'pages', 'offers', 'banners', 'chat'],
  moderator: ['orders', 'chat', 'products'],
  seller: ['products', 'orders', 'chat'],
  customer: [],
};

function hasAdminAccess(user) {
  if (!user) return false;
  if (user.is_admin) return true;
  if (user.role && user.role !== 'customer') return true;
  return false;
}

function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

function sanitizeUser(user) {
  const {
    password_hash,
    steadfast_secret_key,
    steadfast_api_key,
    twilio_auth_token,
    elevenlabs_api_key,
    openai_api_key,
    ...rest
  } = user;
  return { 
    ...rest, 
    _id: rest.id,
    isAdmin: rest.is_admin,
    hasSteadfastIntegration: Boolean(rest.steadfast_enabled && steadfast_api_key && steadfast_secret_key),
    hasOrderAutomationIntegration: Boolean(
      rest.order_automation_enabled &&
      rest.twilio_account_sid &&
      twilio_auth_token &&
      rest.twilio_from_number
    ),
    hasElevenLabsIntegration: Boolean(elevenlabs_api_key && rest.elevenlabs_voice_id),
    hasOpenAIIntegration: Boolean(openai_api_key),
    permissions: rest.permissions || getRolePermissions(rest.role) 
  };
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: user, error } = await db.database.from('users').select('*').eq('email', email).single();
    console.log('Login attempt:', email, user, error);
    
    if (user && await bcrypt.compare(password, user.password_hash)) {
      if (user.is_banned) {
        return res.status(403).json({ message: 'Your account has been banned. Contact support.' });
      }
      if (req.body.accountType) {
        if (req.body.accountType === 'seller' && user.role === 'customer' && !user.is_admin) {
          return res.status(401).json({ message: 'Access denied. You are not a seller.' });
        }
      }
      res.json({
        ...sanitizeUser(user),
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.log('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    role,
    owner_name,
    facebook,
    instagram,
    division,
    district,
    upazila,
    address_details,
    package_id,
    payment_method,
    transaction_id
  } = req.body;

  try {
    const { data: userExists } = await db.database.from('users').select('id').eq('email', email).single();
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const assignedRole = role === 'seller' ? 'seller' : 'customer';

    const { data: user, error } = await db.database.from('users').insert({
      name,
      email,
      password_hash,
      phone: phone || '',
      is_admin: false,
      role: assignedRole,
      permissions: [],
      owner_name: owner_name || '',
      facebook: facebook || '',
      instagram: instagram || '',
      division: division || '',
      district: district || '',
      upazila: upazila || '',
      address_details: address_details || ''
    }).select().single();

    if (error) throw error;

    let subscriptionId = null;
    if (assignedRole === 'seller' && package_id) {
      const subData = {
        user_id: user.id,
        package_id,
        payment_method: payment_method || 'Cash on Delivery',
        transaction_id: transaction_id || '',
        status: (payment_method && payment_method !== 'Cash on Delivery') ? 'pending' : 'active',
        start_date: new Date().toISOString(),
      };
      const { data: subRet, error: subError } = await db.database.from('seller_subscriptions').insert([subData]).select().single();
      if (subError) {
        console.error('Subscription creation failed:', subError);
      } else if (subRet) {
        subscriptionId = subRet.id;
      }
    }

    res.status(201).json({
      ...sanitizeUser(user),
      token: generateToken(user.id),
      subscriptionId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const { data: user, error } = await db.database.from('users').select('*').eq('id', req.user._id).single();
    if (error || !user) return res.status(404).json({ message: 'User not found' });
    
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  const { 
    name, 
    owner_name, 
    phone, 
    facebook, 
    instagram, 
    division, 
    district, 
    upazila, 
    address_details,
    nid_number,
    nid_image_front,
    nid_image_back,
    customDomain
  } = req.body;

  try {
    const { data: user } = await db.database.from('users').select('*').eq('id', req.user._id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (owner_name !== undefined) updateData.owner_name = owner_name;
    if (phone !== undefined) updateData.phone = phone;
    if (facebook !== undefined) updateData.facebook = facebook;
    if (instagram !== undefined) updateData.instagram = instagram;
    if (division !== undefined) updateData.division = division;
    if (district !== undefined) updateData.district = district;
    if (upazila !== undefined) updateData.upazila = upazila;
    if (address_details !== undefined) updateData.address_details = address_details;
    if (nid_number !== undefined) updateData.nid_number = nid_number;
    if (nid_image_front !== undefined) updateData.nid_image_front = nid_image_front;
    if (nid_image_back !== undefined) updateData.nid_image_back = nid_image_back;
    if (customDomain !== undefined) updateData.customDomain = customDomain;

    if ((nid_number || nid_image_front || nid_image_back) && user.verification_status !== 'Verified') {
      updateData.verification_status = 'Pending';
    }

    const { data: updated, error } = await db.database
      .from('users')
      .update(updateData)
      .eq('id', req.user._id)
      .select()
      .single();

    if (error) throw error;

    res.json(sanitizeUser(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller SteadFast integration
// @route   PUT /api/users/profile/steadfast
// @access  Private/Seller
const updateSteadfastIntegration = async (req, res) => {
  const { apiKey, secretKey, enabled } = req.body;

  try {
    const { data: user, error: userError } = await db.database
      .from('users')
      .select('*')
      .eq('id', req.user._id)
      .single();

    if (userError || !user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller' && !user.is_admin) {
      return res.status(403).json({ message: 'Only sellers can configure SteadFast integration' });
    }

    const updateData = {
      steadfast_enabled: enabled !== undefined ? Boolean(enabled) : true,
    };

    if (apiKey !== undefined && String(apiKey).trim()) {
      updateData.steadfast_api_key = String(apiKey).trim();
    }
    if (secretKey !== undefined && String(secretKey).trim()) {
      updateData.steadfast_secret_key = String(secretKey).trim();
    }

    const nextApiKey = updateData.steadfast_api_key || user.steadfast_api_key;
    const nextSecretKey = updateData.steadfast_secret_key || user.steadfast_secret_key;

    if (updateData.steadfast_enabled && (!nextApiKey || !nextSecretKey)) {
      return res.status(400).json({ message: 'API key and Secret key are required to enable SteadFast integration' });
    }

    const { data: updated, error } = await db.database
      .from('users')
      .update(updateData)
      .eq('id', req.user._id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...sanitizeUser(updated),
      message: 'SteadFast integration saved successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update seller AI/Twilio/ElevenLabs order automation
// @route   PUT /api/users/profile/order-automation
// @access  Private/Seller
const updateOrderAutomationIntegration = async (req, res) => {
  const {
    enabled,
    twilioAccountSid,
    twilioAuthToken,
    twilioFromNumber,
    elevenlabsApiKey,
    elevenlabsVoiceId,
    openaiApiKey,
    openaiModel,
  } = req.body;

  try {
    const { data: user, error: userError } = await db.database
      .from('users')
      .select('*')
      .eq('id', req.user._id)
      .single();

    if (userError || !user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller' && !user.is_admin) {
      return res.status(403).json({ message: 'Only sellers can configure order automation' });
    }

    const updateData = {
      order_automation_enabled: enabled !== undefined ? Boolean(enabled) : true,
    };

    if (twilioAccountSid !== undefined && String(twilioAccountSid).trim()) updateData.twilio_account_sid = String(twilioAccountSid).trim();
    if (twilioAuthToken !== undefined && String(twilioAuthToken).trim()) updateData.twilio_auth_token = String(twilioAuthToken).trim();
    if (twilioFromNumber !== undefined && String(twilioFromNumber).trim()) updateData.twilio_from_number = String(twilioFromNumber).trim();
    if (elevenlabsApiKey !== undefined && String(elevenlabsApiKey).trim()) updateData.elevenlabs_api_key = String(elevenlabsApiKey).trim();
    if (elevenlabsVoiceId !== undefined && String(elevenlabsVoiceId).trim()) updateData.elevenlabs_voice_id = String(elevenlabsVoiceId).trim();
    if (openaiApiKey !== undefined && String(openaiApiKey).trim()) updateData.openai_api_key = String(openaiApiKey).trim();
    if (openaiModel !== undefined && String(openaiModel).trim()) updateData.openai_model = String(openaiModel).trim();

    const nextTwilioSid = updateData.twilio_account_sid || user.twilio_account_sid;
    const nextTwilioToken = updateData.twilio_auth_token || user.twilio_auth_token;
    const nextTwilioFrom = updateData.twilio_from_number || user.twilio_from_number;

    if (updateData.order_automation_enabled && (!nextTwilioSid || !nextTwilioToken || !nextTwilioFrom)) {
      return res.status(400).json({ message: 'Twilio Account SID, Auth Token, and From Number are required to enable calls/SMS' });
    }

    const { data: updated, error } = await db.database
      .from('users')
      .update(updateData)
      .eq('id', req.user._id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      ...sanitizeUser(updated),
      message: 'Order automation integration saved successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send OTP to email/phone
// @route   POST /api/users/otp/send
// @access  Public
const sendOTP = async (req, res) => {
  const { type, target } = req.body;

  if (!target) {
    return res.status(400).json({ message: 'Target email/phone is required' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  saveOTP(target, otp);

  // Fetch gateway settings from DB with a 3-second timeout
  let gateway = 'Simulated';
  let settings = null;
  
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database query timeout')), 3000)
  );

  try {
    const dbPromise = db.database.from('settings').select('*').limit(1).single();
    const result = await Promise.race([dbPromise, timeoutPromise]);
    if (result && result.data) {
      settings = result.data;
      gateway = settings.otp_gateway || 'Simulated';
    }
  } catch (err) {
    console.warn('[sendOTP] Settings query timed out or failed, falling back to Simulated:', err.message);
  }

  if (type === 'email') {
    // If it's an email, try SMTP if enabled, otherwise simulate
    if (settings && settings.smtp_enabled) {
      try {
        const emailSent = await sendEmail(target, 'Your OTP Code', `Your OTP code is ${otp}`);
        if (emailSent) {
          return res.json({ message: `OTP sent successfully to ${target} via Email` });
        } else {
          return res.status(500).json({ message: 'Failed to send OTP via Email. Check SMTP settings.' });
        }
      } catch (emailError) {
        console.error('[Email OTP Send Failed]', emailError.message);
        return res.status(500).json({ message: 'Failed to send OTP via Email. Check SMTP settings.' });
      }
    } else {
      console.log(`[OTP Simulated for Email] to ${target}. Code: ${otp}`);
      return res.json({ message: `OTP sent successfully to ${target}` });
    }
  } else if (type === 'phone') {
    // If it's a phone, try SMS if not Simulated
    if (gateway !== 'Simulated' && gateway !== 'Email') {
      try {
        if (gateway === 'Custom') {
          if (settings?.custom_sms_api_url && settings.custom_sms_api_url.length > 5) {
            let reqUrl = settings.custom_sms_api_url
              .replace('[NUMBER]', target)
              .replace('[MESSAGE]', encodeURIComponent(`Your OTP code is ${otp}`));
            
            const resp = await fetch(reqUrl);
            const result = await resp.text();
            console.log(`[OTP Sent via Custom SMS] to ${target}: ${result}`);
            
            if (!resp.ok) {
              throw new Error(`Custom SMS API Error: ${result}`);
            }
            return res.json({ message: `OTP sent successfully to ${target}` });
          } else {
            return res.status(500).json({ message: 'Custom SMS Gateway URL is not configured properly' });
          }
        } else if (gateway === 'SAS_BULK_SMS' || !gateway || gateway === 'SMS') {
          if (settings?.sas_sms_api_key && settings?.sas_sms_sender_id) {
            let baseUrl = (settings.sas_sms_gateway_url || 'http://sms.sasbulksms.com:3040').trim();
            if (baseUrl === 'https://sms.sasbulksms.com/') baseUrl = 'http://sms.sasbulksms.com:3040';
            const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
            
            let toUser = target.replace(/\D/g, '');
            if (toUser.startsWith('01') && toUser.length === 11) {
              toUser = '88' + toUser;
            } else if (toUser.startsWith('1') && toUser.length === 10) {
              toUser = '880' + toUser;
            }

            const params = new URLSearchParams({
              apikey: settings.sas_sms_api_key ? settings.sas_sms_api_key.trim() : '',
              secretkey: settings.sas_sms_secret_key ? settings.sas_sms_secret_key.trim() : '',
              callerID: settings.sas_sms_sender_id ? settings.sas_sms_sender_id.trim() : '',
              toUser: toUser,
              messageContent: `Your OTP code is ${otp}`
            });
            
            const reqUrl = `${url}/sendtext?${params.toString()}`;
            const resp = await fetch(reqUrl, { method: 'GET' });
            const result = await resp.text();
            console.log(`[OTP Sent via SAS Bulk SMS] to ${target}: ${result}`);
            
            let isError = false;
            if (!resp.ok) isError = true;
            try {
              const jsonResult = JSON.parse(result);
              if (jsonResult.Status === "-1" || jsonResult.Text === "REJECTD") {
                isError = true;
              }
            } catch (e) {
              if (result.toLowerCase().includes('error')) isError = true;
            }

            if (isError) {
              throw new Error(`SAS Bulk SMS API Error: ${result}`);
            }

            return res.json({ message: `OTP sent successfully to ${target}` });
          } else {
            return res.status(500).json({ message: 'SMS Gateway is not configured properly' });
          }
        }
      } catch (smsError) {
        console.error('[OTP Send Failed]', smsError.message);
        return res.status(500).json({ message: `Failed to send SMS: ${smsError.message}` });
      }
    } else {
      console.log(`[OTP Simulated for Phone] to ${target}. Code: ${otp}`);
      return res.json({ message: `OTP sent successfully to ${target}` });
    }
  } else {
    // unknown type
    console.log(`[OTP Simulated] to ${target}. Code: ${otp}`);
    return res.json({ message: `OTP sent successfully to ${target}` });
  }
};

// @desc    Verify OTP code and authenticate
// @route   POST /api/users/otp/verify
// @access  Public
const verifyOTPCode = async (req, res) => {
  const { type, target, otp, onlyVerify } = req.body;

  if (!target || !otp) {
    return res.status(400).json({ message: 'Target and OTP are required' });
  }

  const isValid = checkOTP(target, otp);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid or expired OTP code' });
  }

  if (onlyVerify) {
    return res.json({ success: true, message: 'OTP verified successfully' });
  }

  let emailValue = target;
  let nameValue = target;

  if (type === 'phone') {
    emailValue = `${target}@shopio.com`;
    nameValue = `Customer ${target.slice(-4)}`;
  } else {
    nameValue = target.split('@')[0];
  }

  try {
    let { data: user } = await db.database.from('users').select('*').eq('email', emailValue).single();

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(`otp-${Math.random().toString(36).substr(2, 9)}`, salt);

      const { data: newUser, error } = await db.database.from('users').insert({
        name: nameValue,
        email: emailValue,
        password_hash,
        is_admin: false,
        role: 'customer',
        permissions: []
      }).select().single();
      
      if (error) throw error;
      user = newUser;
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/users/profile/password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  try {
    const { data: user } = await db.database.from('users').select('*').eq('id', req.user._id).single();
    
    if (user && await bcrypt.compare(currentPassword, user.password_hash)) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      await db.database.from('users').update({ password_hash }).eq('id', req.user._id);
      return res.json({ message: 'Password updated successfully' });
    }

    res.status(400).json({ message: 'Incorrect current password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change email
// @route   PUT /api/users/profile/email
// @access  Private
const changeEmail = async (req, res) => {
  const { password, newEmail } = req.body;

  if (!password || !newEmail) {
    return res.status(400).json({ message: 'Password and new email are required' });
  }

  try {
    const { data: user } = await db.database.from('users').select('*').eq('id', req.user._id).single();
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
    
    const { data: emailExists } = await db.database.from('users').select('id').eq('email', newEmail).neq('id', user.id).single();
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    await db.database.from('users').update({ email: newEmail }).eq('id', user.id);
    return res.json({ message: 'Email updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    const { data: user } = await db.database.from('users').select('id').eq('email', email).single();
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    const token = `RESET-${Math.floor(100000 + Math.random() * 900005)}`;
    resetTokens.set(email, token);

    console.log(`[PASSWORD RESET TOKEN] requested for ${email}. Token: ${token}`);

    res.json({
      message: `Verification code sent to ${email}`,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const savedToken = resetTokens.get(email);
  if (!savedToken || savedToken !== token) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  try {
    const { data: user } = await db.database.from('users').select('id').eq('email', email).single();
    if (user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      await db.database.from('users').update({ password_hash }).eq('id', user.id);
      resetTokens.delete(email);
      return res.json({ message: 'Password reset successful' });
    }

    res.status(404).json({ message: 'Account not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Reset password using OTP
// @route   POST /api/users/reset-password-otp
// @access  Public
const resetPasswordWithOtp = async (req, res) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const isValid = checkOTP(phone, otp);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid or expired OTP code' });
  }

  try {
    const { data: users } = await db.database.from('users').select('id').or(`phone.eq.${phone},email.eq.${phone}@shopio.com`);
    const user = users && users.length > 0 ? users[0] : null;
    if (user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(newPassword, salt);
      
      await db.database.from('users').update({ password_hash }).eq('id', user.id);
      return res.json({ message: 'Password reset successful' });
    }

    res.status(404).json({ message: 'Account not found with this phone number' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    OAuth authentication
// @route   POST /api/users/oauth
// @access  Public
const oauthLogin = async (req, res) => {
  const { provider, email, name } = req.body;

  if (!provider || !email || !name) {
    return res.status(400).json({ message: 'Provider, email, and name are required' });
  }

  try {
    let { data: user } = await db.database.from('users').select('*').eq('email', email).single();
    
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(`oauth-${provider}-${Math.random().toString(36).substr(2, 9)}`, salt);

      const { data: newUser, error } = await db.database.from('users').insert({
        name,
        email,
        password_hash,
        is_admin: false,
        role: 'customer',
        permissions: []
      }).select().single();
      
      if (error) throw error;
      user = newUser;
    }

    res.json({
      ...sanitizeUser(user),
      token: generateToken(user.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =========== ADMIN USER MANAGEMENT ===========

// @desc    Get all users
// @route   GET /api/users/all
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await db.database.from('users').select('*');
    if (error) throw error;
    res.json(users.map(sanitizeUser));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const { data: user, error } = await db.database.from('users').select('*').eq('id', req.params.id).single();
    if (error || !user) return res.status(404).json({ message: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create user by admin
// @route   POST /api/users
// @access  Private/Admin
const createUserByAdmin = async (req, res) => {
  const { name, email, password, phone, role, permissions } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const userRole = role || 'customer';
  const userPermissions = permissions && permissions.length ? permissions : getRolePermissions(userRole);

  try {
    const { data: exists } = await db.database.from('users').select('id').eq('email', email).single();
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const { data: user, error } = await db.database.from('users').insert({
      name, email, password_hash, phone: phone || '',
      role: userRole, permissions: userPermissions,
      is_admin: userRole !== 'customer'
    }).select().single();

    if (error) throw error;
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUserByAdmin = async (req, res) => {
  const { name, email, phone, role, permissions } = req.body;

  try {
    const { data: user } = await db.database.from('users').select('*').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (email && email !== user.email) {
      const { data: exists } = await db.database.from('users').select('id').eq('email', email).neq('id', user.id).single();
      if (exists) return res.status(400).json({ message: 'Email already in use' });
      updateData.email = email;
    }
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (role) {
      updateData.role = role;
      updateData.is_admin = role !== 'customer';
    }
    if (permissions) updateData.permissions = permissions;

    const { data: updated, error } = await db.database.from('users').update(updateData).eq('id', req.params.id).select().single();
    if (error) throw error;

    res.json(sanitizeUser(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Admin reset user password
// @route   PUT /api/users/:id/password
// @access  Private/Admin
const adminResetPassword = async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    const { data: user } = await db.database.from('users').select('id').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await db.database.from('users').update({ password_hash }).eq('id', req.params.id);
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  try {
    const { error } = await db.database.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban a user (seller)
// @route   PUT /api/users/:id/ban
// @access  Private/Admin
const banUser = async (req, res) => {
  try {
    const { data: user } = await db.database.from('users').select('id, is_banned').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.is_banned) return res.status(400).json({ message: 'User is already banned' });

    await db.database.from('users').update({ is_banned: true, banned_at: new Date().toISOString() }).eq('id', req.params.id);
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unban a user
// @route   PUT /api/users/:id/unban
// @access  Private/Admin
const unbanUser = async (req, res) => {
  try {
    const { data: user } = await db.database.from('users').select('id, is_banned').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.is_banned) return res.status(400).json({ message: 'User is not banned' });

    await db.database.from('users').update({ is_banned: false, banned_at: null }).eq('id', req.params.id);
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Set extra delivery days for a seller
// @route   PUT /api/users/:id/extra-delivery
// @access  Private/Admin
const setExtraDeliveryTime = async (req, res) => {
  const { extra_delivery_days } = req.body;
  if (extra_delivery_days === undefined || extra_delivery_days < 0) {
    return res.status(400).json({ message: 'Valid extra_delivery_days is required (0 or more)' });
  }
  try {
    const { data: user } = await db.database.from('users').select('id').eq('id', req.params.id).single();
    if (!user) return res.status(404).json({ message: 'User not found' });

    await db.database.from('users').update({ extra_delivery_days }).eq('id', req.params.id);
    res.json({ message: 'Extra delivery time updated', extra_delivery_days });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Permission check middleware
const requirePermission = (...perms) => {
  return (req, res, next) => {
    const userPerms = req.user.permissions || getRolePermissions(req.user.role) || [];
    const has = perms.some((p) => userPerms.includes(p));
    if (has || req.user.role === 'superadmin') {
      next();
    } else {
      res.status(403).json({ message: `Access denied. Required permission: ${perms.join(', ')}` });
    }
  };
};

// @desc    Import Sellers via CSV
// @route   POST /api/users/import-sellers
// @access  Private/Admin
const importSellers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a CSV file' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Process data
      const validUsers = [];
      for (let i = 0; i < results.length; i++) {
        const row = results[i];
        // Validation
        if (!row.first_name || !row.last_name) {
          errors.push(`Row ${i + 2}: Missing first_name or last_name`);
          continue;
        }
        if (!row.email && !row.phone) {
          errors.push(`Row ${i + 2}: Missing email or phone`);
          continue;
        }
        if (row.gender && !['male', 'female', 'others'].includes(row.gender.toLowerCase())) {
          errors.push(`Row ${i + 2}: Invalid gender`);
          continue;
        }

        let password_hash = null;
        if (row.password) {
          if (row.password.length < 6 || row.password.length > 32) {
            errors.push(`Row ${i + 2}: Password must be between 6 and 32 characters`);
            continue;
          }
          const salt = await bcrypt.genSalt(10);
          password_hash = await bcrypt.hash(row.password, salt);
        } else {
          // Default password if none provided
          const salt = await bcrypt.genSalt(10);
          password_hash = await bcrypt.hash('123456', salt);
        }

        validUsers.push({
          name: `${row.first_name} ${row.last_name}`,
          email: row.email || null,
          phone: row.phone || null,
          password_hash,
          gender: row.gender ? row.gender.toLowerCase() : null,
          role: 'seller',
          is_admin: false,
          permissions: getRolePermissions('seller')
        });
      }

      // Cleanup uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete uploaded file', err);
      });

      if (validUsers.length > 0) {
        const { data: insertedUsers, error } = await db.database.from('users').insert(validUsers).select();
        if (error) {
          return res.status(500).json({ message: error.message || 'Failed to insert sellers' });
        }
        res.status(201).json({ 
          message: `Successfully imported ${insertedUsers.length} sellers`,
          errors: errors.length > 0 ? errors : undefined
        });
      } else {
        res.status(400).json({ message: 'No valid sellers found in CSV', errors });
      }
    })
    .on('error', (err) => {
      fs.unlink(req.file.path, () => {});
      res.status(500).json({ message: 'Error parsing CSV file' });
    });
};

// @desc    Get all roles
// @route   GET /api/users/roles
// @access  Private/Admin
const getRoles = async (req, res) => {
  try {
    const result = await db.database.from('roles').select('*').execute();
    if (result.error) throw result.error;
    res.json({ data: result.data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new role
// @route   POST /api/users/roles
// @access  Private/Admin
const createRole = async (req, res) => {
  try {
    const { name, label, permissions, description } = req.body;
    if (!name || !label) {
      return res.status(400).json({ message: 'Name and label are required' });
    }
    const result = await db.database.from('roles').insert({
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      label,
      permissions: permissions || [],
      description: description || '',
      is_system: false,
    }).select('*').execute();
    if (result.error) throw result.error;
    res.status(201).json({ data: result.data[0] });
  } catch (error) {
    if (error.constraint === 'roles_name_key') {
      return res.status(400).json({ message: 'A role with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a role
// @route   PUT /api/users/roles/:id
// @access  Private/Admin
const updateRole = async (req, res) => {
  try {
    const { name, label, permissions, description } = req.body;
    const existing = await db.database.from('roles').select('*').eq('id', req.params.id).single().execute();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ message: 'Role not found' });
    if (existing.data.is_system) return res.status(400).json({ message: 'System roles cannot be edited' });

    const updateData = {};
    if (name !== undefined) updateData.name = name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (label !== undefined) updateData.label = label;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (description !== undefined) updateData.description = description;

    const result = await db.database.from('roles').update(updateData).eq('id', req.params.id).select('*').execute();
    if (result.error) throw result.error;
    res.json({ data: result.data[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a role
// @route   DELETE /api/users/roles/:id
// @access  Private/Admin
const deleteRole = async (req, res) => {
  try {
    const existing = await db.database.from('roles').select('*').eq('id', req.params.id).single().execute();
    if (existing.error) throw existing.error;
    if (!existing.data) return res.status(404).json({ message: 'Role not found' });
    if (existing.data.is_system) return res.status(400).json({ message: 'System roles cannot be deleted' });

    const result = await db.database.from('roles').delete().eq('id', req.params.id).execute();
    if (result.error) throw result.error;
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {

  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateSteadfastIntegration,
  updateOrderAutomationIntegration,
  sendOTP,
  verifyOTPCode,
  changePassword,
  changeEmail,
  forgotPassword,
  resetPassword,
  resetPasswordWithOtp,
  oauthLogin,
  getUsers,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  adminResetPassword,
  deleteUser,
  banUser,
  unbanUser,
  setExtraDeliveryTime,
  importSellers,
  requirePermission,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasAdminAccess,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};
