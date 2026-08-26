import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

/**
 * Builds the standalone email HTML layout for PDF rendering
 */
export function buildEmailHtmlLayout(report, companyName = 'GemRishi') {
  const {
    employeeName = '',
    department = '',
    reportDate = '',
    submittedAt = new Date().toISOString(),
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
    const validItems = Array.isArray(items) ? items.filter(t => t && t.trim()) : [];
    if (validItems.length === 0) {
      return `<p style="margin: 0; color: #94a3b8; font-style: italic; font-size: 12px;">No items listed.</p>`;
    }
    return `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; width: 100%;">
        ${validItems.map((item, idx) => `
          <tr>
            <td valign="top" style="width: 22px; padding: 4px 0; vertical-align: top;">
              <div style="width: 17px; height: 17px; background-color: ${bulletBg}; color: ${bulletColor}; border-radius: 50%; text-align: center; line-height: 17px; font-size: 10px; font-weight: bold;">
                ${idx + 1}
              </div>
            </td>
            <td valign="top" style="padding: 4px 0 4px 8px; font-size: 13px; line-height: 1.5; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ${escapeHTML(item)}
            </td>
          </tr>
        `).join('')}
      </table>
    `;
  };

  const cleanTargets = Array.isArray(targets) ? targets.filter(t => t && t.trim()) : [];
  const cleanCompleted = Array.isArray(workCompleted) ? workCompleted.filter(w => w && w.trim()) : [];
  const cleanResults = Array.isArray(results) ? results.filter(r => r && r.trim()) : [];
  const cleanPending = Array.isArray(pendingTasks) ? pendingTasks.filter(p => p && p.trim()) : [];

  return `
    <div style="width: 620px; max-width: 620px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-sizing: border-box;">
      
      <!-- BRAND HEADER -->
      <div style="background: linear-gradient(135deg, #1b3d2f 0%, #224938 50%, #059669 100%); padding: 22px 26px; text-align: left; color: #ffffff;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td>
              <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px; margin: 0;">
                💎 ${escapeHTML(companyName)}
              </div>
              <div style="font-size: 11px; color: #a7f3d0; margin-top: 3px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                Daily Team Work Tracker & Dispatch
              </div>
            </td>
            <td align="right" valign="middle">
              <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3);">
                Official Report
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- EMPLOYEE INFO BANNER -->
      <div style="padding: 16px 26px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td valign="top" style="width: 38%;">
              <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                Employee Name
              </div>
              <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 2px;">
                ${escapeHTML(employeeName || 'Pawan Gangwar')}
              </div>
            </td>
            <td valign="top" style="width: 32%;">
              <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                Department
              </div>
              <div style="margin-top: 2px;">
                <span style="display: inline-block; background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 6px;">
                  🏢 ${escapeHTML(department || 'IT')}
                </span>
              </div>
            </td>
            <td valign="top" style="width: 30%;">
              <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">
                Date & Time
              </div>
              <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px;">
                📅 ${escapeHTML(formattedDate)}
              </div>
              ${formattedTime ? `<div style="font-size: 10px; color: #64748b; margin-top: 1px;">🕒 ${formattedTime}</div>` : ''}
            </td>
          </tr>
        </table>
      </div>

      <!-- REPORT SECTIONS -->
      <div style="padding: 20px 26px;">
        
        <!-- 1. TARGETS -->
        <div style="margin-bottom: 16px; border: 1px solid #bbf7d0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 8px 12px; font-size: 13px; font-weight: 700; color: #166534;">
            🎯 Targets Planned (${cleanTargets.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBulletList(cleanTargets, '#10b981', '#ffffff')}
          </div>
        </div>

        <!-- 2. WORK COMPLETED -->
        <div style="margin-bottom: 16px; border: 1px solid #a7f3d0; border-left: 4px solid #059669; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #ecfdf5; border-bottom: 1px solid #a7f3d0; padding: 8px 12px; font-size: 13px; font-weight: 700; color: #065f46;">
            ✅ Work Completed (${cleanCompleted.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBulletList(cleanCompleted, '#059669', '#ffffff')}
          </div>
        </div>

        <!-- 3. RESULTS -->
        <div style="margin-bottom: 16px; border: 1px solid #99f6e4; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 8px 12px; font-size: 13px; font-weight: 700; color: #115e59;">
            📊 Key Results & Outcomes (${cleanResults.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBulletList(cleanResults, '#0d9488', '#ffffff')}
          </div>
        </div>

        <!-- 4. PENDING TASKS -->
        <div style="margin-bottom: ${notes ? '16px' : '0'}; border: 1px solid ${cleanPending.length > 0 ? '#fed7aa' : '#e2e8f0'}; border-left: 4px solid ${cleanPending.length > 0 ? '#f97316' : '#94a3b8'}; border-radius: 8px; overflow: hidden;">
          <div style="background-color: ${cleanPending.length > 0 ? '#fff7ed' : '#f8fafc'}; border-bottom: 1px solid ${cleanPending.length > 0 ? '#ffedd5' : '#e2e8f0'}; padding: 8px 12px; font-size: 13px; font-weight: 700; color: ${cleanPending.length > 0 ? '#9a3412' : '#475569'};">
            ⏳ Pending Tasks & Next Steps (${cleanPending.length})
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff;">
            ${renderBulletList(cleanPending, cleanPending.length > 0 ? '#ea580c' : '#64748b', '#ffffff')}
          </div>
        </div>

        <!-- 5. NOTES -->
        ${notes ? `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 16px;">
          <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 8px 12px; font-size: 12px; font-weight: 700; color: #475569;">
            📝 Notes / Comments
          </div>
          <div style="padding: 10px 12px; background-color: #ffffff; font-size: 12px; line-height: 1.5; color: #334155;">
            ${escapeHTML(notes).replace(/\n/g, '<br/>')}
          </div>
        </div>
        ` : ''}

      </div>

      <!-- FOOTER -->
      <div style="background-color: #1b3d2f; padding: 14px 26px; text-align: center; border-top: 1px solid #132a20; font-size: 10px; color: #a7f3d0; line-height: 1.5;">
        <strong>${escapeHTML(companyName)} Team Work Tracker</strong> &bull; Automated Daily Dispatch<br/>
        Submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
      </div>

    </div>
  `;
}

