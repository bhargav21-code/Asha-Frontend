import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, HighRiskBadge, Modal, FormField, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const EMPTY_FORM = {
  name: '', age: '', mobile: '', address: '', village: '',
  pregnancy_status: 'false', pregnancy_month: '', edd: '', lmp: '',
  'medical_metrics.weight': '', 'medical_metrics.bp_sys': '', 'medical_metrics.bp_dia': '',
  'medical_metrics.hemoglobin': '', 'medical_metrics.diabetes': 'false', 'medical_metrics.thyroid': 'false',
  'gov_schemes.mamta_card': 'false', 'gov_schemes.jsy': 'false',
  'checkups.last_date': '', 'checkups.next_date': '',
};

function buildPayload(f) {
  return {
    name: f.name, age: Number(f.age), mobile: f.mobile, address: f.address, village: f.village,
    pregnancy_status: f.pregnancy_status === 'true',
    pregnancy_month: f.pregnancy_month ? Number(f.pregnancy_month) : undefined,
    edd: f.edd || undefined, lmp: f.lmp || undefined,
    medical_metrics: {
      weight: f['medical_metrics.weight'] ? Number(f['medical_metrics.weight']) : undefined,
      bp_sys: f['medical_metrics.bp_sys'] ? Number(f['medical_metrics.bp_sys']) : undefined,
      bp_dia: f['medical_metrics.bp_dia'] ? Number(f['medical_metrics.bp_dia']) : undefined,
      hemoglobin: f['medical_metrics.hemoglobin'] ? Number(f['medical_metrics.hemoglobin']) : undefined,
      diabetes: f['medical_metrics.diabetes'] === 'true',
      thyroid: f['medical_metrics.thyroid'] === 'true',
    },
    gov_schemes: { mamta_card: f['gov_schemes.mamta_card'] === 'true', jsy: f['gov_schemes.jsy'] === 'true' },
    checkups: { last_date: f['checkups.last_date'] || undefined, next_date: f['checkups.next_date'] || undefined },
  };
}

export default function AshaWomen() {
  const { user } = useAuth();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY_FORM, village: user?.assigned_villages?.[0] || '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [page, setPage]         = useState(1);
  const [meta, setMeta]         = useState({ total: 0, pages: 1 });

  const fetchData = async (p = 1) => {
    setLoading(true);
    const r = await api.get('/women', { params: { page: p, limit: 15 } });
    setData(r.data.data); setMeta({ total: r.data.total, pages: r.data.pages }); setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isPregnant = form.pregnancy_status === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/women', buildPayload(form));
      setShowModal(false);
      setForm({ ...EMPTY_FORM, village: user?.assigned_villages?.[0] || '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Women Registry" subtitle={`${meta.total} records`}
        action={
          <button onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Woman
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No women registered yet" icon="🤰" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Name','Age','Village','Pregnant','Month','Hb','Risk','Next Checkup'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(w => (
                  <tr key={w._id} className={`hover:bg-gray-50 ${w.high_risk ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                    <td className="px-4 py-3 text-gray-600">{w.age}</td>
                    <td className="px-4 py-3 text-gray-600">{w.village}</td>
                    <td className="px-4 py-3">{w.pregnancy_status ? '✅' : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{w.pregnancy_month || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{w.medical_metrics?.hemoglobin ?? '—'}</td>
                    <td className="px-4 py-3"><HighRiskBadge isHighRisk={w.high_risk} /></td>
                    <td className="px-4 py-3 text-gray-600">{w.checkups?.next_date ? new Date(w.checkups.next_date).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4"><Pagination page={page} pages={meta.pages} onPageChange={fetchData} /></div>
      </div>

      {/* Add Woman Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Woman">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Basic Information</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required><input className={inputCls} required value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
            <FormField label="Age" required><input type="number" className={inputCls} required value={form.age} onChange={e => set('age', e.target.value)} /></FormField>
            <FormField label="Mobile"><input className={inputCls} value={form.mobile} onChange={e => set('mobile', e.target.value)} /></FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => set('village', e.target.value)} required>
                <option value="">Select village</option>
                {user?.assigned_villages?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Address"><input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} /></FormField>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Pregnancy</p>
          <FormField label="Pregnant?">
            <select className={selectCls} value={form.pregnancy_status} onChange={e => set('pregnancy_status', e.target.value)}>
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </FormField>

          {isPregnant && (
            <div className="grid grid-cols-3 gap-3 p-3 bg-purple-50 rounded-lg">
              <FormField label="Month (1-9)">
                <input type="number" min={1} max={9} className={inputCls} value={form.pregnancy_month} onChange={e => set('pregnancy_month', e.target.value)} />
              </FormField>
              <FormField label="LMP Date">
                <input type="date" className={inputCls} value={form.lmp} onChange={e => set('lmp', e.target.value)} />
              </FormField>
              <FormField label="EDD">
                <input type="date" className={inputCls} value={form.edd} onChange={e => set('edd', e.target.value)} />
              </FormField>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Medical Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)"><input type="number" step="0.1" className={inputCls} value={form['medical_metrics.weight']} onChange={e => set('medical_metrics.weight', e.target.value)} /></FormField>
            <FormField label="Hemoglobin (g/dL)"><input type="number" step="0.1" className={inputCls} value={form['medical_metrics.hemoglobin']} onChange={e => set('medical_metrics.hemoglobin', e.target.value)} /></FormField>
            <FormField label="BP Systolic"><input type="number" className={inputCls} value={form['medical_metrics.bp_sys']} onChange={e => set('medical_metrics.bp_sys', e.target.value)} /></FormField>
            <FormField label="BP Diastolic"><input type="number" className={inputCls} value={form['medical_metrics.bp_dia']} onChange={e => set('medical_metrics.bp_dia', e.target.value)} /></FormField>
            <FormField label="Diabetes?">
              <select className={selectCls} value={form['medical_metrics.diabetes']} onChange={e => set('medical_metrics.diabetes', e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </FormField>
            <FormField label="Thyroid?">
              <select className={selectCls} value={form['medical_metrics.thyroid']} onChange={e => set('medical_metrics.thyroid', e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </FormField>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Government Schemes</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Mamta Card?">
              <select className={selectCls} value={form['gov_schemes.mamta_card']} onChange={e => set('gov_schemes.mamta_card', e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </FormField>
            <FormField label="JSY Beneficiary?">
              <select className={selectCls} value={form['gov_schemes.jsy']} onChange={e => set('gov_schemes.jsy', e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </FormField>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Checkup Schedule</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Last Checkup"><input type="date" className={inputCls} value={form['checkups.last_date']} onChange={e => set('checkups.last_date', e.target.value)} /></FormField>
            <FormField label="Next Checkup"><input type="date" className={inputCls} value={form['checkups.next_date']} onChange={e => set('checkups.next_date', e.target.value)} /></FormField>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Register Woman'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
