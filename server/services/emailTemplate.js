/**
 * Email Template Generator for Work Reports
 * Supports dynamic company branding, custom logo, and customizable brand color themes.
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

// Adjust hex brightness helper for gradients
function adjustHex(hex, percent) {
  if (!hex || typeof hex !== 'string') return '#224938';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num)) return '#224938';

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function generateEmailHTML(report, branding = {}) {
  const companyName = typeof branding === 'string' ? branding : (branding.companyName || 'GemRishi');
  const companyLogo = typeof branding === 'object' ? (branding.companyLogo || '') : '';
  const brandColor = typeof branding === 'object' ? (branding.brandColor || '#224938') : '#224938';
  const brandSecondary = typeof branding === 'object' ? (branding.brandSecondaryColor || adjustHex(brandColor, 20)) : '#059669';
  const brandDark = adjustHex(brandColor, -25);

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

  const renderBulletList = (items, bulletBg = brandSecondary, bulletColor = '#ffffff') => {
    if (!items || items.length === 0) {
      return `<p style="margin: 0; color: #94a3b8; font-style: italic; font-size: 13px;">No items listed.</p>`;
    }
    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        ${items.map((item, idx) => `
          <tr>
            <td valign="top" style="width: 22px; padding: 4px 0; vertical-align: top;">
              <div style="width: 18px; height: 18px; background-color: ${bulletBg}; color: ${bulletColor}; border-radius: 50%; text-align: center; line-height: 18px; font-size: 10px; font-weight: bold;">
                ${idx + 1}
              </div>
            </td>
            <td valign="top" style="padding: 4px 0 4px 8px; font-size: 13px; line-height: 1.5; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
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
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 16px 0; background-color: #f8fafc; -webkit-font-smoothing: antialiased;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 8px;">
        
        <!-- MAIN WRAPPER CONTAINER -->
        <table border="0" cellpadding="0" cellspacing="0" width="620" class="email-container" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandDark} 0%, ${brandColor} 50%, ${brandSecondary} 100%); padding: 22px 28px; text-align: left;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    ${companyLogo ? `
                      <img src="${companyLogo}" alt="${escapeHTML(companyName)}" style="max-height: 38px; max-width: 140px; object-fit: contain; margin-bottom: 6px; display: block; filter: brightness(0) invert(1);" />
                    ` : ''}
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${escapeHTML(companyName)}
                    </div>
                    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.85); margin-top: 2px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
                      Daily Team Work Report
                    </div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3);">
                      Official Dispatch
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EMPLOYEE INFO BANNER -->
          <tr>
            <td style="padding: 16px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="stack-column" valign="top" style="padding-bottom: 6px;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Employee Name
                    </div>
                    <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 1px;">
                      ${escapeHTML(employeeName)}
                    </div>
                  </td>
                  <td class="stack-column" valign="top" style="padding-bottom: 6px;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Department
                    </div>
                    <div style="margin-top: 2px;">
                      <span style="display: inline-block; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; font-size: 12px; padding: 2px 8px; border-radius: 6px;">
                        ${escapeHTML(department)}
                      </span>
                    </div>
                  </td>
                  <td class="stack-column" valign="top" style="padding-bottom: 6px;">
                    <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                      Report Date
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">
                      📅 ${escapeHTML(formattedDate)}
                    </div>
                    ${formattedTime ? `<div style="font-size: 11px; color: #64748b;">🕒 ${formattedTime}</div>` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- REPORT CONTENT SECTIONS -->
          <tr>
            <td style="padding: 20px 28px 24px 28px;">
              
              <!-- 1. TARGETS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 14px;">
                    <span style="font-size: 13px; font-weight: 700; color: #1e293b;">
                      🎯 Targets for Today (${targets.length})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #ffffff;">
                    ${renderBulletList(targets, brandSecondary, '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 2. WORK COMPLETED -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border: 1px solid #cbd5e1; border-left: 4px solid ${brandSecondary}; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 8px 14px;">
                    <span style="font-size: 13px; font-weight: 700; color: #166534;">
                      ✅ Work Completed (${workCompleted.length})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #ffffff;">
                    ${renderBulletList(workCompleted, brandSecondary, '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 3. RESULTS & OUTCOMES -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 8px 14px;">
                    <span style="font-size: 13px; font-weight: 700; color: #115e59;">
                      📊 Results & Key Findings (${results.length})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #ffffff;">
                    ${renderBulletList(results, '#0d9488', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 4. PENDING TASKS -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: ${notes ? '16px' : '0'}; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #fff7ed; border-bottom: 1px solid #ffedd5; padding: 8px 14px;">
                    <span style="font-size: 13px; font-weight: 700; color: #9a3412;">
                      ⏳ Pending Tasks (${pendingTasks.length})
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 14px; background-color: #ffffff;">
                    ${renderBulletList(pendingTasks, '#ea580c', '#ffffff')}
                  </td>
                </tr>
              </table>

              <!-- 5. ADDITIONAL NOTES (Optional) -->
              ${notes ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 14px;">
                    <span style="font-size: 13px; font-weight: 700; color: #475569;">
                      📝 Notes / Comments
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; background-color: #ffffff; font-size: 13px; line-height: 1.5; color: #334155;">
                    ${escapeHTML(notes).replace(/\n/g, '<br/>')}
                  </td>
                </tr>
              </table>
              ` : ''}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: ${brandDark}; padding: 16px 28px; text-align: center; border-top: 1px solid rgba(0,0,0,0.1);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 11px; color: rgba(255,255,255,0.85); text-align: center; line-height: 1.5;">
                    <strong>${escapeHTML(companyName)} Team Tracker</strong> &bull; Automated Daily Dispatch<br/>
                    Report submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
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
  text += `*Company: ${companyName}*\n`;
  text += `*Name: ${employeeName || 'N/A'}*\n`;
  text += `*Department: ${department || 'General'}*\n`;
  text += `*Date: ${formattedDate}*\n\n`;

  text += `*Targets*\n`;
  const cleanTargets = (targets || []).filter(t => t && t.trim());
  if (cleanTargets.length > 0) {
    cleanTargets.forEach(t => { text += `* ${t}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Work Completed*\n`;
  const cleanWork = (workCompleted || []).filter(w => w && w.trim());
  if (cleanWork.length > 0) {
    cleanWork.forEach(w => { text += `* ${w}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Results*\n`;
  const cleanResults = (results || []).filter(r => r && r.trim());
  if (cleanResults.length > 0) {
    cleanResults.forEach(r => { text += `* ${r}\n`; });
  } else {
    text += `* None\n`;
  }
  text += `\n`;

  text += `*Pending Tasks*\n`;
  const cleanPending = (pendingTasks || []).filter(p => p && p.trim());
  if (cleanPending.length > 0) {
    cleanPending.forEach(p => { text += `* ${p}\n`; });
  } else {
    text += `* None\n`;
  }

  if (notes && notes.trim()) {
    text += `\n*Notes*\n${notes.trim()}\n`;
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
