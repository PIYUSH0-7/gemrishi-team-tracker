/**
 * Smart Text Parser for Work Reports
 * Can parse structured formats like:
 * *WORK REPORT*
 * *Name: Pawan Gangwar*
 * *Department: IT*
 * *Date: 25 August 2026*
 * *Targets*
 * * Target 1
 * *Work Completed*
 * * Completed 1
 * *Results*
 * * Result 1
 * *Pending Tasks*
 * * Pending 1
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

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentSection = null; // 'targets', 'workCompleted', 'results', 'pendingTasks', 'notes'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^\*+|\*+$/g, '').trim();

    // Check for Name
    const nameMatch = cleanLine.match(/^(?:Name|Employee\s*Name)\s*:\s*(.+)$/i);
    if (nameMatch) {
      result.employeeName = nameMatch[1].replace(/^\*+|\*+$/g, '').trim();
      continue;
    }

    // Check for Department
    const deptMatch = cleanLine.match(/^(?:Department|Dept)\s*:\s*(.+)$/i);
    if (deptMatch) {
      result.department = deptMatch[1].replace(/^\*+|\*+$/g, '').trim();
      continue;
    }

    // Check for Date
    const dateMatch = cleanLine.match(/^(?:Date)\s*:\s*(.+)$/i);
    if (dateMatch) {
      const rawDateStr = dateMatch[1].replace(/^\*+|\*+$/g, '').trim();
      const parsedDate = tryParseDate(rawDateStr);
      if (parsedDate) {
        result.reportDate = parsedDate;
      }
      continue;
    }

    // Check for Section Headers
    const lowerClean = cleanLine.toLowerCase();

    if (lowerClean === 'targets' || lowerClean.startsWith('target') || lowerClean.includes('today target') || lowerClean.includes('plan for today')) {
      currentSection = 'targets';
      continue;
    }
    if (lowerClean === 'work completed' || lowerClean === 'completed work' || lowerClean === 'tasks completed' || lowerClean === 'completed' || lowerClean === 'work done') {
      currentSection = 'workCompleted';
      continue;
    }
    if (lowerClean === 'results' || lowerClean === 'result' || lowerClean === 'outcomes' || lowerClean === 'key findings') {
      currentSection = 'results';
      continue;
    }
    if (lowerClean === 'pending tasks' || lowerClean === 'pending task' || lowerClean === 'pending' || lowerClean === 'next steps' || lowerClean === 'remaining tasks') {
      currentSection = 'pendingTasks';
      continue;
    }
    if (lowerClean === 'notes' || lowerClean === 'comments' || lowerClean === 'additional notes') {
      currentSection = 'notes';
      continue;
    }

    // Process bullet items under active section
    if (currentSection) {
      // Remove leading bullet characters: *, -, +, •, numbers (1., 1), etc.
      let itemText = line.replace(/^[\*\-\+•\>\s]+/, '');
      itemText = itemText.replace(/^\d+[\.\)\-\s]+/, '');
      itemText = itemText.replace(/^\*+|\*+$/g, '').trim();

      if (itemText) {
        if (currentSection === 'notes') {
          result.notes = result.notes ? `${result.notes}\n${itemText}` : itemText;
        } else if (Array.isArray(result[currentSection])) {
          result[currentSection].push(itemText);
        }
      }
    }
  }

  return result;
}

function tryParseDate(dateStr) {
  if (!dateStr) return '';
  try {
    // If it's already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Ignore error
  }
  return '';
}

export function formatReportToPlainText(report, companyName = 'GemRishi') {
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
