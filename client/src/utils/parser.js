/**
 * Intelligent Heuristic Text Parser for Work Reports
 * Robustly parses structured, semi-structured, messy WhatsApp/Slack messages,
 * bullet lists, numbered notes, and free-form updates.
 */

export function parseRawReport(rawText) {
  if (!rawText || !rawText.trim()) return null;

  const result = {
    employeeName: '',
    department: '',
    reportDate: '',
    targets: [],
    workCompleted: [],
    results: [],
    pendingTasks: [],
    notes: ''
  };

  // Clean raw text: remove WhatsApp header timestamps e.g. "[25/08/2026, 18:30] Pawan:"
  let cleanedText = rawText
    .replace(/^\[\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}[,\s]+\d{1,2}:\d{2}(?::\d{2})?\s*(?:[AP]M)?\]\s*[^:]+:\s*/gim, '')
    .trim();

  const lines = cleanedText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  let currentSection = null; // 'targets', 'workCompleted', 'results', 'pendingTasks', 'notes'
  const unassignedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    
    // Strip markdown bold asterisks, quotes, emojis from start/end
    const cleanLine = rawLine
      .replace(/^[\*\#\_\~\"\']+|[\*\#\_\~\"\']+$/g, '')
      .replace(/^[👉🔹▪️▫️•\-\*\+\>\✓\✔\⏳\🎯\✅\📊\📝\📌]+\s*/u, '')
      .trim();

    if (!cleanLine) continue;

    // 1. Detect Employee Name
    const nameMatch = cleanLine.match(/^(?:Name|Employee\s*Name|Report\s*By|Sent\s*By|Author)\s*[:=\-]\s*(.+)$/i);
    if (nameMatch) {
      result.employeeName = cleanName(nameMatch[1]);
      continue;
    }

    // 2. Detect Department
    const deptMatch = cleanLine.match(/^(?:Department|Dept|Team|Role)\s*[:=\-]\s*(.+)$/i);
    if (deptMatch) {
      result.department = cleanDepartment(deptMatch[1]);
      continue;
    }

    // 3. Detect Date
    const dateMatch = cleanLine.match(/^(?:Date|Report\s*Date|Day)\s*[:=\-]\s*(.+)$/i);
    if (dateMatch) {
      const parsedDate = tryParseDate(dateMatch[1]);
      if (parsedDate) result.reportDate = parsedDate;
      continue;
    }

    // 4. Fuzzy Match Section Headers
    const lower = cleanLine.toLowerCase().replace(/[:=\-\#\*]/g, '').trim();

    // TARGETS headers
    if (
      lower === 'targets' || lower === 'target' || lower === 'today target' || 
      lower === 'today targets' || lower === 'planned' || lower === 'plan for today' ||
      lower === 'goals' || lower === 'agenda' || lower === 'morning target' ||
      lower === 'to do' || lower === 'todo' || lower === 'tasks planned' ||
      lower === 'objectives' || lower.startsWith('1. target') || lower.startsWith('targets:')
    ) {
      currentSection = 'targets';
      continue;
    }

    // WORK COMPLETED headers
    if (
      lower === 'work completed' || lower === 'completed work' || lower === 'work done' ||
      lower === 'completed' || lower === 'done' || lower === 'tasks completed' ||
      lower === 'tasks done' || lower === 'activities' || lower === 'today completed' ||
      lower === 'what i did' || lower === 'progress' || lower === 'achievements' ||
      lower.startsWith('2. work completed') || lower.startsWith('completed:') || lower.startsWith('work completed:')
    ) {
      currentSection = 'workCompleted';
      continue;
    }

    // RESULTS headers
    if (
      lower === 'results' || lower === 'result' || lower === 'key results' ||
      lower === 'outcomes' || lower === 'outcome' || lower === 'key findings' ||
      lower === 'output' || lower === 'impact' || lower === 'deliverables' ||
      lower === 'status updates' || lower.startsWith('3. results') || lower.startsWith('results:')
    ) {
      currentSection = 'results';
      continue;
    }

    // PENDING TASKS headers
    if (
      lower === 'pending tasks' || lower === 'pending task' || lower === 'pending' ||
      lower === 'pending work' || lower === 'next steps' || lower === 'tomorrow' ||
      lower === 'tomorrow tasks' || lower === 'remaining' || lower === 'remaining tasks' ||
      lower === 'in progress' || lower === 'wip' || lower === 'to be done' ||
      lower === 'follow up' || lower === 'blockers' || lower.startsWith('4. pending') || lower.startsWith('pending:')
    ) {
      currentSection = 'pendingTasks';
      continue;
    }

    // NOTES headers
    if (
      lower === 'notes' || lower === 'note' || lower === 'comments' || 
      lower === 'remarks' || lower === 'additional notes' || lower === 'issues'
    ) {
      currentSection = 'notes';
      continue;
    }

    // 5. Clean up item content
    let itemContent = rawLine
      .replace(/^\[?\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}.*?\]\s*/, '') // strip timestamp
      .replace(/^[\*\#\_\~\"\']+|[\*\#\_\~\"\']+$/g, '')
      .replace(/^[\s\-\*\+\•\>🔹▪️▫️👉✓✔⏳🎯✅📊📝📌]+/, '') // strip bullet markers
      .replace(/^\d+[\.\)\-\:\s]+\s*/, '') // strip numbering 1. 2)
      .replace(/^\*+|\*+$/g, '')
      .trim();

    if (!itemContent) continue;

    // If currently inside a recognized section
    if (currentSection) {
      if (currentSection === 'notes') {
        result.notes = result.notes ? `${result.notes}\n${itemContent}` : itemContent;
      } else if (Array.isArray(result[currentSection])) {
        result[currentSection].push(itemContent);
      }
    } else {
      // Unassigned line (no header found yet)
      unassignedLines.push(itemContent);
    }
  }

  // 6. Heuristic Fallback for Unassigned Lines
  // If the user pasted a list of tasks without any section headers:
  if (unassignedLines.length > 0) {
    for (const item of unassignedLines) {
      const lowerItem = item.toLowerCase();

      // Check for inline name / department if not set
      if (!result.employeeName && (lowerItem.startsWith('name') || lowerItem.startsWith('by '))) {
        result.employeeName = cleanName(item.replace(/^(?:name|by)\s*[:\-]?\s*/i, ''));
        continue;
      }

      // Check if item describes completed work
      if (
        /^(?:completed|done|finished|fixed|resolved|updated|reviewed|investigated|created|implemented|tested|cleaned|checked|deployed|added|removed|verified)\b/i.test(item) ||
        /\b(?:completed|done|resolved|fixed|is ready)\b/i.test(item)
      ) {
        result.workCompleted.push(item);
      }
      // Check if item describes pending/future work
      else if (
        /^(?:pending|remaining|need to|will do|tomorrow|in progress|wip|to finish|to complete|to be done|next)\b/i.test(item) ||
        /\b(?:pending|in progress|remaining|wip)\b/i.test(item)
      ) {
        result.pendingTasks.push(item);
      }
      // Check if item describes results/outcomes
      else if (
        /^(?:result|outcome|output|found that|status|impact)\b/i.test(item) ||
        /\b(?:successfully prepared|working properly|functioning|verified)\b/i.test(item)
      ) {
        result.results.push(item);
      }
      // Otherwise default into Targets
      else {
        result.targets.push(item);
        // If workCompleted is empty, mirror into work completed for convenience
        if (result.workCompleted.length === 0) {
          result.workCompleted.push(item);
        }
      }
    }
  }

  return result;
}

function cleanName(str) {
  if (!str) return '';
  return str.replace(/^[\*\#\_\~\"\']+|[\*\#\_\~\"\']+$/g, '').trim();
}

function cleanDepartment(str) {
  if (!str) return 'IT';
  const clean = str.replace(/^[\*\#\_\~\"\']+|[\*\#\_\~\"\']+$/g, '').trim();
  const lower = clean.toLowerCase();
  if (lower.includes('it') || lower.includes('dev') || lower.includes('software') || lower.includes('tech')) return 'IT';
  if (lower.includes('jewel') || lower.includes('design') || lower.includes('cad')) return 'Jewellery Design';
  if (lower.includes('prod') || lower.includes('invent') || lower.includes('stock')) return 'Production & Inventory';
  if (lower.includes('sale') || lower.includes('biz') || lower.includes('business')) return 'Sales & Business Dev';
  if (lower.includes('market') || lower.includes('seo') || lower.includes('digital')) return 'Digital Marketing';
  if (lower.includes('account') || lower.includes('finance') || lower.includes('ca')) return 'Accounts & Finance';
  if (lower.includes('op') || lower.includes('operat')) return 'Operations';
  if (lower.includes('hr') || lower.includes('human')) return 'Human Resources';
  return clean || 'IT';
}

function tryParseDate(dateStr) {
  if (!dateStr) return '';
  try {
    const clean = dateStr.replace(/^[\*\#\_\~\"\']+|[\*\#\_\~\"\']+$/g, '').trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) return clean;

    const d = new Date(clean);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return '';
}

export function formatReportToPlainText(report) {
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

  let text = `*WORK REPORT*\n\n`;
  text += `*Name: ${employeeName || 'N/A'}*\n`;
  text += `*Department: ${department || 'General'}*\n`;
  text += `*Date: ${reportDate || new Date().toISOString().split('T')[0]}*\n\n`;

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
