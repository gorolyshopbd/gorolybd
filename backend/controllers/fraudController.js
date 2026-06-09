import { db } from '../config/db.js';

const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
};

const getSuspiciousOrders = async (req, res) => {
  try {
    const { data: allOrders, error } = await db.database
      .from('orders')
      .select('id, user_id, shipping_phone, ip_address, device_fingerprint, total_price, status, created_at, users:user_id(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!allOrders || allOrders.length === 0) {
      return res.json([]);
    }

    const phoneCounts = {};
    const ipCounts = {};
    const deviceCounts = {};

    allOrders.forEach((o) => {
      const phone = (o.shipping_phone || '').replace(/\D/g, '');
      const ip = o.ip_address || '';
      const device = o.device_fingerprint || '';

      if (phone) phoneCounts[phone] = (phoneCounts[phone] || 0) + 1;
      if (ip) ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      if (device) deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const { data: blockedPhones } = await db.database.from('blocked_phones').select('phone');
    const { data: blockedIps } = await db.database.from('blocked_ips').select('ip_address');

    const blockedPhoneSet = new Set((blockedPhones || []).map((b) => b.phone.replace(/\D/g, '')));
    const blockedIpSet = new Set((blockedIps || []).map((b) => b.ip_address));

    const suspicious = allOrders
      .map((o) => {
        const phone = (o.shipping_phone || '').replace(/\D/g, '');
        const ip = o.ip_address || '';
        const device = o.device_fingerprint || '';

        const signals = [];
        let riskScore = 0;

        if (phone && phoneCounts[phone] > 1) {
          signals.push(`Phone used in ${phoneCounts[phone]} orders`);
          riskScore += 3;
        }
        if (ip && ipCounts[ip] > 1) {
          signals.push(`IP used in ${ipCounts[ip]} orders`);
          riskScore += 2;
        }
        if (device && deviceCounts[device] > 1) {
          signals.push(`Device used in ${deviceCounts[device]} orders`);
          riskScore += 2;
        }
        if (phone && blockedPhoneSet.has(phone)) {
          signals.push('Phone is BLOCKED');
          riskScore += 5;
        }
        if (ip && blockedIpSet.has(ip)) {
          signals.push('IP is BLOCKED');
          riskScore += 5;
        }

        return { ...o, signals, riskScore };
      })
      .filter((o) => o.signals.length > 0)
      .sort((a, b) => b.riskScore - a.riskScore);

    return res.json(suspicious);
  } catch (err) {
    console.error('getSuspiciousOrders error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const checkOrderFraud = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await db.database
      .from('orders')
      .select('*, users:user_id(name, email, phone)')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const phone = (order.shipping_phone || '').replace(/\D/g, '');
    const ip = order.ip_address || '';
    const device = order.device_fingerprint || '';

    const duplicates = { phone: [], ip: [], device: [] };

    if (phone) {
      const { data: phoneOrders } = await db.database
        .from('orders')
        .select('id, total_price, status, created_at, users:user_id(name, email)')
        .neq('id', id)
        .eq('shipping_phone', order.shipping_phone)
        .order('created_at', { ascending: false });
      duplicates.phone = phoneOrders || [];
    }

    if (ip) {
      const { data: ipOrders } = await db.database
        .from('orders')
        .select('id, total_price, status, created_at, users:user_id(name, email)')
        .neq('id', id)
        .eq('ip_address', ip)
        .order('created_at', { ascending: false });
      duplicates.ip = ipOrders || [];
    }

    if (device) {
      const { data: deviceOrders } = await db.database
        .from('orders')
        .select('id, total_price, status, created_at, users:user_id(name, email)')
        .neq('id', id)
        .eq('device_fingerprint', device)
        .order('created_at', { ascending: false });
      duplicates.device = deviceOrders || [];
    }

    let isPhoneBlocked = false;
    let isIpBlocked = false;

    if (phone) {
      const { data: bp } = await db.database.from('blocked_phones').eq('phone', order.shipping_phone).maybeSingle();
      isPhoneBlocked = !!bp;
    }
    if (ip) {
      const { data: bi } = await db.database.from('blocked_ips').eq('ip_address', ip).maybeSingle();
      isIpBlocked = !!bi;
    }

    return res.json({ order, duplicates, blocks: { phone: isPhoneBlocked, ip: isIpBlocked } });
  } catch (err) {
    console.error('checkOrderFraud error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const blockPhone = async (req, res) => {
  try {
    const { phone, reason } = req.body;

    if (!phone || phone.trim() === '') {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const { data, error } = await db.database
      .from('blocked_phones')
      .insert([{ phone: phone.trim(), reason: reason || 'Blocked by admin', blocked_by: req.user._id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Phone already blocked' });
      }
      throw error;
    }

    return res.json({ message: 'Phone blocked successfully', data });
  } catch (err) {
    console.error('blockPhone error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const unblockPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const { error } = await db.database
      .from('blocked_phones')
      .delete()
      .eq('phone', phone);

    if (error) throw error;

    return res.json({ message: 'Phone unblocked successfully' });
  } catch (err) {
    console.error('unblockPhone error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const blockIp = async (req, res) => {
  try {
    const { ip_address, reason } = req.body;

    if (!ip_address || ip_address.trim() === '') {
      return res.status(400).json({ message: 'IP address is required' });
    }

    const { data, error } = await db.database
      .from('blocked_ips')
      .insert([{ ip_address: ip_address.trim(), reason: reason || 'Blocked by admin', blocked_by: req.user._id }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ message: 'IP already blocked' });
      }
      throw error;
    }

    return res.json({ message: 'IP blocked successfully', data });
  } catch (err) {
    console.error('blockIp error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const unblockIp = async (req, res) => {
  try {
    const { ip_address } = req.params;
    const decodedIp = decodeURIComponent(ip_address);

    const { error } = await db.database
      .from('blocked_ips')
      .delete()
      .eq('ip_address', decodedIp);

    if (error) throw error;

    return res.json({ message: 'IP unblocked successfully' });
  } catch (err) {
    console.error('unblockIp error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getBlockedPhones = async (req, res) => {
  try {
    const { data, error } = await db.database
      .from('blocked_phones')
      .select('*, users:blocked_by(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data || []);
  } catch (err) {
    console.error('getBlockedPhones error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

const getBlockedIps = async (req, res) => {
  try {
    const { data, error } = await db.database
      .from('blocked_ips')
      .select('*, users:blocked_by(name, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json(data || []);
  } catch (err) {
    console.error('getBlockedIps error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};

export {
  getSuspiciousOrders,
  checkOrderFraud,
  blockPhone,
  unblockPhone,
  blockIp,
  unblockIp,
  getBlockedPhones,
  getBlockedIps,
};
