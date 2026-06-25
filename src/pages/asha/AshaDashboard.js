import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard, Spinner, PriorityBadge, PageHeader } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AshaDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/asha/dashboard-summary').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  const d = data || {};

  return (
    <div>
      <PageHeader title={`Welcome, ${user?.name} 👋`} subtitle="Your health monitoring overview" />

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: '+ Log Visit', to: '/asha/visits', color: 'bg-green-600 hover:bg-green-700' },
          { label: '+ Add Woman', to: '/asha/women', color: 'bg-purple-600 hover:bg-purple-700' },
          { label: '+ Add Child', to: '/asha/children', color: 'bg-blue-600 hover:bg-blue-700' },
          { label: '+ Add Family', to: '/asha/families', color: 'bg-orange-500 hover:bg-orange-600' },
        ].map(b => (
          <button key={b.label} onClick={() => navigate(b.to)}
            className={`${b.color} text-white py-3 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm`}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Visits"    value={d.today_visits}    icon="📋" color="green" />
        <StatCard label="Total Pregnant"    value={d.total_pregnant}  icon="🤰" color="purple" />
        <StatCard label="High Risk Women"   value={d.high_risk_count} icon="⚠️" color="red" />
        <StatCard label="Severe Malnutrition" value={d.severe_children} icon="🔴" color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Follow-ups */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">
            Pending Follow-ups
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{d.pending_followups?.length || 0}</span>
          </h3>
          {d.pending_followups?.length === 0 || !d.pending_followups ? (
            <p className="text-gray-400 text-sm">No pending follow-ups 🎉</p>
          ) : (
            <div className="space-y-2">
              {d.pending_followups.slice(0, 5).map(f => (
                <div key={f._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{f.target_individual_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{f.village} · {f.visit_type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <PriorityBadge priority={f.follow_up?.priority} />
                    <p className="text-xs text-gray-400">
                      {f.follow_up?.next_date ? new Date(f.follow_up.next_date).toLocaleDateString('en-IN') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Risk Women */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">
            High-Risk Pregnancies
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{d.high_risk_women?.length || 0}</span>
          </h3>
          {d.high_risk_women?.length === 0 || !d.high_risk_women ? (
            <p className="text-gray-400 text-sm">No high-risk cases in your villages</p>
          ) : (
            <div className="space-y-2">
              {d.high_risk_women.map(w => (
                <div key={w._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm flex-shrink-0">
                    {w.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{w.name}</p>
                    <p className="text-xs text-gray-500">{w.village} · Month {w.pregnancy_month || '?'}</p>
                  </div>
                  <div className="text-xs text-right text-gray-500">
                    {w.medical_metrics?.hemoglobin && <p>Hb: {w.medical_metrics.hemoglobin}</p>}
                    {w.medical_metrics?.bp_sys && <p>BP: {w.medical_metrics.bp_sys}/{w.medical_metrics.bp_dia}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
