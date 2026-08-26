const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const config = require('../config');

// Always use os.tmpdir() for serverless / lambda / netlify
function resolveDataDir() {
  if (
    process.env.NETLIFY_SERVERLESS ||
    process.env.NETLIFY ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.AWS_EXECUTION_ENV ||
    __dirname.includes('var') ||
    __dirname.includes('task') ||
    __dirname.includes('netlify')
  ) {
    return path.join(os.tmpdir(), 'team_track_data');
  }
  return path.join(__dirname, '..', 'data');
}

const DATA_DIR = resolveDataDir();
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const DEPARTMENTS_FILE = path.join(DATA_DIR, 'departments.json');

// Ensure data directory exists safely without ever throwing unhandled exceptions
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Silent fallback - all data is maintained in-memory
}

// In-memory memory store cache for serverless execution
const memoryStore = {
  reports: null,
  settings: null,
  departments: null
};

function getStoreKey(filePath) {
  if (filePath.includes('reports')) return 'reports';
  if (filePath.includes('settings')) return 'settings';
  if (filePath.includes('departments')) return 'departments';
  return 'data';
}

// Helper to safely read JSON file
function readJSON(filePath, defaultValue) {
  const key = getStoreKey(filePath);
  if (memoryStore[key]) {
    return memoryStore[key];
  }

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      memoryStore[key] = JSON.parse(data);
      return memoryStore[key];
    }
  } catch (err) {
    // Read error fallback
  }

  memoryStore[key] = Array.isArray(defaultValue) ? [...defaultValue] : { ...defaultValue };
  return memoryStore[key];
}

// Helper to safely write JSON file
function writeJSON(filePath, data) {
  const key = getStoreKey(filePath);
  memoryStore[key] = data;

  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      // Memory store already holds the latest state
    }
  }
}

// Default settings sourced directly from server/config.js
const DEFAULT_SETTINGS = {
  managerEmail: config.MANAGER_EMAIL || 'gangwarpiyush827@gmail.com',
  ccEmails: config.CC_EMAILS || '',
  senderName: config.SENDER_NAME || 'GemRishi Team Tracker',
  smtpHost: config.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: 465,
  smtpSecure: true,
  smtpUser: config.SMTP_USER || 'gangwarpiyush827@gmail.com',
  smtpPass: config.SMTP_PASS || 'bqbx kakb fxql ubur',
  autoEmailOnSubmit: config.AUTO_EMAIL_ON_SUBMIT !== false,
  subjectPrefix: config.SUBJECT_PREFIX || '[Daily Work Report]',
  companyName: config.COMPANY_NAME || 'GemRishi',
  companyLogo: '',
  brandColor: '#224938',
  brandSecondaryColor: '#059669',
  updatedAt: new Date().toISOString()
};

// Default departments
const DEFAULT_DEPARTMENTS = [
  'IT',
  'Jewellery Design',
  'Production & Inventory',
  'Sales & Business Dev',
  'Digital Marketing',
  'Accounts & Finance',
  'Operations',
  'Human Resources',
  'Customer Support'
];

