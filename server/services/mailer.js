const nodemailer = require('nodemailer');
const db = require('./db');
const { generateEmailHTML, generatePlainText, formatDateDisplay } = require('./emailTemplate');

/**
 * Creates Nodemailer transporter using saved or provided SMTP settings
 */
function createTransporter(settings) {
  const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = settings;

  if (!smtpUser || !smtpPass) {
    return null; // SMTP not configured
  }

  const cleanUser = smtpUser.trim();
  const cleanPass = smtpPass.trim().replace(/\s+/g, '');

  // Handle Gmail with direct SSL port 465 (most reliable)
  if (!smtpHost || smtpHost.includes('gmail.com')) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: cleanUser,
        pass: cleanPass
      }
    });
  }

  return nodemailer.createTransport({
    host: smtpHost.trim(),
    port: parseInt(smtpPort, 10) || 587,
    secure: Boolean(smtpSecure),
    auth: {
      user: cleanUser,
      pass: cleanPass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Dispatches a daily work report email to the manager
 */
async function sendReportEmail(report, targetRecipient = null) {
  const settings = db.getSettings();
  const recipient = targetRecipient || settings.managerEmail;
  const cc = settings.ccEmails ? settings.ccEmails.split(',').map(e => e.trim()).filter(Boolean) : [];

  const formattedDate = formatDateDisplay(report.reportDate);
  const subjectPrefix = settings.subjectPrefix || '[Daily Work Report]';
  const subject = `${subjectPrefix} ${report.employeeName} (${report.department}) - ${formattedDate}`;

  const htmlContent = generateEmailHTML(report, settings.companyName || 'GemRishi');
  const textContent = generatePlainText(report, settings.companyName || 'GemRishi');

  const senderName = settings.senderName || `${settings.companyName || 'GemRishi'} Work Tracker`;
  const fromAddress = settings.smtpUser ? `"${senderName}" <${settings.smtpUser}>` : `"${senderName}" <no-reply@gemrishi.com>`;

  const transporter = createTransporter(settings);

  // If SMTP is not yet set up
  if (!transporter) {
    console.warn(`[Email Alert] Could not send email because SMTP_USER and SMTP_PASS are empty in server/config.js.`);
    return {
      success: false,
      previewOnly: true,
      recipient,
      subject,
      error: 'SMTP credentials missing in server/config.js. Please enter your Gmail in SMTP_USER and 16-character App Password in SMTP_PASS to deliver live emails.'
    };
  }

  try {
    const mailOptions = {
      from: fromAddress,
      to: recipient,
      cc: cc.length > 0 ? cc : undefined,
      subject,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Sent] Work Report for ${report.employeeName} sent to ${recipient} (Message ID: ${info.messageId})`);

    return {
      success: true,
      messageId: info.messageId,
      recipient,
      subject
    };
  } catch (error) {
    console.error('[Email Send Error]', error);
    let friendlyMessage = error.message;

    if (error.code === 'EAUTH' || error.responseCode === 535) {
      friendlyMessage = 'Authentication failed. If using Gmail, make sure you are using a 16-character Google App Password (not your regular Gmail password).';
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ESOCKET') {
      friendlyMessage = 'Could not connect to SMTP server. Please verify SMTP host and port.';
    }

    return {
      success: false,
      error: friendlyMessage,
      originalError: error.message
    };
  }
}

/**
 * Tests SMTP credentials and sends a test email
 */
async function testSMTPConnection(testConfig) {
  const recipient = testConfig.testRecipient || testConfig.managerEmail;
  if (!recipient) {
    throw new Error('Please specify a recipient email to send the test message to.');
  }

  if (!testConfig.smtpUser || !testConfig.smtpPass) {
    throw new Error('SMTP Username (email) and Password/App Password are required.');
  }

  const transporter = createTransporter(testConfig);
  if (!transporter) {
    throw new Error('Unable to create mail transporter with provided settings.');
  }

  // 1. Verify SMTP connection
  await transporter.verify();

  // 2. Build test work report
  const sampleTestReport = {
    employeeName: 'System Test',
    department: 'IT & Infrastructure',
    reportDate: new Date().toISOString().split('T')[0],
    submittedAt: new Date().toISOString(),
    targets: [
      'Verify GemRishi Team Work Tracker SMTP connection',
      'Ensure HTML email rendering works smoothly'
    ],
    workCompleted: [
      'Successfully connected to SMTP server',
      'Validated TLS/SSL security certificates'
    ],
    results: [
      'Test email generated and delivered successfully to manager inbox!'
    ],
    pendingTasks: [
      'Employees can now submit their daily reports to this mailbox.'
    ],
    notes: 'This is a test notification confirming that GemRishi Daily Work Report auto-dispatch is configured and working perfectly.'
  };

  const htmlContent = generateEmailHTML(sampleTestReport, testConfig.companyName || 'GemRishi');
  const textContent = generatePlainText(sampleTestReport, testConfig.companyName || 'GemRishi');
  const senderName = testConfig.senderName || `${testConfig.companyName || 'GemRishi'} Tracker`;
  const fromAddress = `"${senderName}" <${testConfig.smtpUser}>`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to: recipient,
    subject: `✅ [Test Connection] GemRishi Daily Work Tracker is Configured!`,
    text: textContent,
    html: htmlContent
  });

  return {
    success: true,
    messageId: info.messageId,
    recipient,
    message: `Test email successfully sent to ${recipient}!`
  };
}

module.exports = {
  sendReportEmail,
  testSMTPConnection
};
