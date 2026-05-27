import { supabase } from '../config/db.js';

export const getSellerSettings = async (req, res) => {
  try {
    let { data: settings, error } = await supabase.from('seller_settings').select('*').limit(1).single();
    
    if (!settings && error?.code === 'PGRST116') {
      // Default settings if empty (PGRST116 is the error code for 0 rows in single())
      const defaultSettings = {
        category_based_commission: false,
        seller_based_commission: false,
        message_to_seller_mail: true
      };
      
      const { data: newSettings, error: insertError } = await supabase.from('seller_settings').insert([defaultSettings]).select().single();
      
      if (insertError) throw insertError;
      settings = newSettings;
    } else if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch seller settings' });
  }
};

export const updateSellerSettings = async (req, res) => {
  try {
    const updateData = {
      category_based_commission: req.body.category_based_commission,
      seller_based_commission: req.body.seller_based_commission,
      message_to_seller_mail: req.body.message_to_seller_mail
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const { data: existing, error: fetchError } = await supabase.from('seller_settings').select('id').limit(1).single();
    
    if (existing) {
      await supabase.from('seller_settings').update(updateData).eq('id', existing.id);
    } else {
      await supabase.from('seller_settings').insert([updateData]);
    }
    
    res.json({ message: 'Seller settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update seller settings' });
  }
};
