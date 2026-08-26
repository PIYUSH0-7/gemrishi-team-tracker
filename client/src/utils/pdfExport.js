import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Escape HTML characters
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
 * Builds the exact HTML email layout for canvas capture
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
      return '<div style="color: #94a3b8; font-style: italic; font-size: 12px; padding: 2px 0;">No items listed.</div>';
    }
    return items.map((item, idx) => `
      <div style="display: flex; align-items: flex-start; gap: 8px; margin-bottom: 5px;">
        <div style="width: 17px; height: 17px; border-radius: 50%; background-color: ${badgeColor}; color: #ffffff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; line-height: 17px; text-align: center;">
          ${idx + 1}
        </div>
        <div style="font-size: 12px; line-height: 1.45; color: #1e293b; flex: 1;">
          ${escapeHTML(item)}
        </div>
      </div>
    `).join('');
  };

  return `
    <div style="width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-sizing: border-box; margin: 0 auto;">
      
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, ${brandDark} 0%, ${brandColor} 50%, ${brandSecondary} 100%); padding: 18px 24px; color: #ffffff; display: flex; align-items: center; justify-content: space-between;">
        <div>
          ${companyLogo ? `
            <img src="${companyLogo}" alt="${escapeHTML(companyName)}" style="max-height: 32px; max-width: 130px; object-fit: contain; margin-bottom: 3px; display: block;" />
          ` : ''}
          <div style="font-size: 20px; font-weight: 800; letter-spacing: 0.3px; margin: 0; line-height: 1.2;">
            ${escapeHTML(companyName)}
          </div>
          <div style="font-size: 10px; color: rgba(255, 255, 255, 0.9); margin-top: 2px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">
            Daily Team Work Report
          </div>
        </div>
        <div>
          <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); color: #ffffff; padding: 4px 10px; border-radius: 14px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255, 255, 255, 0.3);">
            Official Dispatch
          </span>
        </div>
      </div>

      <!-- Employee Info Bar -->
      <div style="padding: 12px 24px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Employee Name</div>
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-top: 1px;">${escapeHTML(employeeName)}</div>
        </div>
        <div>
          <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Department</div>
          <div style="margin-top: 1px;">
            <span style="background-color: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; font-weight: 600; font-size: 11px; padding: 1px 7px; border-radius: 5px;">
              ${escapeHTML(department)}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">Report Date</div>
          <div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 1px;">📅 ${escapeHTML(formattedDate)}</div>
        </div>
      </div>

      <!-- Content Sections -->
      <div style="padding: 14px 24px 18px 24px;">
        
        <!-- Targets -->
        <div style="margin-bottom: 11px; border: 1px solid #e2e8f0; border-radius: 7px; overflow: hidden;">
          <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #1e293b;">
            🎯 Targets for Today (${targets.length})
          </div>
          <div style="padding: 8px 10px; background-color: #ffffff;">
            ${renderBullets(targets, brandSecondary)}
          </div>
        </div>

        <!-- Work Completed -->
        <div style="margin-bottom: 11px; border: 1px solid #cbd5e1; border-left: 4px solid ${brandSecondary}; border-radius: 7px; overflow: hidden;">
          <div style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #166534;">
            ✅ Work Completed (${workCompleted.length})
          </div>
          <div style="padding: 8px 10px; background-color: #ffffff;">
            ${renderBullets(workCompleted, brandSecondary)}
          </div>
        </div>

        <!-- Results -->
        <div style="margin-bottom: 11px; border: 1px solid #e2e8f0; border-radius: 7px; overflow: hidden;">
          <div style="background-color: #f0fdfa; border-bottom: 1px solid #99f6e4; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #115e59;">
            📊 Results & Key Findings (${results.length})
          </div>
          <div style="padding: 8px 10px; background-color: #ffffff;">
            ${renderBullets(results, '#0d9488')}
          </div>
        </div>

        <!-- Pending Tasks -->
        <div style="margin-bottom: ${notes ? '11px' : '0'}; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 7px; overflow: hidden;">
          <div style="background-color: #fff7ed; border-bottom: 1px solid #ffedd5; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #9a3412;">
            ⏳ Pending Tasks (${pendingTasks.length})
          </div>
          <div style="padding: 8px 10px; background-color: #ffffff;">
            ${renderBullets(pendingTasks, '#ea580c')}
          </div>
        </div>

        <!-- Additional Notes -->
        ${notes ? `
          <div style="border: 1px solid #e2e8f0; border-radius: 7px; overflow: hidden;">
            <div style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 5px 10px; font-size: 11px; font-weight: 700; color: #475569;">
              📝 Notes / Comments
            </div>
            <div style="padding: 8px 10px; background-color: #ffffff; font-size: 11px; line-height: 1.4; color: #334155;">
              ${escapeHTML(notes).replace(/\n/g, '<br/>')}
            </div>
          </div>
        ` : ''}

      </div>

      <!-- Footer -->
      <div style="background-color: ${brandDark}; padding: 12px 24px; text-align: center; color: rgba(255,255,255,0.9); font-size: 10px; line-height: 1.35;">
        <strong>${escapeHTML(companyName)} Team Tracker</strong> &bull; Automated Daily Dispatch<br/>
        Report submitted by ${escapeHTML(employeeName)} (${escapeHTML(department)}) on ${escapeHTML(formattedDate)}
      </div>

    </div>
  `;
}

