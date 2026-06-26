import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader, Spinner, Modal, FormField, EmptyState, inputCls } from '../../components/common/UI';
import api from '../../utils/api';

const TABS = ['All Users', 'Pending Approval', 'Change Requests'];

export default function AdminUserManagement() {
  const [tab, setTab]         = useState(0);
  const [users, setUsers]     = useState([]);
  const [pending, setPending] = useState([]);
  const [changeReqs, setChangeReqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddASHA,  setShowAddASHA]  = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [editUser,     setEditUser]     = useState(null);
  const [resetUser,    setResetUser]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [u, p, c] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/pending'),
        api.get('/admin/users/change-requests'),
      ]);
      setUsers(u.data.data);
      setPending(p.data.data);
      setChangeReqs(c.data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const approve = async (id, action) => {
    await api.patch(`/admin/users/${id}/approve`, { action });
    fetchAll();
  };

  const toggleActive = async (id) => {
    await api.patch(`/admin/users/${id}/toggle-active`);
    fetchAll();
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${id}`);
    fetchAll();
  };

  const handleChangeRequest = async (id, action) => {
    await api.patch(`/admin/users/${id}/change-request`, { action });
    fetchAll();
  };

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage all system users"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowAddASHA(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add ASHA Worker
            </button>
            <button onClick={() => setShowAddAdmin(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              + Add Admin
            </button>
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === i ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
            {i === 1 && pending.length > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>
            )}
            {i === 2 && changeReqs.length > 0 && (
              <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">{changeReqs.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* All Users */}
          {tab === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Name', 'Username', 'Role', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">@{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Btn color="gray" onClick={() => setEditUser(u)}>Edit</Btn>
                          <Btn color="yellow" onClick={() => setResetUser(u)}>Reset PW</Btn>
                          <Btn color={u.active ? 'orange' : 'green'} onClick={() => toggleActive(u._id)}>
                            {u.active ? 'Deactivate' : 'Activate'}
                          </Btn>
                          <Btn color="red" onClick={() => deleteUser(u._id, u.name)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pending Approval */}
          {tab === 1 && (
            pending.length === 0
              ? <EmptyState message="No pending registrations" icon="✅" />
              : <div className="space-y-4">
                  {pending.map(u => (
                    <div key={u._id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">@{u.username} · {u.phone}</p>
                          {u.email && <p className="text-xs text-gray-500">{u.email}</p>}
                          {u.address && <p className="text-xs text-gray-400 mt-1">{u.address}</p>}
                          {u.gender && <p className="text-xs text-gray-400">Gender: {u.gender} · Age: {u.age || '—'}</p>}
                          {u.emergency_contact?.name && (
                            <p className="text-xs text-gray-400">Emergency: {u.emergency_contact.name} ({u.emergency_contact.phone})</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Applied: {new Date(u.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => approve(u._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            ✓ Approve
                          </button>
                          <button onClick={() => approve(u._id, 'reject')}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {/* Change Requests */}
          {tab === 2 && (
            changeReqs.length === 0
              ? <EmptyState message="No pending change requests" icon="✅" />
              : <div className="space-y-4">
                  {changeReqs.map(u => (
                    <div key={u._id} className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{u.name} <span className="font-normal text-gray-400">(@{u.username})</span></p>
                          <p className="text-sm text-blue-700 mt-1">
                            Requesting to change <strong>{u.change_request.type}</strong> → <code className="bg-blue-50 px-1 rounded">{u.change_request.new_value}</code>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Requested: {new Date(u.change_request.requested_at).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleChangeRequest(u._id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            ✓ Approve
                          </button>
                          <button onClick={() => handleChangeRequest(u._id, 'reject')}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                            ✗ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          )}
        </>
      )}

      {/* Add ASHA Worker Modal */}
      <UserFormModal
        open={showAddASHA}
        title="Add ASHA Worker"
        role="ASHA"
        onClose={() => setShowAddASHA(false)}
        onSuccess={fetchAll}
      />

      {/* Add Admin Modal */}
      <UserFormModal
        open={showAddAdmin}
        title="Add Admin"
        role="Admin"
        onClose={() => setShowAddAdmin(false)}
        onSuccess={fetchAll}
      />

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onSuccess={() => { setEditUser(null); fetchAll(); }}
        />
      )}

      {/* Reset Password Modal */}
      {resetUser && (
        <ResetPasswordModal
          user={resetUser}
          onClose={() => setResetUser(null)}
          onSuccess={() => { setResetUser(null); fetchAll(); }}
        />
      )}
    </div>
  );
}

// ─── Inline button helper ──────────────────────────────────────
const colors = {
  gray:   'bg-gray-100 hover:bg-gray-200 text-gray-700',
  yellow: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
  orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
  green:  'bg-green-100 hover:bg-green-200 text-green-700',
  red:    'bg-red-100 hover:bg-red-200 text-red-700',
};
const Btn = ({ color, onClick, children }) => (
  <button onClick={onClick} className={`px-2 py-1 rounded text-xs font-medium ${colors[color]}`}>{children}</button>
);

// ─── Add User Modal ────────────────────────────────────────────
function UserFormModal({ open, title, role, onClose, onSuccess }) {
  const empty = { name: '', username: '', password: '', phone: '', email: '',
    date_of_birth: '', age: '', gender: '', address: '',
    assigned_villages: '', ec_name: '', ec_relationship: '', ec_phone: '' };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

  const handleDOB = (e) => {
    const dob = e.target.value;
    const age = dob ? Math.floor((new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)) : '';
    setForm({ ...form, date_of_birth: dob, age });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const endpoint = role === 'Admin' ? '/admin/users/admin' : '/admin/asha-workers';
      await api.post(endpoint, {
        name: form.name, username: form.username, password: form.password,
        phone: form.phone, email: form.email,
        ...(role === 'ASHA' && {
          date_of_birth: form.date_of_birth || undefined,
          age: form.age ? Number(form.age) : undefined,
          gender: form.gender || undefined,
          address: form.address || undefined,
          assigned_villages: form.assigned_villages.split(',').map(v => v.trim()).filter(Boolean),
          emergency_contact: (form.ec_name || form.ec_phone) ? {
            name: form.ec_name, relationship: form.ec_relationship, phone: form.ec_phone,
          } : undefined,
        }),
      });
      setForm(empty); onClose(); onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Full Name *"><input className={inputCls} required {...f('name')} /></FormField>
          <FormField label="Username *"><input className={inputCls} required {...f('username')} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Password *"><input type="password" className={inputCls} required minLength={6} {...f('password')} /></FormField>
          <FormField label="Phone"><input type="tel" className={inputCls} {...f('phone')} /></FormField>
        </div>
        <FormField label="Email"><input type="email" className={inputCls} {...f('email')} /></FormField>

        {role === 'ASHA' && <>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date of Birth">
              <input type="date" className={inputCls} value={form.date_of_birth} onChange={handleDOB}
                max={new Date().toISOString().split('T')[0]} />
            </FormField>
            <FormField label="Age"><input type="number" className={inputCls} min={18} {...f('age')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Gender">
              <select className={inputCls} {...f('gender')}>
                <option value="">Select</option>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Assigned Villages (comma-separated)">
              <input className={inputCls} placeholder="e.g. Rampur, Sitapur" {...f('assigned_villages')} />
            </FormField>
          </div>
          <FormField label="Address"><textarea className={inputCls} rows={2} {...f('address')} /></FormField>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name"><input className={inputCls} {...f('ec_name')} /></FormField>
            <FormField label="Relationship"><input className={inputCls} {...f('ec_relationship')} /></FormField>
          </div>
          <FormField label="Phone"><input type="tel" className={inputCls} {...f('ec_phone')} /></FormField>
        </>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit User Modal ───────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: user.name || '', phone: user.phone || '', email: user.email || '',
    address: user.address || '', gender: user.gender || '',
    assigned_villages: (user.assigned_villages || []).join(', '),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.put(`/admin/users/${user._id}`, {
        ...form,
        assigned_villages: form.assigned_villages.split(',').map(v => v.trim()).filter(Boolean),
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={true} onClose={onClose} title={`Edit — ${user.name}`}>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Full Name"><input className={inputCls} required {...f('name')} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Phone"><input type="tel" className={inputCls} {...f('phone')} /></FormField>
          <FormField label="Email"><input type="email" className={inputCls} {...f('email')} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Gender">
            <select className={inputCls} {...f('gender')}>
              <option value="">Select</option>
              <option>Female</option><option>Male</option><option>Other</option>
            </select>
          </FormField>
          <FormField label="Assigned Villages">
            <input className={inputCls} {...f('assigned_villages')} />
          </FormField>
        </div>
        <FormField label="Address"><textarea className={inputCls} rows={2} {...f('address')} /></FormField>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Reset Password Modal ──────────────────────────────────────
function ResetPasswordModal({ user, onClose, onSuccess }) {
  const [pw, setPw]         = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.patch(`/admin/users/${user._id}/reset-password`, { new_password: pw });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setSaving(false); }
  };

  return (
    <Modal open={true} onClose={onClose} title={`Reset Password — ${user.name}`}>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New Password">
          <input type="password" className={inputCls} required minLength={6}
            placeholder="Min 6 characters" value={pw} onChange={e => setPw(e.target.value)} />
        </FormField>
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving}
            className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
            {saving ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
