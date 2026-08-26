import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Helper to escape HTML characters
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

/**
 * Adjust hex color brightness
 */
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

/**
 * Builds the exact HTML email card layout for rendering to canvas
 */
function buildEmailHtmlLayout(report, branding = {}) {
  const {
    employeeName = 'Employee',
    department = 'General',
    reportDate = new Date().toISOString().split('T')[0],
    targets = [],
    workCompleted = [],
    results = [],
    pendingTasks = [],
    notes = ''
  } = report;

  const companyName = branding.companyName || 'GemRishi';
  const companyLogo = branding.companyLogo || '';
  const brandColor = branding.brandColor || '#224938';
  const brandSecondary = branding.brandSecondaryColor || adjustHex(brandColor, 20);
  const brandDark = adjustHex(brandColor, -25);

  let formattedDate = reportDate;
  try {
    const d = new Date(reportDate);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  } catch (e) {}

  const renderBullets = (items, badgeColor = brandSecondary) => {
    if (!items || items.length === 0) {
      return '<div style="color: #94a3b8; font-style: italic; font-size: 13px; padding: 4px 0;">No items listed.</div>';
    }
    return items.map((item, idx) => `
      <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
        <div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${badgeColor}; color: #ffffff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 18px; text-align: center;">
          ${idx + 1}
        </div>
        <div style="font-size: 13px; line-height: 1.5; color: #1e293b; flex: 1;">
          ${escapeHTML(item)}
        </div>
      </div>
    `).join('');
  };

  return `
    <div style="width: 640px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box;">
      
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, ${brandDark} 0%, ${brandColor} 50%, ${brandSecondary} 100%); padding: 22px 28px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
        <div>
          ${companyLogo ? `
            <img src="${companyLogo}" alt="${escapeHTML(companyName)}" style="max-height: 36px; max-width: 140px; object-fit: contain; margin-bottom: 4px; display: block; filter: brightness(0) invert(1);" />
          ` : ''}
          <div style="font-size: 22px; font-weight: 800; letter-spacing: 0.3px; margin: 0; line-height: 1.2;">
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

      <!-- Employee Info Bar -->
      <div style="padding: 16px 28px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Employee Name</div>
          <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHTML(employeeName)}</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Department</div>
          <div style="margin-top: 2px;">
            <span style="background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; font-size: 12px; padding: 2px 8px; border-radius: 6px;">
              ${escapeHTML(department)}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Report Date</div>
          <div style="font-size: 13px; font-weight: 600; color: #334155; margin-top: 2px;">📅 ${escapeHTML(formattedDate)}</div>
        </div>
      </div>

      <!-- Content Sections -->
      <div style="padding: 18px 28px 22px 28px;">
        
        <!-- Targets -->
        <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #1e293b;">
            🎯 Targets for Today (${targets.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBullets(targets, brandSecondary)}
          </div>
        </div>

        <!-- Work Completed -->
        <div style="margin-bottom: 14px; border: 1px solid #cbd5e1; border-left: 4px solid ${brandSecondary}; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #166534;">
            ✅ Work Completed (${workCompleted.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBullets(workCompleted, brandSecondary)}
          </div>
        </div>

        <!-- Results -->
        <div style="margin-bottom: 14px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #115e59;">
            📊 Results & Key Findings (${results.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBullets(results, '#0d9488')}
          </div>
        </div>

        <!-- Pending Tasks -->
        <div style="margin-bottom: ${notes ? '14px' : '0'}; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #fff7ed; border-bottom: 1px solid #ffedd5; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #9a3412;">
            ⏳ Pending Tasks (${pendingTasks.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBullets(pendingTasks, '#ea580c')}
          </div>
        </div>

        <!-- Additional Notes -->
        ${notes ? `
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 7px 12px; font-size: 12px; font-weight: 700; color: #475569;">
              📝 Notes / Comments
            </div>
            <div style="padding: 10px 12px; background-color: #ffffff; font-size: 12px; line-height: 1.5; color: #334155;">
              ${escapeHTML(notes).replace(/\n/g, '<br/>')}
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Footer -->
      <div style="background-color: ${brandDark}; padding: 14px 28px; text-align: center; color: rgba(255,255,255,0.85); font-size: 11px; line-height: 1.4;">
        <strong>${escapeHTML(companyName)} Team Tracker</strong> &bull; Automated Daily Dispatch<br/>
        Report submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
      </div>

    </div>
  `;
}

/**
 * Downloads the report as a beautiful, crystal-sharp, guaranteed 1-PAGE PDF
 */
export async function downloadReportEmailPDF(report, customBranding = null) {
  // Sourced branding from localStorage if not provided
  let branding = customBranding;
  if (!branding) {
    try {
      const saved = localStorage.getItem('gemrishi_branding');
      if (saved) branding = JSON.parse(saved);
    } catch (e) {}
  }
  branding = branding || {
    companyName: 'GemRishi',
    brandColor: '#224938',
    brandSecondaryColor: '#059669',
    companyLogo: ''
  };

  // 1. Create off-screen container in DOM
  const container = document.createElement('div');
  container.id = 'pdf-render-offscreen';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.opacity = '0.01';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-99999';
  container.style.width = '640px';
  container.style.backgroundColor = '#ffffff';

  container.innerHTML = buildEmailHtmlLayout(report, branding);
  document.body.appendChild(container);

  try {
    // Wait for fonts & images to render
    await new Promise(r => setTimeout(r, 120));

    // 2. High-resolution canvas capture
    const canvas = await html2canvas(container, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    // 3. Convert canvas to high-quality image
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 4. Create Single-Page A4 Portrait PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 8; // 8mm margins
    const maxPrintWidth = pageWidth - (margin * 2); // 194mm
    const maxPrintHeight = pageHeight - (margin * 2); // 281mm

    const imgRatio = canvas.width / canvas.height;
    let printWidth = maxPrintWidth;
    let printHeight = printWidth / imgRatio;

    // Ensure it strictly fits on 1 page without spilling
    if (printHeight > maxPrintHeight) {
      printHeight = maxPrintHeight;
      printWidth = printHeight * imgRatio;
    }

    // Center horizontally
    const xOffset = (pageWidth - printWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, printWidth, printHeight, undefined, 'FAST');

    // 5. Generate clean filename with Date
    const safeDate = (report.reportDate || new Date().toISOString().split('T')[0]).replace(/[^0-9\-]/g, '_');
    const safeName = (report.employeeName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Work_Report_${safeDate}_${safeName}.pdf`;

    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Single-Page PDF Export Error:', err);
    throw err;
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