// Sample initial report for Pawan Gangwar
const SAMPLE_REPORTS = [
  {
    id: 'sample-pawan-2026-08-25',
    employeeName: 'Pawan Gangwar',
    department: 'IT',
    reportDate: '2026-08-25',
    submittedAt: '2026-08-25T18:30:00.000Z',
    targets: [
      'Implement the backend architecture required for Slug Connection.',
      'Update and review the Product Model and Jewellery Model.',
      'Review and update the Product Controller and Jewellery Controller files.',
      'Clean and update the controller files according to the required model structure.',
      'Check Google Merchant Center and Google Search Console for issues requiring attention.'
    ],
    workCompleted: [
      'Investigated the backend architecture required for the Slug Connection.',
      'Reviewed the existing Controller files and identified the files requiring changes.',
      'Reviewed the Model files and identified the required updates.',
      'Prepared the backend architecture required for implementing the slug connection.',
      'Reviewed the Product Controller and Jewellery Controller files for required modifications.',
      'Checked Google Merchant Center and Google Search Console to identify areas requiring attention.'
    ],
    results: [
      'The backend structure required for the Slug Connection was investigated and prepared.',
      'Required Controller and Model files were reviewed to identify necessary changes.',
      'Admin architecture and related product jewellery pages were reviewed.',
      'Google Merchant Center and Google Search Console were checked for issues requiring further attention.'
    ],
    pendingTasks: [
      'Complete the implementation of the dynamic Slug Connection.',
      'Complete the required updates in the Product and Jewellery controllers.'
    ],
    notes: 'All core architecture changes mapped and ready for testing.',
    emailStatus: 'sent',
    emailRecipient: 'gangwarpiyush827@gmail.com',
    emailSentAt: '2026-08-25T18:30:15.000Z'
  }
];

