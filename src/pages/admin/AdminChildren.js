import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, NutritionBadge, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import api from '../../utils/api';

export default function AdminChildren() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ village: '', nutrition_status: '' });
  const [page, setPage]       = useState(1);
  const [meta, setMeta]       = useState({ total: 0, pages: 1 });

  const fetchData = async (p = 1) => {
    setLoading(true);
    const params = { page: p, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) };
    const r = await api.get('/children', { params });
    setData(r.data.data);
    setMeta({ total: r.data.total, pages: r.data.pages });
    setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(1); }, [filters]);

  const vaccinationCount = (v) => v ? Object.values(v).filter(Boolean).length : 0;

  return (
    <div>
      <PageHeader title="Children Registry" subtitle={`${meta.total} records`} />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4 p-4 flex flex-wrap gap-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Filter by village..."
          value={filters.village} onChange={e => setFilters({ ...filters, village: e.target.value })} />
        <select className={`${selectCls} max-w-xs`} value={filters.nutrition_status}
          onChange={e => setFilters({ ...filters, nutrition_status: e.target.value })}>
          <option value="">All Nutrition Status</option>
          <option value="Normal">Normal</option>
          <option value="Moderate Malnutrition">Moderate MAM</option>
          <option value="Severe Malnutrition">Severe SAM</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No records found" icon="👶" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Gender', 'Age (months)', 'Village', 'Weight (kg)', 'MUAC', 'Vaccinations', 'Nutrition Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(c => (
                  <tr key={c._id} className={`hover:bg-gray-50 ${c.nutrition_status === 'Severe Malnutrition' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{c.age_months ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.village}</td>
                    <td className="px-4 py-3 text-gray-600">{c.growth_metrics?.weight ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.growth_metrics?.muac ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{vaccinationCount(c.vaccinations)}/7</td>
                    <td className="px-4 py-3"><NutritionBadge status={c.nutrition_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4"><Pagination page={page} pages={meta.pages} onPageChange={fetchData} /></div>
      </div>
    </div>
  );
}