/**
 * Robust cross-platform PDF generator that works reliably on both Desktop and Mobile devices.
 * Generates filename with Date and Employee Name: Work_Report_YYYY-MM-DD_Name.pdf
 */
export async function downloadReportEmailPDF(report, customFilename = null) {
  const safeDate = (report.reportDate || new Date().toISOString().split('T')[0]).trim();
  const safeName = (report.employeeName || 'Report').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Format with date as name: Work_Report_2026-08-26_Pawan_Gangwar.pdf
  const filename = customFilename || `Work_Report_${safeDate}_${safeName}.pdf`;

  // Create temporary container placed visibly in layout but transparent so html2canvas renders perfectly on mobile
  const container = document.createElement('div');
  container.id = 'temp-pdf-render-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '620px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-99999';
  container.style.opacity = '0.01'; // slight opacity prevents browser discarding render tree
  container.style.pointerEvents = 'none';
  container.innerHTML = buildEmailHtmlLayout(report, 'GemRishi');

  document.body.appendChild(container);

  // Short delay to ensure DOM paint
  await new Promise(resolve => setTimeout(resolve, 80));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
      windowHeight: 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale canvas image to fit A4 width nicely with margins
    const margin = 10;
    const renderWidth = pdfWidth - (margin * 2);
    const renderHeight = (canvas.height * renderWidth) / canvas.width;

    let heightLeft = renderHeight;
    let position = margin;

    // Add first page
    pdf.addImage(imgData, 'JPEG', margin, position, renderWidth, renderHeight);
    heightLeft -= (pdfHeight - margin * 2);

    // Add extra pages if needed
    while (heightLeft > 0) {
      position = heightLeft - renderHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, renderWidth, renderHeight);
      heightLeft -= (pdfHeight - margin * 2);
    }

    // Cross-platform mobile-friendly Blob download
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      if (document.body.contains(downloadLink)) {
        document.body.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    return true;
  } catch (err) {
    console.error('Error generating PDF with html2canvas:', err);
    // Fallback: direct print dialog
    window.print();
    return false;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
