/**
 * Email Template Generator for GemRishi Work Reports
 * Generates email-client compatible, responsive HTML and clean Plain-Text formats.
 */

function formatDateDisplay(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

function generateEmailHTML(report, companyName = 'GemRishi') {
  const {
    employeeName,
    department,
    reportDate,
    submittedAt,
    targets = [],
    workCompleted = [],
    results = [],
    pendingTasks = [],
    notes = ''
  } = report;

  const formattedDate = formatDateDisplay(reportDate);
  const formattedTime = submittedAt 
    ? new Date(submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '';

  const renderBulletList = (items, bulletBg = '#059669', bulletColor = '#ffffff') => {
    if (!items || items.length === 0) {
      return `<p style="margin: 0; color: #94a3b8; font-style: italic; font-size: 14px;">No items listed.</p>`;
    }
    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        ${items.map((item, idx) => `
          <tr>
            <td valign="top" style="width: 24px; padding: 6px 0; vertical-align: top;">
              <div style="width: 18px; height: 18px; background-color: ${bulletBg}; color: ${bulletColor}; border-radius: 50%; text-align: center; line-height: 18px; font-size: 11px; font-weight: bold;">
                ${idx + 1}
              </div>
            </td>
            <td valign="top" style="padding: 6px 0 6px 10px; font-size: 14px; line-height: 1.6; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              ${escapeHTML(item)}
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  };

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Work Report - ${escapeHTML(employeeName)} - ${escapeHTML(formattedDate)}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f1f5f9; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9;">
    <tr>
      <td align="center" style="padding: 12px;">
        
        <!-- MAIN WRAPPER CONTAINER -->
        <table border="0" cellpadding="0" cellspacing="0" width="640" class="email-container" style="max-width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #1b3d2f 0%, #224938 50%, #059669 100%); padding: 28px 32px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      💎 ${escapeHTML(companyName)}
                    </div>
                    <div style="font-size: 13px; color: #a7f3d0; margin-top: 4px; font-weight: 500; letter-spacing: 0.3px; text-transform: uppercase;">
                      Daily Team Work Tracker & Dispatch
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      Official Report
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMPLOYEE INFO BANNER -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="stack-column" valign="top" style="padding-bottom: 8px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Employee Name
                    </div>
                    <div style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                      ${escapeHTML(employeeName)}
                    </div>
                  </td>
                  <td class="stack-column" valign="top" style="padding-bottom: 8px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Department
                    </div>
                    <div style="margin-top: 4px;">
                      <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-weight: 600; font-size: 13px; padding: 3px 10px; border-radius: 6px;">
                        🏢 ${escapeHTML(department)}
                      </span>
                    </div>
                  </td>
                  <td class="stack-column" valign="top" style="padding-bottom: 8px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Date & Time
                    </div>
                    <div style="font-size: 14px; font-weight: 600; color: #334155; margin-top: 4px;">
                      📅 ${escapeHTML(formattedDate)}
                    </div>
                    ${formattedTime ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">🕒 ${formattedTime}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- REPORT CONTENT SECTIONS -->
          <tr>
            <td style="padding: 28px 32px 36px 32px;">
              
              <!-- 1. TARGETS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 10px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: #166534; letter-spacing: 0.2px;">
                          🎯 Targets Planned (${targets.length})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #ffffff;">
                    ${renderBulletList(targets, '#10b981', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 2. WORK COMPLETED -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border: 1px solid #cbd5e1; border-left: 4px solid #059669; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                <tr>
                  <td style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 10px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: #065f46; letter-spacing: 0.2px;">
                          ✅ Work Completed (${workCompleted.length})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #ffffff;">
                    ${renderBulletList(workCompleted, '#059669', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 3. RESULTS & OUTCOMES -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 10px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: #115e59; letter-spacing: 0.2px;">
                          📊 Key Results & Key Findings (${results.length})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #ffffff;">
                    ${renderBulletList(results, '#0d9488', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 4. PENDING TASKS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: ${notes ? '24px' : '0'}; border: 1px solid ${pendingTasks.length > 0 ? '#fed7aa' : '#e2e8f0'}; border-left: 4px solid ${pendingTasks.length > 0 ? '#f97316' : '#94a3b8'}; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: ${pendingTasks.length > 0 ? '#fff7ed' : '#f8fafc'}; border-bottom: 1px solid ${pendingTasks.length > 0 ? '#ffedd5' : '#e2e8f0'}; padding: 10px 16px;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size: 15px; font-weight: 700; color: ${pendingTasks.length > 0 ? '#9a3412' : '#475569'}; letter-spacing: 0.2px;">
                          ⏳ Pending Tasks & Next Steps (${pendingTasks.length})
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px; background-color: #ffffff;">
                    ${renderBulletList(pendingTasks, pendingTasks.length > 0 ? '#ea580c' : '#64748b', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 5. ADDITIONAL NOTES (Optional) -->
              ${notes ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 10px 16px;">
                    <span style="font-size: 14px; font-weight: 700; color: #475569;">
                      📝 Notes / Comments
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 14px 16px; background-color: #ffffff; font-size: 14px; line-height: 1.6; color: #334155;">
                    ${escapeHTML(notes).replace(/\n/g, '<br/>')}
                  </td>
                </tr>
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #1b3d2f; padding: 20px 32px; text-align: center; border-top: 1px solid #132a20;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 12px; color: #a7f3d0; text-align: center; line-height: 1.6;">
                    <strong>${escapeHTML(companyName)} Team Work Tracker</strong> &bull; Automated Daily Dispatch<br/>
                    Submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /MAIN WRAPPER CONTAINER -->

      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function generatePlainText(report, companyName = 'GemRishi') {
  const {
    employeeName,
    department,
    reportDate,
    targets = [],
    workCompleted = [],
    results = [],
    pendingTasks = [],
    notes = ''
  } = report;

  const formattedDate = formatDateDisplay(reportDate);

  let text = `*WORK REPORT*\n\n`;
  text += `*Name: ${employeeName}*\n`;
  text += `*Department: ${department}*\n`;
  text += `*Date: ${formattedDate}*\n\n`;

  text += `*Targets*\n`;
  if (targets.length > 0) {
    targets.forEach(t => { text += `* ${t}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Work Completed*\n`;
  if (workCompleted.length > 0) {
    workCompleted.forEach(w => { text += `* ${w}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Results*\n`;
  if (results.length > 0) {
    results.forEach(r => { text += `* ${r}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Pending Tasks*\n`;
  if (pendingTasks.length > 0) {
    pendingTasks.forEach(p => { text += `* ${p}\n`; });
  } else {
    text += `* None\n`;
  }

  if (notes) {
    text += `\n*Notes*\n${notes}\n`;
  }

  return text;
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  generateEmailHTML,
  generatePlainText,
  formatDateDisplay
};
