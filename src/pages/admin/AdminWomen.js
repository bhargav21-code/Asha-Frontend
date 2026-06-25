import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, HighRiskBadge, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import api from '../../utils/api';

export default function AdminWomen() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ village: '', high_risk: '', pregnancy_status: '' });
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ total: 0, pages: 1 });

  const fetchData = async (p = 1) => {
    setLoading(true);
    const params = { page: p, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) };
    const r = await api.get('/women', { params });
    setData(r.data.data);
    setMeta({ total: r.data.total, pages: r.data.pages });
    setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(1); }, [filters]);

  return (
    <div>
      <PageHeader title="Pregnant Women Registry" subtitle={`${meta.total} records`} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 p-4 flex flex-wrap gap-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Filter by village..." value={filters.village}
          onChange={e => setFilters({ ...filters, village: e.target.value })} />
        <select className={`${selectCls} max-w-xs`} value={filters.high_risk}
          onChange={e => setFilters({ ...filters, high_risk: e.target.value })}>
          <option value="">All Risk Levels</option>
          <option value="true">High Risk Only</option>
          <option value="false">Normal</option>
        </select>
        <select className={`${selectCls} max-w-xs`} value={filters.pregnancy_status}
          onChange={e => setFilters({ ...filters, pregnancy_status: e.target.value })}>
          <option value="">All Status</option>
          <option value="true">Currently Pregnant</option>
          <option value="false">Not Pregnant</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No records found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Age', 'Village', 'Pregnancy', 'Month', 'Hemoglobin', 'BP', 'Risk', 'EDD'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(w => (
                  <tr key={w._id} className={`hover:bg-gray-50 ${w.high_risk ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                    <td className="px-4 py-3 text-gray-600">{w.age} yrs</td>
                    <td className="px-4 py-3 text-gray-600">{w.village}</td>
                    <td className="px-4 py-3">{w.pregnancy_status ? '✅ Yes' : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{w.pregnancy_month || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{w.medical_metrics?.hemoglobin ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {w.medical_metrics?.bp_sys ? `${w.medical_metrics.bp_sys}/${w.medical_metrics.bp_dia}` : '—'}
                    </td>
                    <td className="px-4 py-3"><HighRiskBadge isHighRisk={w.high_risk} /></td>
                    <td className="px-4 py-3 text-gray-600">
                      {w.edd ? new Date(w.edd).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4">
          <Pagination page={page} pages={meta.pages} onPageChange={fetchData} />
        </div>
      </div>
    </div>
  );
}