/**
 * Fallback direct vector PDF generator
 */
function generateFallbackPDF(report, branding) {
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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Header Banner
  doc.setFillColor(34, 73, 56);
  doc.rect(10, 10, 190, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${companyName} - Daily Work Report`, 15, 22);

  // Info Row
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employee: ${employeeName}`, 15, 37);
  doc.text(`Department: ${department}`, 85, 37);
  doc.text(`Date: ${reportDate}`, 150, 37);

  doc.setDrawColor(226, 232, 240);
  doc.line(10, 42, 200, 42);

  let y = 50;

  const renderSection = (title, items) => {
    if (y > 260) return;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(34, 73, 56);
    doc.text(title, 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);

    if (!items || items.length === 0) {
      doc.text('- None listed', 18, y);
      y += 5;
    } else {
      items.forEach((item, idx) => {
        if (y > 275) return;
        const text = `${idx + 1}. ${item}`;
        const splitText = doc.splitTextToSize(text, 175);
        doc.text(splitText, 18, y);
        y += splitText.length * 4.5;
      });
    }
    y += 4;
  };

  renderSection(`🎯 Targets for Today (${targets.length})`, targets);
  renderSection(`✅ Work Completed (${workCompleted.length})`, workCompleted);
  renderSection(`📊 Results & Key Findings (${results.length})`, results);
  renderSection(`⏳ Pending Tasks (${pendingTasks.length})`, pendingTasks);

  if (notes && y < 270) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('📝 Notes / Comments', 15, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(notes, 175);
    doc.text(splitNotes, 18, y);
  }

  const safeDate = (reportDate || '2026-08-26').replace(/[^0-9\-]/g, '_');
  const safeName = (employeeName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Work_Report_${safeDate}_${safeName}.pdf`;

  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  }, 1500);
}

/**
 * Downloads the report as a crystal-sharp, guaranteed 1-PAGE PDF
 */
export async function downloadReportEmailPDF(report, customBranding = null) {
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

  // 1. Create temporary off-screen container in DOM
  const container = document.createElement('div');
  container.id = 'pdf-render-offscreen';
  container.style.position = 'fixed';
  container.style.top = '0px';
  container.style.left = '0px';
  container.style.width = '620px';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.pointerEvents = 'none';
  container.style.opacity = '1';

  container.innerHTML = buildEmailHtmlLayout(report, branding);
  document.body.appendChild(container);

  try {
    // Brief render wait
    await new Promise(r => setTimeout(r, 180));

    // 2. High-resolution canvas capture with timeout safeguard
    const canvasPromise = html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollY: 0,
      scrollX: 0
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Canvas render timeout')), 5000)
    );

    const canvas = await Promise.race([canvasPromise, timeoutPromise]);

    // 3. Convert to JPEG image
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

    // Ensure it strictly fits on 1 page without overflowing
    if (printHeight > maxPrintHeight) {
      printHeight = maxPrintHeight;
      printWidth = printHeight * imgRatio;
    }

    // Center horizontally
    const xOffset = (pageWidth - printWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, 'JPEG', xOffset, yOffset, printWidth, printHeight, undefined, 'FAST');

    // 5. Generate clean filename
    const safeDate = (report.reportDate || new Date().toISOString().split('T')[0]).replace(/[^0-9\-]/g, '_');
    const safeName = (report.employeeName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Work_Report_${safeDate}_${safeName}.pdf`;

    // 6. Direct Cross-Platform Blob Download
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    return true;
  } catch (err) {
    console.warn('Canvas PDF export warning, falling back to direct vector PDF generator:', err.message);
    generateFallbackPDF(report, branding);
    return true;
  } finally {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
