/**
 * 📧 GEMRISHI TEAM WORK TRACKER CONFIGURATION
 * 
 * Set your manager email and SMTP email credentials directly here.
 * All employee daily reports will be automatically delivered to MANAGER_EMAIL.
 */

module.exports = {
  // =========================================================================
  // 📥 MANAGER EMAIL ADDRESS (Where all employee work reports will be sent)
  // =========================================================================
  MANAGER_EMAIL: process.env.MANAGER_EMAIL || 'gangwarpiyush827@gmail.com',

  // 📋 Optional CC Emails (comma-separated, e.g. 'director@gemrishi.com')
  CC_EMAILS: process.env.CC_EMAILS || '',

  // 🏢 Company Branding
  COMPANY_NAME: 'GemRishi',
  SUBJECT_PREFIX: '[Daily Work Report]',
  SENDER_NAME: 'GemRishi Team Tracker',

  // =========================================================================
  // ⚙️ SMTP OUTGOING EMAIL SETTINGS (Required for sending emails to inbox)
  // =========================================================================
  // To send automated emails from Gmail to gangwarpiyush827@gmail.com:
  // 1. Enter your Gmail address in SMTP_USER below.
  // 2. Go to https://myaccount.google.com/apppasswords and generate a 16-character App Password.
  // 3. Paste the 16-character App Password in SMTP_PASS below.
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_SECURE: false, // true for port 465, false for 587
  SMTP_USER: process.env.SMTP_USER || 'gangwarpiyush827@gmail.com', // 👈 ENTER YOUR GMAIL HERE (e.g. 'gangwarpiyush827@gmail.com')
  SMTP_PASS: process.env.SMTP_PASS || 'bqbx kakb fxql ubur', // 👈 ENTER YOUR 16-CHAR GOOGLE APP PASSWORD HERE (e.g. 'abcd efgh ijkl mnop')

  // Automatically dispatch email when employee clicks Submit & Auto Send
  AUTO_EMAIL_ON_SUBMIT: true
};
