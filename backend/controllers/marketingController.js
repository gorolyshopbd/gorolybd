import { db } from '../config/db.js';

export const getAdCampaigns = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM ad_campaigns ORDER BY created_at DESC');
    
    // Calculate ROI dynamically
    const campaigns = rows.map(c => {
      const spend = Number(c.spend) || 0;
      const revenue = Number(c.revenue) || 0;
      const roi = spend > 0 ? ((revenue - spend) / spend * 100).toFixed(2) : 0;
      return { ...c, roi: Number(roi) };
    });

    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAdCampaign = async (req, res) => {
  const { platform, campaign_name, spend, revenue, clicks, conversions, start_date, end_date } = req.body;
  try {
    const { rows } = await db.query(`
      INSERT INTO ad_campaigns (platform, campaign_name, spend, revenue, clicks, conversions, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [platform, campaign_name, spend, revenue, clicks, conversions, start_date, end_date]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAdCampaign = async (req, res) => {
  const { id } = req.params;
  const { platform, campaign_name, spend, revenue, clicks, conversions, start_date, end_date } = req.body;
  try {
    const { rows } = await db.query(`
      UPDATE ad_campaigns
      SET platform=$1, campaign_name=$2, spend=$3, revenue=$4, clicks=$5, conversions=$6, start_date=$7, end_date=$8, updated_at=NOW()
      WHERE id=$9 RETURNING *
    `, [platform, campaign_name, spend, revenue, clicks, conversions, start_date, end_date, id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAdCampaign = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM ad_campaigns WHERE id=$1', [id]);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
