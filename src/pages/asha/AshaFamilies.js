import api from '../../utils/api';
import { ALL_VILLAGES } from '../../utils/villages';
// Force update
import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, Modal, FormField, Pagination, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';

const EMPTY = {
  head_name: '', mobile: '', address: '', village: '',
  'conditions.toilet': 'false', 'conditions.water_source': 'Tap',
  'conditions.electricity': 'false', 'conditions.lpg': 'false',
};

export default function AshaFamilies() {
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
    const r = await api.get('/families', { params: { page: p, limit: 15 } });
    setData(r.data.data); setMeta({ total: r.data.total, pages: r.data.pages }); setPage(p);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/families', {
        head_name: form.head_name, mobile: form.mobile,
        address: form.address, village: form.village,
        conditions: {
          toilet: form['conditions.toilet'] === 'true',
          water_source: form['conditions.water_source'],
          electricity: form['conditions.electricity'] === 'true',
          lpg: form['conditions.lpg'] === 'true',
        },
      });
      setShowModal(false);
      setForm({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Family Registry" subtitle={`${meta.total} families`}
        action={
          <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add Family
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No families registered yet" icon="🏡" /> :
          data.map(f => (
            <div key={f._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">{f.head_name[0]}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.head_name}</p>
                  <p className="text-xs text-gray-500">{f.village}</p>
                </div>
              </div>
              {f.mobile && <p className="text-xs text-gray-600 mb-2">📞 {f.mobile}</p>}
              <div className="flex flex-wrap gap-1 mt-2">
                {f.conditions?.toilet && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">🚽 Toilet</span>}
                {f.conditions?.electricity && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-xs rounded-full">💡 Electricity</span>}
                {f.conditions?.lpg && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">🔥 LPG</span>}
                {f.conditions?.water_source && <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded-full">💧 {f.conditions.water_source}</span>}
              </div>
              <p className="text-xs text-gray-400 mt-3">{f.members?.length || 0} members</p>
            </div>
          ))
        }
      </div>
      <div className="mt-4"><Pagination page={page} pages={meta.pages} onPageChange={fetchData} /></div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Family">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Head of Family" required>
              <input className={inputCls} required value={form.head_name} onChange={e => set('head_name', e.target.value)} />
            </FormField>
            <FormField label="Mobile">
              <input className={inputCls} value={form.mobile} onChange={e => set('mobile', e.target.value)} />
            </FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => set('village', e.target.value)} required>
                <option value="">Select village</option>
                {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Water Source">
              <select className={selectCls} value={form['conditions.water_source']} onChange={e => set('conditions.water_source', e.target.value)}>
                {['Tap','Well','River','Tanker','Other'].map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Address">
            <input className={inputCls} value={form.address} onChange={e => set('address', e.target.value)} />
          </FormField>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Household Conditions</p>
          <div className="grid grid-cols-3 gap-2">
            {[['conditions.toilet','Toilet'],['conditions.electricity','Electricity'],['conditions.lpg','LPG Gas']].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form[k] === 'true'} onChange={e => set(k, e.target.checked ? 'true' : 'false')} className="w-4 h-4 text-green-600 rounded" />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Register Family'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