// Database API
const db = {
  // --- REPORTS ---
  getReports({ date, department, employeeName, search, limit = 100, offset = 0 } = {}) {
    let reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    
    // Filtering
    if (date) {
      reports = reports.filter(r => r.reportDate === date);
    }
    if (department && department !== 'All') {
      reports = reports.filter(r => r.department?.toLowerCase() === department.toLowerCase());
    }
    if (employeeName) {
      reports = reports.filter(r => r.employeeName?.toLowerCase().includes(employeeName.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      reports = reports.filter(r => 
        r.employeeName?.toLowerCase().includes(q) ||
        r.department?.toLowerCase().includes(q) ||
        r.targets?.some(t => t.toLowerCase().includes(q)) ||
        r.workCompleted?.some(w => w.toLowerCase().includes(q)) ||
        r.results?.some(res => res.toLowerCase().includes(q)) ||
        r.pendingTasks?.some(p => p.toLowerCase().includes(q))
      );
    }

    // Sort newest submission first
    reports.sort((a, b) => new Date(b.submittedAt || b.reportDate) - new Date(a.submittedAt || a.reportDate));

    const total = reports.length;
    const paginated = reports.slice(offset, offset + limit);

    return { total, reports: paginated };
  },

  getReportById(id) {
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    return reports.find(r => r.id === id) || null;
  },

  createReport(reportData) {
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    const newReport = {
      id: crypto.randomUUID(),
      employeeName: reportData.employeeName?.trim(),
      department: reportData.department?.trim() || 'General',
      reportDate: reportData.reportDate || new Date().toISOString().split('T')[0],
      submittedAt: new Date().toISOString(),
      targets: Array.isArray(reportData.targets) ? reportData.targets.filter(t => t && t.trim()) : [],
      workCompleted: Array.isArray(reportData.workCompleted) ? reportData.workCompleted.filter(w => w && w.trim()) : [],
      results: Array.isArray(reportData.results) ? reportData.results.filter(r => r && r.trim()) : [],
      pendingTasks: Array.isArray(reportData.pendingTasks) ? reportData.pendingTasks.filter(p => p && p.trim()) : [],
      notes: reportData.notes?.trim() || '',
      emailStatus: 'pending',
      emailRecipient: '',
      emailSentAt: null,
      emailError: null
    };

    reports.unshift(newReport);
    writeJSON(REPORTS_FILE, reports);
    return newReport;
  },

  updateReport(id, updateData) {
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    const index = reports.findIndex(r => r.id === id);
    if (index === -1) return null;

    reports[index] = {
      ...reports[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    writeJSON(REPORTS_FILE, reports);
    return reports[index];
  },

  deleteReport(id) {
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    const filtered = reports.filter(r => r.id !== id);
    if (filtered.length === reports.length) return false;
    writeJSON(REPORTS_FILE, filtered);
    return true;
  },

  getLastPendingTasks(employeeName) {
    if (!employeeName) return [];
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    const employeeReports = reports
      .filter(r => r.employeeName?.toLowerCase().trim() === employeeName.toLowerCase().trim())
      .sort((a, b) => new Date(b.reportDate) - new Date(a.reportDate));

    if (employeeReports.length === 0) return [];
    return employeeReports[0].pendingTasks || [];
  },

  getAnalyticsSummary() {
    const reports = readJSON(REPORTS_FILE, SAMPLE_REPORTS);
    const today = new Date().toISOString().split('T')[0];

    const todayReports = reports.filter(r => r.reportDate === today);
    
    const deptCounts = {};
    reports.forEach(r => {
      const dept = r.department || 'Other';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    });

    const uniqueEmployees = new Set(reports.map(r => r.employeeName)).size;

    let totalCompletedTasks = 0;
    let totalPendingTasks = 0;
    reports.forEach(r => {
      totalCompletedTasks += (r.workCompleted?.length || 0);
      totalPendingTasks += (r.pendingTasks?.length || 0);
    });

    return {
      totalReports: reports.length,
      todayReportsCount: todayReports.length,
      uniqueEmployees,
      totalCompletedTasks,
      totalPendingTasks,
      departmentBreakdown: deptCounts,
      recentSubmissions: reports.slice(0, 5)
    };
  },

  // --- SETTINGS ---
  getSettings() {
    const saved = readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
    return {
      ...saved,
      managerEmail: saved.managerEmail || config.MANAGER_EMAIL || 'gangwarpiyush827@gmail.com',
      ccEmails: saved.ccEmails !== undefined ? saved.ccEmails : (config.CC_EMAILS || ''),
      smtpHost: saved.smtpHost || config.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: saved.smtpPort || config.SMTP_PORT || 465,
      smtpSecure: saved.smtpSecure !== undefined ? saved.smtpSecure : true,
      smtpUser: saved.smtpUser || config.SMTP_USER || 'gangwarpiyush827@gmail.com',
      smtpPass: saved.smtpPass || config.SMTP_PASS || 'bqbx kakb fxql ubur',
      companyName: saved.companyName || config.COMPANY_NAME || 'GemRishi',
      companyLogo: saved.companyLogo || '',
      brandColor: saved.brandColor || '#224938',
      brandSecondaryColor: saved.brandSecondaryColor || '#059669',
      subjectPrefix: saved.subjectPrefix || config.SUBJECT_PREFIX || '[Daily Work Report]',
      senderName: saved.senderName || config.SENDER_NAME || 'Team Tracker',
      autoEmailOnSubmit: saved.autoEmailOnSubmit !== undefined ? saved.autoEmailOnSubmit : (config.AUTO_EMAIL_ON_SUBMIT !== false)
    };
  },

  updateSettings(newSettings) {
    const current = readJSON(SETTINGS_FILE, DEFAULT_SETTINGS);
    const updated = {
      ...current,
      ...newSettings,
      updatedAt: new Date().toISOString()
    };
    writeJSON(SETTINGS_FILE, updated);
    return updated;
  },

  // --- DEPARTMENTS ---
  getDepartments() {
    return readJSON(DEPARTMENTS_FILE, DEFAULT_DEPARTMENTS);
  },

  addDepartment(dept) {
    const depts = readJSON(DEPARTMENTS_FILE, DEFAULT_DEPARTMENTS);
    const trimmed = dept.trim();
    if (trimmed && !depts.includes(trimmed)) {
      depts.push(trimmed);
      writeJSON(DEPARTMENTS_FILE, depts);
    }
    return depts;
  },

  deleteDepartment(dept) {
    const depts = readJSON(DEPARTMENTS_FILE, DEFAULT_DEPARTMENTS);
    const updated = depts.filter(d => d !== dept);
    writeJSON(DEPARTMENTS_FILE, updated);
    return updated;
  }
};

module.exports = db;
