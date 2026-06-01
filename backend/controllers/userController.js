import { db } from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import { saveOTP, verifyOTP as checkOTP } from '../config/otpStore.js';
import bcrypt from 'bcryptjs';
import twilio from 'twilio';
import fs from 'fs';
import csv from 'csv-parser';

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
  const { password_hash, ...rest } = user;
  return { 
    ...rest, 
    _id: rest.id,
    isAdmin: rest.is_admin,
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
    nid_image_back
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

  // Fetch gateway settings from DB
  let gateway = 'Simulated';
  try {
    const { data: settings } = await db.database.from('settings').select('*').limit(1).single();
    if (settings) gateway = settings.otp_gateway || 'Simulated';
  } catch {}

  if (type === 'phone' && gateway !== 'Simulated') {
    try {
      if (gateway === 'SAS_BULK_SMS' || gateway === 'Simulated' || !gateway) {
        const { data: settings } = await db.database.from('settings').select('*').limit(1).single();
        if (settings?.sas_sms_api_key && settings?.sas_sms_sender_id) {
          let baseUrl = settings.sas_sms_gateway_url || 'http://sms.sasbulksms.com:3040';
          if (baseUrl === 'https://sms.sasbulksms.com/') baseUrl = 'http://sms.sasbulksms.com:3040';
          const url = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          
          // Normalize Bangladesh phone number: 01XXXXXXXXX → 8801XXXXXXXXX
          let toUser = target.replace(/\D/g, '');
          if (toUser.startsWith('01') && toUser.length === 11) {
            toUser = '88' + toUser;
          } else if (toUser.startsWith('1') && toUser.length === 10) {
            toUser = '880' + toUser;
          }

          const params = new URLSearchParams({
            apikey: settings.sas_sms_api_key,
            secretkey: settings.sas_sms_secret_key || '',
            callerID: settings.sas_sms_sender_id,
            toUser: toUser,
            messageContent: `Your OTP code is ${otp}`
          });
          
          const reqUrl = `${url}/sendtext?${params.toString()}`;
          const resp = await fetch(reqUrl, {
            method: 'GET'
          });
          
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
      console.log('[OTP Send Failed] Falling back to simulated mode');
      // Fall through to simulated mode below
    }
  }

  console.log(`[OTP Simulated] to ${target}. Code: ${otp}`);

  res.json({
    message: `OTP simulated sent successfully to ${target}`,
    otp,
  });
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

export {

  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
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
  importSellers,
  requirePermission,
  ALL_PERMISSIONS,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasAdminAccess,
};
