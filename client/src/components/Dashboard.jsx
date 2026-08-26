import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  User, 
  FileCheck, 
  Clock, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Eye, 
  Send, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Mail,
  Grid,
  List,
  Check,
  Plus
} from 'lucide-react';
import ReportDetailModal from './ReportDetailModal';

export default function Dashboard({ onNewReportClick, showToast, departments = [] }) {
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'custom'
  const [customDate, setCustomDate] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Selected report for modal
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch reports & analytics
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/api/reports?search=${encodeURIComponent(searchQuery)}`;
      if (selectedDept !== 'All') {
        url += `&department=${encodeURIComponent(selectedDept)}`;
      }

      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        url += `&date=${today}`;
      } else if (dateFilter === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        const yesterday = d.toISOString().split('T')[0];
        url += `&date=${yesterday}`;
      } else if (dateFilter === 'custom' && customDate) {
        url += `&date=${customDate}`;
      }

      const [reportsRes, analyticsRes] = await Promise.all([
        fetch(url),
        fetch('/api/analytics')
      ]);

      const reportsData = await reportsRes.json();
      const analyticsData = await analyticsRes.json();

      setReports(reportsData.reports || []);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to load dashboard reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedDept, dateFilter, customDate]);

  // Resend email handler
  const handleResendEmail = async (reportId, targetEmail = null) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Email successfully resent!', 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to resend email', 'error');
      }
    } catch (err) {
      showToast('Network error while sending email', 'error');
    }
  };

  // Delete report handler
  const handleDeleteReport = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Report deleted', 'info');
        fetchData();
      } else {
        showToast('Failed to delete report', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (reports.length === 0) {
      showToast('No reports to export', 'info');
      return;
    }

    const headers = ['Report ID', 'Date', 'Employee Name', 'Department', 'Targets', 'Work Completed', 'Results', 'Pending Tasks', 'Notes', 'Email Status'];
    const rows = reports.map(r => [
      `"${r.id}"`,
      `"${r.reportDate}"`,
      `"${r.employeeName}"`,
      `"${r.department}"`,
      `"${(r.targets || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.workCompleted || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.results || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.pendingTasks || []).join('; ').replace(/"/g, '""')}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      `"${r.emailStatus || 'pending'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GemRishi_Work_Reports_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported reports to CSV!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1b3d2f] to-[#224938] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-800/40">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider rounded-full border border-emerald-400/30">
              Manager Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
            Team Work Reports & Submissions
          </h1>
          <p className="text-sm text-emerald-100/90 mt-1">
            Review daily work logs, inspect completed tasks, export data, and track email dispatch status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchData}
            title="Refresh submissions"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onNewReportClick}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Today's Reports</span>
              <span className="text-2xl font-extrabold text-slate-900">{analytics.todayReportsCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-100 text-teal-800 rounded-xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Team Members</span>
              <span className="text-2xl font-extrabold text-slate-900">{analytics.uniqueEmployees}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Tasks Completed</span>
              <span className="text-2xl font-extrabold text-emerald-700">{analytics.totalCompletedTasks}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block">Pending Tasks</span>
              <span className="text-2xl font-extrabold text-amber-700">{analytics.totalPendingTasks}</span>
            </div>
          </div>

        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, department, task keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Date Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => { setDateFilter('all'); setCustomDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Dates
            </button>

            <button
              onClick={() => { setDateFilter('today'); setCustomDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => { setDateFilter('yesterday'); setCustomDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                dateFilter === 'yesterday'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Yesterday
            </button>

            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setDateFilter('custom');
                }}
                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'cards' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-2xs mr-1 shrink-0">
            Department:
          </span>
          <button
            onClick={() => setSelectedDept('All')}
            className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
              selectedDept === 'All'
                ? 'bg-[#224938] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                selectedDept === dept
                  ? 'bg-[#224938] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

      </div>

      {/* Reports List / Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <FileCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 m-0">No Reports Found</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedDept !== 'All' || dateFilter !== 'all'
              ? 'No reports match your selected filters. Try clearing your search query or date filter.'
              : 'No daily work reports have been submitted yet. Submit the first one now!'}
          </p>
          <button
            type="button"
            onClick={onNewReportClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Submit Daily Report
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                
                {/* Card Top Banner */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors m-0">
                        {report.employeeName}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-2xs rounded-full border border-emerald-300">
                        {report.department}
                      </span>
                    </div>

                    <span className="text-xs font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      📅 {report.reportDate}
                    </span>
                  </div>

                  {/* Email Delivery Status Badge */}
                  <div className="flex items-center gap-1.5 mt-2 text-2xs font-semibold">
                    {report.emailStatus === 'sent' && (
                      <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Emailed to Manager
                      </span>
                    )}
                    {report.emailStatus === 'preview_only' && (
                      <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <Mail className="w-3 h-3 text-sky-600" />
                        Saved (SMTP Not Setup)
                      </span>
                    )}
                    {report.emailStatus === 'failed' && (
                      <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Email Failed
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Highlights */}
                <div className="p-5 space-y-3 text-xs">
                  
                  {/* Targets preview */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Targets ({report.targets?.length || 0})
                    </span>
                    <p className="text-slate-600 line-clamp-2 m-0">
                      {report.targets?.length > 0 ? report.targets[0] : '(No targets)'}
                      {report.targets?.length > 1 && ` +${report.targets.length - 1} more`}
                    </p>
                  </div>

                  {/* Work Completed preview */}
                  <div>
                    <span className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      Completed ({report.workCompleted?.length || 0})
                    </span>
                    <p className="text-slate-600 line-clamp-2 m-0 font-medium">
                      {report.workCompleted?.length > 0 ? report.workCompleted[0] : '(No work recorded)'}
                      {report.workCompleted?.length > 1 && ` +${report.workCompleted.length - 1} more`}
                    </p>
                  </div>

                  {/* Pending preview */}
                  {report.pendingTasks?.length > 0 && (
                    <div>
                      <span className="font-bold text-amber-800 block mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Pending ({report.pendingTasks.length})
                      </span>
                      <p className="text-amber-700 line-clamp-1 m-0">
                        {report.pendingTasks[0]}
                      </p>
                    </div>
                  )}

                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(report)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Full
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleResendEmail(report.id)}
                    title="Resend email to manager"
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteReport(report.id)}
                    title="Delete report"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      ) : (
        
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-2xs tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Targets</th>
                  <th className="py-3 px-4">Work Completed</th>
                  <th className="py-3 px-4">Pending</th>
                  <th className="py-3 px-4">Email Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {report.reportDate}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {report.employeeName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-2xs">
                        {report.department}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {report.targets?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-medium text-emerald-700">
                      {report.workCompleted?.length || 0} items
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-700">
                      {report.pendingTasks?.length || 0} items
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {report.emailStatus === 'sent' && (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                          Emailed
                        </span>
                      )}
                      {report.emailStatus === 'preview_only' && (
                        <span className="text-sky-700 bg-sky-50 px-2 py-0.5 rounded font-bold border border-sky-200">
                          Saved
                        </span>
                      )}
                      {report.emailStatus === 'failed' && (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleResendEmail(report.id)}
                          title="Resend email"
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded hover:bg-slate-100"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* Detail Modal */}
      <ReportDetailModal
        isOpen={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onResendEmail={handleResendEmail}
        onDeleteReport={handleDeleteReport}
        showToast={showToast}
      />

    </div>
  );
}
