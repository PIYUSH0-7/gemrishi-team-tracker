/**
 * Client-Side Email Template Generator for Work Reports
 * Ensures 100% reliable instant email preview rendering with zero network dependency.
 */

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

export function generateClientEmailHTML(report, branding = {}) {
  const companyName = branding?.companyName || 'GemRishi';
  const companyLogo = branding?.companyLogo || '';
  const brandColor = branding?.brandColor || '#224938';
  const brandSecondary = branding?.brandSecondaryColor || adjustHex(brandColor, 20);
  const brandDark = adjustHex(brandColor, -25);

  const {
    employeeName = '',
    department = 'General',
    reportDate = new Date().toISOString().split('T')[0],
    targets = [],
    workCompleted = [],
    results = [],
    pendingTasks = [],
    notes = ''
  } = report;

  const formattedDate = formatDateDisplay(reportDate);

  const renderBulletList = (items, bulletBg = brandSecondary, bulletColor = '#ffffff') => {
    const cleanItems = (items || []).filter(i => i && i.trim());
    if (cleanItems.length === 0) {
      return `<p style="margin: 0; color: #94a3b8; font-style: italic; font-size: 13px;">No items listed.</p>`;
    }
    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
        ${cleanItems.map((item, idx) => `
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
    <div style="background-color: #f8fafc; padding: 12px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
        
        <!-- Brand Header -->
        <div style="background: linear-gradient(135deg, ${brandDark} 0%, ${brandColor} 50%, ${brandSecondary} 100%); padding: 22px 28px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
          <div>
            ${companyLogo ? `
              <img src="${companyLogo}" alt="${escapeHTML(companyName)}" style="max-height: 38px; max-width: 140px; object-fit: contain; margin-bottom: 6px; display: block;" />
            ` : ''}
            <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px; margin: 0;">
              ${escapeHTML(companyName)}
            </div>
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.85); margin-top: 2px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
              Daily Team Work Report
            </div>
          </div>
          <div>
            <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3);">
              Official Dispatch
            </span>
          </div>
        </div>

        <!-- Employee Info Banner -->
        <div style="padding: 16px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Employee Name</div>
            <div style="font-size: 17px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHTML(employeeName || 'N/A')}</div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Department</div>
            <div style="margin-top: 2px;">
              <span style="display: inline-block; background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; font-size: 12px; padding: 2px 8px; border-radius: 6px;">
                ${escapeHTML(department)}
              </span>
            </div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Report Date</div>
            <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">📅 ${escapeHTML(formattedDate)}</div>
          </div>
        </div>

        <!-- Report Content Sections -->
        <div style="padding: 20px 28px 24px 28px;">
          
          <!-- 1. Targets -->
          <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #1e293b;">
              🎯 Targets for Today (${(targets || []).filter(t => t && t.trim()).length})
            </div>
            <div style="padding: 12px 14px; background-color: #ffffff;">
              ${renderBulletList(targets, brandSecondary, '#ffffff')}
            </div>
          </div>

          <!-- 2. Work Completed -->
          <div style="margin-bottom: 16px; border: 1px solid #cbd5e1; border-left: 4px solid ${brandSecondary}; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #166534;">
              ✅ Work Completed (${(workCompleted || []).filter(w => w && w.trim()).length})
            </div>
            <div style="padding: 12px 14px; background-color: #ffffff;">
              ${renderBulletList(workCompleted, brandSecondary, '#ffffff')}
            </div>
          </div>

          <!-- 3. Results & Findings -->
          <div style="margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #115e59;">
              📊 Results & Key Findings (${(results || []).filter(r => r && r.trim()).length})
            </div>
            <div style="padding: 12px 14px; background-color: #ffffff;">
              ${renderBulletList(results, '#0d9488', '#ffffff')}
            </div>
          </div>

          <!-- 4. Pending Tasks -->
          <div style="margin-bottom: ${notes ? '16px' : '0'}; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #fff7ed; border-bottom: 1px solid #ffedd5; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #9a3412;">
              ⏳ Pending Tasks (${(pendingTasks || []).filter(p => p && p.trim()).length})
            </div>
            <div style="padding: 12px 14px; background-color: #ffffff;">
              ${renderBulletList(pendingTasks, '#ea580c', '#ffffff')}
            </div>
          </div>

          <!-- 5. Additional Notes -->
          ${notes ? `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 14px; font-size: 13px; font-weight: 700; color: #475569;">
                📝 Notes / Comments
              </div>
              <div style="padding: 10px 14px; background-color: #ffffff; font-size: 13px; line-height: 1.5; color: #334155;">
                ${escapeHTML(notes).replace(/\n/g, '<br/>')}
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Footer -->
        <div style="background-color: ${brandDark}; padding: 16px 28px; text-align: center; color: rgba(255,255,255,0.85); font-size: 11px; line-height: 1.5;">
          <strong>${escapeHTML(companyName)} Team Tracker</strong> &bull; Automated Daily Dispatch<br/>
          Report submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
        </div>

      </div>
    </div>
  `;
}
