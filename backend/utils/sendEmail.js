import nodemailer from 'nodemailer';
import { db } from '../config/db.js';

export const sendEmail = async (to, subject, text, html) => {
  try {
    // Fetch SMTP settings from DB
    const { data: settings } = await db.database.from('settings').select('*').limit(1).single();
    
    if (!settings || !settings.smtp_enabled) {
      console.log('SMTP is disabled. Email not sent.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: settings.smtp_host || 'smtp.gmail.com',
      port: settings.smtp_port || 587,
      secure: settings.smtp_port == 465, // true for 465, false for other ports
      auth: {
        user: settings.smtp_user,
        pass: settings.smtp_pass,
      },
    });

    const mailOptions = {
      from: `"${settings.site_title || 'GoroShop'}" <${settings.smtp_from_email || settings.smtp_user}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
