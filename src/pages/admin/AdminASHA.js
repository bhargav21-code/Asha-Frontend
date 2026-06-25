import React, { useEffect, useState } from 'react';
import { PageHeader, Spinner, Modal, FormField, EmptyState, inputCls } from '../../components/common/UI';
import api from '../../utils/api';

export default function AdminASHA() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', username: '', password: '', phone: '', assigned_villages: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchWorkers = () => {
    setLoading(true);
    api.get('/admin/asha-workers').then(r => setWorkers(r.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchWorkers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/admin/asha-workers', {
        ...form,
        assigned_villages: form.assigned_villages.split(',').map(v => v.trim()).filter(Boolean),
      });
      setShowModal(false);
      setForm({ name: '', username: '', password: '', phone: '', assigned_villages: '' });
      fetchWorkers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create worker');
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="ASHA Workers" subtitle={`${workers.length} workers registered`}
        action={
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Add ASHA Worker
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <Spinner /> : workers.length === 0 ? <EmptyState message="No ASHA workers registered" icon="👩‍⚕️" /> :
          workers.map(w => (
            <div key={w._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                  {w.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{w.name}</p>
                  <p className="text-xs text-gray-500">@{w.username}</p>
                </div>
              </div>
              {w.phone && <p className="text-sm text-gray-600 mb-2">📞 {w.phone}</p>}
              {w.assigned_villages?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {w.assigned_villages.map(v => (
                    <span key={v} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">{v}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Joined {new Date(w.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          ))
        }
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add ASHA Worker">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required>
              <input className={inputCls} value={form.name} required
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="Username" required>
              <input className={inputCls} value={form.username} required
                onChange={e => setForm({ ...form, username: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Password" required>
              <input type="password" className={inputCls} value={form.password} required minLength={6}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </FormField>
            <FormField label="Phone">
              <input className={inputCls} value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Assigned Villages (comma-separated)">
            <input className={inputCls} placeholder="e.g. Rampur, Sitapur, Nandpur" value={form.assigned_villages}
              onChange={e => setForm({ ...form, assigned_villages: e.target.value })} />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Worker'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
