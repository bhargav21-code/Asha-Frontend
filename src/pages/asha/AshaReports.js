import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, Modal, FormField, EmptyState, inputCls, selectCls } from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const EMPTY = {
  date: new Date().toISOString().split('T')[0],
  village: '', homes_visited: '', pregnant_visited: '',
  children_checked: '', referrals_made: '', sessions_conducted: '', notes: '',
};

export default function AshaReports() {
  const { user } = useAuth();
  const [data, setData]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const fetchData = () => {
    setLoading(true);
    api.get('/reports').then(r => setData(r.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/reports', {
        date: form.date, village: form.village, notes: form.notes,
        homes_visited:    Number(form.homes_visited)    || 0,
        pregnant_visited: Number(form.pregnant_visited) || 0,
        children_checked: Number(form.children_checked) || 0,
        referrals_made:   Number(form.referrals_made)   || 0,
        sessions_conducted: Number(form.sessions_conducted) || 0,
      });
      setShowModal(false);
      setForm({ ...EMPTY, village: user?.assigned_villages?.[0] || '' });
      fetchData();
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit'); }
    finally { setSaving(false); }
  };

  const totals = data.reduce((a, r) => ({
    homes: a.homes + r.homes_visited,
    pregnant: a.pregnant + r.pregnant_visited,
    children: a.children + r.children_checked,
    referrals: a.referrals + r.referrals_made,
  }), { homes: 0, pregnant: 0, children: 0, referrals: 0 });

  return (
    <div>
      <PageHeader title="Daily Work Reports" subtitle="Submit and view your activity logs"
        action={
          <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Submit Report
          </button>
        }
      />

      {/* Monthly totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[['🏠 Homes Visited', totals.homes], ['🤰 Pregnant Visited', totals.pregnant],
          ['👶 Children Checked', totals.children], ['🏥 Referrals Made', totals.referrals]].map(([l, v]) => (
          <div key={l} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{v}</p>
            <p className="text-xs text-gray-500 mt-1">{l}</p>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : data.length === 0 ? <EmptyState message="No reports submitted yet" icon="📝" /> : (
        <div className="space-y-3">
          {data.map(r => (
            <div key={r._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-500">📍 {r.village}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center">
                {[['Homes', r.homes_visited], ['Pregnant', r.pregnant_visited],
                  ['Children', r.children_checked], ['Referrals', r.referrals_made],
                  ['Sessions', r.sessions_conducted]].map(([l, v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-lg font-bold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
              {r.notes && <p className="mt-3 text-sm text-gray-600 italic">"{r.notes}"</p>}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Submit Daily Report">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date" required>
              <input type="date" className={inputCls} required value={form.date} onChange={e => set('date', e.target.value)} />
            </FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => set('village', e.target.value)} required>
                <option value="">Select village</option>
                {user?.assigned_villages?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[['homes_visited','Homes Visited'],['pregnant_visited','Pregnant Women Visited'],
              ['children_checked','Children Checked'],['referrals_made','Referrals Made'],['sessions_conducted','Sessions Conducted']].map(([k, l]) => (
              <FormField key={k} label={l}>
                <input type="number" min={0} className={inputCls} value={form[k]} onChange={e => set(k, e.target.value)} />
              </FormField>
            ))}
          </div>
          <FormField label="Notes">
            <textarea rows={2} className={inputCls} placeholder="Any observations or issues..." value={form.notes} onChange={e => set('notes', e.target.value)} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
