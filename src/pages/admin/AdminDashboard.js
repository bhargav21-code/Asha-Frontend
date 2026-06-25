import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, PageHeader, Modal } from '../../components/common/UI';
import { useLang } from '../../context/LanguageContext';
import api from '../../utils/api';

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function SummaryCard({ label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-100 text-blue-700',
    green:  'bg-green-50 border-green-100 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <p className="text-3xl font-bold">{value ?? 0}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}

// ── Worker Report Card ─────────────────────────────────────────────────────────
function WorkerCard({ card, onViewReport }) {
  const { worker, report, submitted } = card;
  const village = worker.assigned_villages?.[0] || report?.village || '—';

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 transition-all hover:shadow-md ${
      submitted ? 'border-green-200 border-l-4 border-l-green-500' : 'border-gray-200 border-l-4 border-l-yellow-400'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${
            submitted ? 'bg-green-600' : 'bg-yellow-500'
          }`}>
            {worker.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{worker.name}</p>
            <p className="text-xs text-gray-500">👩‍⚕️ ASHA Worker</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
          submitted
            ? 'bg-green-100 text-green-700 border-green-200'
            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
        }`}>
          {submitted ? '✅ Submitted' : '⏳ Pending'}
        </span>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span className="font-medium">{village}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📅</span>
          <span>{submitted ? fmtDate(report?.date) : 'Report Pending'}</span>
        </div>
      </div>

      {/* Stats row — only if report submitted */}
      {submitted ? (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ['🏠', report.homes_visited,    'Homes'],
            ['🤰', report.pregnant_visited, 'Pregnant'],
            ['👶', report.children_checked, 'Children'],
          ].map(([icon, val, label]) => (
            <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
              <p className="text-base font-bold text-gray-800">{val ?? 0}</p>
              <p className="text-xs text-gray-500">{icon} {label}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg px-3 py-2 mb-4 text-center">
          <p className="text-xs text-yellow-700">No report submitted today</p>
        </div>
      )}

      {/* View Report button */}
      {submitted && (
        <button
          onClick={() => onViewReport(card)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          View Report →
        </button>
      )}
      {!submitted && (
        <div className="w-full py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg text-center cursor-not-allowed">
          Awaiting Submission
        </div>
      )}
    </div>
  );
}

// ── Report Detail Modal ────────────────────────────────────────────────────────
function ReportDetailModal({ card, open, onClose }) {
  const { worker, report } = card || {};

  const printReport = () => window.print();

  if (!card) return null;

  return (
    <Modal open={open} onClose={onClose} title="Daily Activity Report">
      {report ? (
        <div className="space-y-5" id="print-report">
          {/* Worker + Date header */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {worker?.name?.[0]}
              </div>
              <div>
                <p className="font-bold text-gray-900">{worker?.name}</p>
                <p className="text-xs text-gray-500">ASHA Worker</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Village:</span> <span className="font-medium">{report.village}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{fmtDate(report.date)}</span></div>
            </div>
          </div>

          {/* Daily Activity Summary */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Daily Activity Summary</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['🏠', 'Homes Visited',          report.homes_visited],
                ['🤰', 'Pregnant Women Visited',  report.pregnant_visited],
                ['👶', 'Children Checked',        report.children_checked],
                ['🏥', 'Referrals Made',          report.referrals_made],
                ['📢', 'Sessions Conducted',      report.sessions_conducted],
              ].map(([icon, label, val]) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{val ?? 0}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Remarks */}
          {report.notes && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes & Remarks</p>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-gray-700">
                {report.notes}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                🖨️ Print Report
              </button>
              <button
                onClick={() => {
                  const text = `ASHA Report - ${worker?.name}\nVillage: ${report.village}\nDate: ${fmtDate(report.date)}\nHomes: ${report.homes_visited}\nPregnant: ${report.pregnant_visited}\nChildren: ${report.children_checked}\nReferrals: ${report.referrals_made}\nSessions: ${report.sessions_conducted}\nNotes: ${report.notes || '—'}`;
                  const blob = new Blob([text], { type: 'text/plain' });
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement('a');
                  a.href = url; a.download = `ASHA_Report_${worker?.name}_${fmtDate(report.date)}.txt`;
                  a.click(); URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                ⬇️ Download
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                ✅ Mark Reviewed
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-8">No report available</p>
      )}
    </Modal>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { t } = useLang();

  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showDetail, setShowDetail]     = useState(false);

  // Filters
  const [filterDate,    setFilterDate]    = useState(new Date().toISOString().split('T')[0]);
  const [filterVillage, setFilterVillage] = useState('');
  const [filterStatus,  setFilterStatus]  = useState('');
  const [search,        setSearch]        = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterDate)    params.date    = filterDate;
      if (filterVillage) params.village = filterVillage;
      if (filterStatus)  params.status  = filterStatus;
      if (search)        params.search  = search;
      const r = await api.get('/admin/daily-reports-dashboard', { params });
      setData(r.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterVillage, filterStatus, search]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const openDetail = (card) => { setSelectedCard(card); setShowDetail(true); };

  const summary = data?.summary || {};
  const cards   = data?.cards   || [];

  // Collect unique villages from cards for filter dropdown
  const villages = [...new Set(
    cards.flatMap(c => c.worker.assigned_villages || []).filter(Boolean)
  )].sort();

  return (
    <div>
      <PageHeader
        title={`📊 ${t('dailyReports')}`}
        subtitle={`Real-time monitoring · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <SummaryCard label={t('totalWorkers')}  value={summary.total_workers}     color="blue"   />
        <SummaryCard label={t('submitted')}     value={summary.reports_submitted} color="green"  />
        <SummaryCard label={t('pending')}       value={summary.reports_pending}   color="yellow" />
        <SummaryCard label={t('reviewed')}      value={summary.reports_reviewed}  color="purple" />
      </div>

      {/* Submission Progress Bar */}
      {summary.total_workers > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Submission Progress Today</span>
            <span className="text-gray-500">
              {summary.reports_submitted} / {summary.total_workers} workers
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-3 bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${(summary.reports_submitted / summary.total_workers) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {Math.round((summary.reports_submitted / summary.total_workers) * 100)}% of ASHA workers have submitted today
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
            placeholder="Search worker..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Date */}
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
        />

        {/* Village */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filterVillage}
          onChange={e => setFilterVillage(e.target.value)}
        >
          <option value="">All Villages</option>
          {villages.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Status */}
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="submitted">✅ Submitted</option>
          <option value="pending">⏳ Pending</option>
        </select>

        {/* Clear */}
        {(search || filterVillage || filterStatus || filterDate !== new Date().toISOString().split('T')[0]) && (
          <button
            onClick={() => { setSearch(''); setFilterVillage(''); setFilterStatus(''); setFilterDate(new Date().toISOString().split('T')[0]); }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-sm text-gray-500">{cards.length} worker{cards.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ASHA Worker Cards Grid */}
      {loading ? (
        <Spinner />
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">👩‍⚕️</p>
          <p className="text-sm">No ASHA workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <WorkerCard key={card.worker._id || i} card={card} onViewReport={openDetail} />
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal
        card={selectedCard}
        open={showDetail}
        onClose={() => setShowDetail(false)}
      />
    </div>
  );
}
