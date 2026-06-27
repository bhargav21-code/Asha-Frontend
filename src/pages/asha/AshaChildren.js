import { ALL_VILLAGES } from '../../utils/villages';
import api from '../../utils/api';
import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, NutritionBadge, Modal, FormField, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';

const VACC = ['bcg','opv0','hepB','opv1','penta1','mr','vitamin_a'];
const VACC_LABELS = { bcg:'BCG', opv0:'OPV-0', hepB:'Hep-B', opv1:'OPV-1', penta1:'Penta-1', mr:'MR', vitamin_a:'Vit-A' };

const EMPTY = {
  name:'', dob:'', gender:'Male', village:'',
  'growth_metrics.weight':'', 'growth_metrics.height':'', 'growth_metrics.muac':'', 'growth_metrics.head_circumference':'',
  ...Object.fromEntries(VACC.map(v => [`vacc_${v}`, 'false'])),
};

export default function AshaChildren() {
  const { user } = useAuth();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ total: 0, pages: 1 });

  const fetchData = async (p = 1) => {
    setLoading(true);
    const r = await api.get('/children', { params: { page: p, limit: 15 } });
    setData(r.data.data); setMeta({ total: r.data.total, pages: r.data.pages }); setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const buildPayload = () => ({
    name: form.name, dob: form.dob, gender: form.gender, village: form.village,
    growth_metrics: {
      weight: form['growth_metrics.weight'] ? Number(form['growth_metrics.weight']) : undefined,
      height: form['growth_metrics.height'] ? Number(form['growth_metrics.height']) : undefined,
      muac:   form['growth_metrics.muac']   ? Number(form['growth_metrics.muac'])   : undefined,
      head_circumference: form['growth_metrics.head_circumference'] ? Number(form['growth_metrics.head_circumference']) : undefined,
    },
    vaccinations: Object.fromEntries(VACC.map(v => [v, form[`vacc_${v}`] === 'true'])),
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/children', buildPayload());
      setShowModal(false);
      setForm({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Children Registry" subtitle={`${meta.total} records`}
        action={
          <button onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Child
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No children registered yet" icon="👶" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Name','Gender','Age (mo.)','Village','Weight','MUAC','Vaccinations','Nutrition'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(c => (
                  <tr key={c._id} className={`hover:bg-gray-50 ${c.nutrition_status !== 'Normal' ? 'bg-yellow-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.gender}</td>
                    <td className="px-4 py-3 text-gray-600">{c.age_months ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.village}</td>
                    <td className="px-4 py-3 text-gray-600">{c.growth_metrics?.weight ?? '—'} kg</td>
                    <td className="px-4 py-3 text-gray-600">{c.growth_metrics?.muac ?? '—'} cm</td>
                    <td className="px-4 py-3 text-gray-600">{c.vaccinations ? Object.values(c.vaccinations).filter(Boolean).length : 0}/7</td>
                    <td className="px-4 py-3"><NutritionBadge status={c.nutrition_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4"><Pagination page={page} pages={meta.pages} onPageChange={fetchData} /></div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Child">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Child Name" required><input className={inputCls} required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
            <FormField label="Date of Birth" required><input type="date" className={inputCls} required value={form.dob} onChange={e => set('dob', e.target.value)} /></FormField>
            <FormField label="Gender">
              <select className={selectCls} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => set('village', e.target.value)} required>
                <option value="">Select village</option>
                {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Growth Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)"><input type="number" step="0.1" className={inputCls} value={form['growth_metrics.weight']} onChange={e => set('growth_metrics.weight', e.target.value)} /></FormField>
            <FormField label="Height (cm)"><input type="number" step="0.1" className={inputCls} value={form['growth_metrics.height']} onChange={e => set('growth_metrics.height', e.target.value)} /></FormField>
            <FormField label="MUAC (cm)"><input type="number" step="0.1" className={inputCls} value={form['growth_metrics.muac']} onChange={e => set('growth_metrics.muac', e.target.value)} /></FormField>
            <FormField label="Head Circumference (cm)"><input type="number" step="0.1" className={inputCls} value={form['growth_metrics.head_circumference']} onChange={e => set('growth_metrics.head_circumference', e.target.value)} /></FormField>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Vaccinations</p>
          <div className="grid grid-cols-3 gap-2">
            {VACC.map(v => (
              <label key={v} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[`vacc_${v}`] === 'true'}
                  onChange={e => set(`vacc_${v}`, e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-green-600 rounded" />
                {VACC_LABELS[v]}
              </label>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Register Child'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
