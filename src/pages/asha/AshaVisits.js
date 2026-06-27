import { ALL_VILLAGES } from '../../utils/villages';
import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, PriorityBadge, Modal, FormField, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const EMPTY = {
  target_individual_name: '', visit_type: 'General', village: '',
  'metrics.weight': '', 'metrics.bp_sys': '', 'metrics.bp_dia': '',
  'metrics.temperature': '', 'metrics.blood_sugar': '', 'metrics.hemoglobin': '',
  'actions_taken.counseling': 'false', 'actions_taken.referral': 'false',
  'actions_taken.medicine_given': 'false', 'actions_taken.notes': '',
  'follow_up.required': 'false', 'follow_up.next_date': '',
  date: new Date().toISOString().split('T')[0],
};

export default function AshaVisits() {
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
    const r = await api.get('/visits', { params: { page: p, limit: 15 } });
    setData(r.data.data); setMeta({ total: r.data.total, pages: r.data.pages }); setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isPregnancyVisit = ['Pregnancy', 'Postnatal'].includes(form.visit_type);

  const buildPayload = () => ({
    date: form.date, village: form.village,
    target_individual_name: form.target_individual_name,
    visit_type: form.visit_type,
    metrics: {
      weight: form['metrics.weight'] ? Number(form['metrics.weight']) : undefined,
      bp_sys: form['metrics.bp_sys'] ? Number(form['metrics.bp_sys']) : undefined,
      bp_dia: form['metrics.bp_dia'] ? Number(form['metrics.bp_dia']) : undefined,
      temperature: form['metrics.temperature'] ? Number(form['metrics.temperature']) : undefined,
      blood_sugar: form['metrics.blood_sugar'] ? Number(form['metrics.blood_sugar']) : undefined,
      hemoglobin: form['metrics.hemoglobin'] ? Number(form['metrics.hemoglobin']) : undefined,
    },
    actions_taken: {
      counseling: form['actions_taken.counseling'] === 'true',
      referral:   form['actions_taken.referral']   === 'true',
      medicine_given: form['actions_taken.medicine_given'] === 'true',
      notes: form['actions_taken.notes'],
    },
    follow_up: {
      required: form['follow_up.required'] === 'true',
      next_date: form['follow_up.next_date'] || undefined,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/visits/new', buildPayload());
      setShowModal(false);
      setForm({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save visit'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Visit Log" subtitle={`${meta.total} total visits`}
        action={
          <button onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Log Visit
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No visits logged yet" icon="📋" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>{['Date','Individual','Village','Type','BP','Referral','Priority','Follow-up Date'].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map(v => (
                  <tr key={v._id} className={`hover:bg-gray-50 ${v.follow_up?.priority === 'Red' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3 text-gray-600">{new Date(v.date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{v.target_individual_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.village}</td>
                    <td className="px-4 py-3 text-gray-600">{v.visit_type}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {v.metrics?.bp_sys ? `${v.metrics.bp_sys}/${v.metrics.bp_dia}` : '—'}
                    </td>
                    <td className="px-4 py-3">{v.actions_taken?.referral ? '✅ Yes' : '—'}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={v.follow_up?.priority || 'Green'} /></td>
                    <td className="px-4 py-3 text-gray-600">
                      {v.follow_up?.next_date ? new Date(v.follow_up.next_date).toLocaleDateString('en-IN') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4"><Pagination page={page} pages={meta.pages} onPageChange={fetchData} /></div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log New Visit">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <input type="date" className={inputCls} required value={form.date} onChange={e => set('date', e.target.value)} />
            </FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => set('village', e.target.value)} required>
                <option value="">Select village</option>
                {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Individual Name">
              <input className={inputCls} value={form.target_individual_name} onChange={e => set('target_individual_name', e.target.value)} />
            </FormField>
            <FormField label="Visit Type" required>
              <select className={selectCls} value={form.visit_type} onChange={e => set('visit_type', e.target.value)}>
                {['Pregnancy','Child','Vaccination','General','Postnatal'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Vitals / Metrics</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)"><input type="number" step="0.1" className={inputCls} value={form['metrics.weight']} onChange={e => set('metrics.weight', e.target.value)} /></FormField>
            <FormField label="Temperature (°F)"><input type="number" step="0.1" className={inputCls} value={form['metrics.temperature']} onChange={e => set('metrics.temperature', e.target.value)} /></FormField>
            <FormField label="BP Systolic"><input type="number" className={inputCls} value={form['metrics.bp_sys']} onChange={e => set('metrics.bp_sys', e.target.value)} /></FormField>
            <FormField label="BP Diastolic"><input type="number" className={inputCls} value={form['metrics.bp_dia']} onChange={e => set('metrics.bp_dia', e.target.value)} /></FormField>
            <FormField label="Blood Sugar (mg/dL)"><input type="number" className={inputCls} value={form['metrics.blood_sugar']} onChange={e => set('metrics.blood_sugar', e.target.value)} /></FormField>
            {isPregnancyVisit && (
              <FormField label="Hemoglobin (g/dL)"><input type="number" step="0.1" className={inputCls} value={form['metrics.hemoglobin']} onChange={e => set('metrics.hemoglobin', e.target.value)} /></FormField>
            )}
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Actions Taken</p>
          <div className="grid grid-cols-3 gap-2">
            {[['actions_taken.counseling','Counseling'],['actions_taken.referral','Referral'],['actions_taken.medicine_given','Medicine Given']].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[k] === 'true'} onChange={e => set(k, e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-green-600 rounded" />
                {label}
              </label>
            ))}
          </div>
          <FormField label="Notes">
            <textarea rows={2} className={inputCls} value={form['actions_taken.notes']} onChange={e => set('actions_taken.notes', e.target.value)} />
          </FormField>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Follow-up</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Follow-up Required?">
              <select className={selectCls} value={form['follow_up.required']} onChange={e => set('follow_up.required', e.target.value)}>
                <option value="false">No</option><option value="true">Yes</option>
              </select>
            </FormField>
            {form['follow_up.required'] === 'true' && (
              <FormField label="Next Visit Date">
                <input type="date" className={inputCls} value={form['follow_up.next_date']} onChange={e => set('follow_up.next_date', e.target.value)} />
              </FormField>
            )}
          </div>
          <p className="text-xs text-gray-400 italic">⚡ AI triage priority (Red/Yellow/Green) is auto-assigned based on vitals</p>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Submit Visit'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
