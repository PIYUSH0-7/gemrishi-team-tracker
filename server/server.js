const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./services/db');
const { sendReportEmail, testSMTPConnection } = require('./services/mailer');
const { generateEmailHTML, generatePlainText } = require('./services/emailTemplate');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static assets if client build exists
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Also serve root logo
app.get('/logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'GemRishi.svg'));
});

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// GET /api/reports - List & search reports
app.get('/api/reports', (req, res) => {
  try {
    const { date, department, employeeName, search, limit, offset } = req.query;
    const result = db.getReports({
      date,
      department,
      employeeName,
      search,
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    });
    res.json(result);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// GET /api/reports/:id - Single report
app.get('/api/reports/:id', (req, res) => {
  try {
    const report = db.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// POST /api/reports - Submit new report & auto-send email
app.post('/api/reports', async (req, res) => {
  try {
    const { employeeName, department, reportDate, targets, workCompleted, results, pendingTasks, notes } = req.body;

    if (!employeeName || !employeeName.trim()) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    // 1. Create and save report in database
    const newReport = db.createReport({
      employeeName,
      department,
      reportDate,
      targets,
      workCompleted,
      results,
      pendingTasks,
      notes
    });

    // 2. Check settings for auto email
    const settings = db.getSettings();
    let emailResult = { status: 'skipped' };

    if (settings.autoEmailOnSubmit !== false) {
      try {
        const mailRes = await sendReportEmail(newReport);
        if (mailRes.success) {
          db.updateReport(newReport.id, {
            emailStatus: mailRes.previewOnly ? 'preview_only' : 'sent',
            emailRecipient: mailRes.recipient,
            emailSentAt: new Date().toISOString()
          });
          emailResult = mailRes;
        } else {
          db.updateReport(newReport.id, {
            emailStatus: 'failed',
            emailError: mailRes.error
          });
          emailResult = mailRes;
        }
      } catch (mailErr) {
        console.error('Auto-email error:', mailErr);
        db.updateReport(newReport.id, {
          emailStatus: 'failed',
          emailError: mailErr.message
        });
        emailResult = { success: false, error: mailErr.message };
      }
    }

    const updatedReport = db.getReportById(newReport.id);
    res.status(201).json({
      report: updatedReport,
      emailResult
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: err.message || 'Failed to submit report' });
  }
});

// PUT /api/reports/:id - Update report
app.put('/api/reports/:id', (req, res) => {
  try {
    const updated = db.updateReport(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// DELETE /api/reports/:id - Delete report
app.delete('/api/reports/:id', (req, res) => {
  try {
    const success = db.deleteReport(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// POST /api/reports/:id/resend - Resend email for existing report
app.post('/api/reports/:id/resend', async (req, res) => {
  try {
    const report = db.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const { targetEmail } = req.body;
    const mailRes = await sendReportEmail(report, targetEmail);

    if (mailRes.success) {
      db.updateReport(report.id, {
        emailStatus: mailRes.previewOnly ? 'preview_only' : 'sent',
        emailRecipient: mailRes.recipient,
        emailSentAt: new Date().toISOString(),
        emailError: null
      });
      res.json({ success: true, message: `Email sent to ${mailRes.recipient}!`, mailRes });
    } else {
      db.updateReport(report.id, {
        emailStatus: 'failed',
        emailError: mailRes.error
      });
      res.status(500).json({ success: false, error: mailRes.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to resend email' });
  }
});

// GET /api/reports/employee/last-pending - Carry forward yesterday's pending tasks
app.get('/api/employee/last-pending', (req, res) => {
  try {
    const { name } = req.query;
    const pending = db.getLastPendingTasks(name);
    res.json({ pendingTasks: pending });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
});

// GET /api/analytics - Summary stats
app.get('/api/analytics', (req, res) => {
  try {
    const summary = db.getAnalyticsSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// POST /api/preview-email - Live preview of HTML template
app.post('/api/preview-email', (req, res) => {
  try {
    const report = req.body;
    const settings = db.getSettings();
    const html = generateEmailHTML(report, settings);
    const text = generatePlainText(report, settings.companyName || 'GemRishi');
    res.json({ html, text });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// GET /api/settings - Fetch settings (with pass masked)
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.getSettings();
    const safeSettings = {
      ...settings,
      smtpPassConfigured: Boolean(settings.smtpPass),
      smtpPass: settings.smtpPass ? '********' : ''
    };
    res.json(safeSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// POST /api/settings - Update settings
app.post('/api/settings', (req, res) => {
  try {
    const currentSettings = db.getSettings();
    const updateData = { ...req.body };

    // If password wasn't changed (still contains mask), keep the old password
    if (updateData.smtpPass === '********') {
      updateData.smtpPass = currentSettings.smtpPass;
    }

    const saved = db.updateSettings(updateData);
    res.json({
      success: true,
      settings: {
        ...saved,
        smtpPassConfigured: Boolean(saved.smtpPass),
        smtpPass: saved.smtpPass ? '********' : ''
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// POST /api/settings/test-email - Test SMTP connection
app.post('/api/settings/test-email', async (req, res) => {
  try {
    const currentSettings = db.getSettings();
    const testConfig = { ...currentSettings, ...req.body };

    if (testConfig.smtpPass === '********') {
      testConfig.smtpPass = currentSettings.smtpPass;
    }

    const testResult = await testSMTPConnection(testConfig);
    res.json(testResult);
  } catch (err) {
    console.error('SMTP Test Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/departments
app.get('/api/departments', (req, res) => {
  try {
    const depts = db.getDepartments();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// POST /api/departments
app.post('/api/departments', (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Department name is required' });
    const depts = db.addDepartment(name);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add department' });
  }
});

// Fallback for SPA routing in production
app.use((req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.send(`GemRishi Work Tracker Server is running. Client is in dev mode at http://localhost:5173`);
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`💎 GemRishi Team Work Tracker Backend Server Started`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
