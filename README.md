# 💎 GemRishi Team Work Tracker & Automated Email Dispatch

A daily work report tracker and automated email dispatch system designed for **GemRishi**. Features an emerald green UI theme, automated HTML email delivery to the manager's inbox, smart raw text parsing, and a manager dashboard.

---

## 🌟 Key Features

### 1. 📝 Employee Daily Report Submission (Super Easy to Write)
- **4 Core Structured Sections**:
  - 🎯 **Targets Planned**
  - ✅ **Work Completed**
  - 📊 **Results & Key Findings**
  - ⏳ **Pending Tasks & Next Steps**
- **⚡ Smart Raw Text Paste & Auto-Parser**:
  - Employees can paste unstructured WhatsApp/Slack notes or sample text format, and the smart parser automatically extracts Employee Name, Department, Date, Targets, Work Completed, Results, and Pending Tasks in 1 second.
- **🔄 Carry Forward Yesterday's Pending Tasks**:
  - With 1 click, employees can load yesterday's pending tasks directly into today's report.
- **⚡ Productivity Boosters**:
  - Press `[Enter]` to instantly create the next bullet point.
  - "Mark Done" button on any Target to automatically move it into Work Completed.
  - Auto-remembers Employee Name & Department in local storage.
  - One-click copy formatted text for WhatsApp/Slack (`*WORK REPORT*`, etc.).

---

### 2. 📧 Automated "Good Form" Email Delivery to Manager
- **Inbox-Ready HTML Email Template**:
  - Clean GemRishi emerald branding (`#224938` & `#059669`).
  - Employee profile pill badges (Name, Department, Date & Time).
  - Clear, distinct visual cards for Targets, Work Completed, Results, and Pending Tasks.
  - Clean numbered bullet points and cross-client compatibility (Gmail, Outlook 365, Apple Mail, mobile).
- **SMTP & Google App Password Integration**:
  - Configurable via the **Email Settings** tab in the UI.
  - Test connection tool with real-time diagnostic reporting.
  - Supports multiple CC recipients.

---

### 3. 📊 Manager Command Center & Dashboard
- **Analytics KPIs**: Today's reports count, unique team members, total tasks completed, pending items.
- **Search & Filter**: Search by employee name, department, keywords, or filter by date (Today, Yesterday, Custom date).
- **Actions**:
  - View full report details.
  - Resend email to manager or any custom email address.
  - Export all reports to CSV.
  - Print / Export PDF.

---

## 🚀 Getting Started

### 1. Start the Application
Run the unified fullstack command in the root folder:

```bash
npm start
```

Or for development mode with hot reload:
```bash
npm run dev
```

Open your browser at:
👉 **[http://localhost:5000](http://localhost:5000)** (or `http://localhost:5173` in dev mode)

---

## ⚙️ How to Setup Auto Email Dispatch (2-Minute Setup)

1. Open the app and click on **Email Settings** in the top navigation.
2. In **Manager / Reviewer Email**, enter your email (e.g. `manager@gemrishi.com` or your personal email).
3. Under **SMTP Outgoing Mail Server**:
   - For **Gmail / Google Workspace**:
     1. Go to your Google Account: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
     2. Create a new App Password (e.g. name it "GemRishi Work Tracker").
     3. Copy the 16-character code.
     4. Enter your Gmail address in **SMTP Username** and the 16-character code in **SMTP Password / App Password**.
4. Click **Send Test Work Report** to confirm delivery.
5. Click **Save Settings** — all employee reports will now automatically get emailed to your inbox as soon as they submit!

---

## 📁 Project Structure

```
TEAM_TRACK/
├── GemRishi.svg               # Company Logo
├── package.json               # Backend & unified scripts
├── server/
│   ├── server.js              # Express API server
│   ├── services/
│   │   ├── db.js              # JSON database with atomic writes
│   │   ├── emailTemplate.js   # Responsive HTML & PlainText email builder
│   │   └── mailer.js          # Nodemailer SMTP dispatch & test runner
│   └── data/                  # Persistent reports and settings
└── client/
    ├── package.json           # React frontend dependencies
    ├── vite.config.js         # Vite configuration with Tailwind CSS v4
    └── src/
        ├── App.jsx            # Main app container
        ├── index.css          # GemRishi Emerald theme styles
        ├── components/
        │   ├── Header.jsx             # Emerald navigation bar & branding
        │   ├── ReportForm.jsx         # Employee daily report form
        │   ├── BulletListInput.jsx    # Keyboard-friendly bullet list input
        │   ├── SmartPasteModal.jsx    # Raw text import & regex parser
        │   ├── ReportPreviewModal.jsx # Live HTML email preview
        │   ├── Dashboard.jsx          # Manager dashboard & report explorer
        │   ├── ReportDetailModal.jsx  # Detailed report modal & resend tool
        │   ├── SettingsPanel.jsx      # SMTP & Manager email configuration
        │   └── Toast.jsx              # Toast notification popups
        └── utils/
            ├── parser.js              # Smart report parser & text formatter
            └── pdfExport.js           # PDF export helper
```
