import api from '../../utils/api';
import React, { useEffect, useState } from 'react';
import {
  PageHeader, Spinner, Modal, FormField,
  EmptyState, inputCls, selectCls, NutritionBadge
} from '../../components/common/UI';
import { useAuth } from '../../context/AuthContext';

// ── helpers ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  district: '', taluka: '', village: '', anganwadi_name: '',
  worker_name: '', contact_number: '',
  'facility.drinking_water': 'false',
  'facility.toilet': 'false',
  'facility.electricity': 'false',
  'facility.nutrition_stock': 'false',
  'facility.building_condition': 'Good',
};

const EMPTY_CHILD = {
  child_name: '', age: '', gender: 'Female',
  weight: '', height: '',
  nutrition_status: 'Normal',
  vaccination_status: 'Partially Vaccinated',
};

function buildPayload(f) {
  return {
    district: f.district, taluka: f.taluka,
    village: f.village, anganwadi_name: f.anganwadi_name,
    worker_name: f.worker_name, contact_number: f.contact_number,
    facility: {
      drinking_water:     f['facility.drinking_water']    === 'true',
      toilet:             f['facility.toilet']             === 'true',
      electricity:        f['facility.electricity']        === 'true',
      nutrition_stock:    f['facility.nutrition_stock']    === 'true',
      building_condition: f['facility.building_condition'],
    },
  };
}

// ── StatBox ───────────────────────────────────────────────────────────────────
function StatBox({ label, value, color = 'gray' }) {
  const colors = {
    green:  'bg-green-50 text-green-700 border-green-100',
    red:    'bg-red-50 text-red-700 border-red-100',
    blue:   'bg-blue-50 text-blue-700 border-blue-100',
    gray:   'bg-gray-50 text-gray-700 border-gray-100',
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <p className="text-3xl font-bold">{value ?? 0}</p>
      <p className="text-xs mt-1 font-medium">{label}</p>
    </div>
  );
}

// ── FacilityIcon ──────────────────────────────────────────────────────────────
function FacilityIcon({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
      ok ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
    }`}>
      {ok ? '✅' : '❌'} {label}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AshaAnganwadi() {
  const { user } = useAuth();

  const [list, setList]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState(null); // currently viewed anganwadi

  // modals
  const [showAddModal, setShowAddModal]         = useState(false);
  const [showChildModal, setShowChildModal]     = useState(false);
  const [showAttendModal, setShowAttendModal]   = useState(false);

  const [form, setForm]           = useState({ ...EMPTY_FORM, village: user?.assigned_villages?.[0] || '' });
  const [childForm, setChildForm] = useState({ ...EMPTY_CHILD });
  const [presentIds, setPresentIds] = useState(new Set());

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  // ── fetch ──
  const fetchList = async () => {
    setLoading(true);
    try {
      const r = await api.get('/anganwadi');
      setList(r.data.data || []);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // ── helpers ──
  const setF  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setCF = (k, v) => setChildForm(f => ({ ...f, [k]: v }));

  // ── submit new anganwadi ──
  const handleAddSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/anganwadi', buildPayload(form));
      setShowAddModal(false);
      setForm({ ...EMPTY_FORM, village: user?.assigned_villages?.[0] || '' });
      fetchList();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── add child ──
  const handleAddChild = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post(`/anganwadi/${selected._id}/children`, {
        ...childForm,
        age:    Number(childForm.age)    || 0,
        weight: childForm.weight ? Number(childForm.weight) : undefined,
        height: childForm.height ? Number(childForm.height) : undefined,
      });
      setShowChildModal(false);
      setChildForm({ ...EMPTY_CHILD });
      // refresh selected
      const r = await api.get(`/anganwadi/${selected._id}`);
      setSelected(r.data.data);
      fetchList();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add child'); }
    finally { setSaving(false); }
  };

  // ── mark attendance ──
  const openAttendance = (anganwadi) => {
    setSelected(anganwadi);
    setPresentIds(new Set(
      (anganwadi.children || []).filter(c => c.present_today).map(c => c._id)
    ));
    setShowAttendModal(true);
  };

  const togglePresent = (id) => {
    setPresentIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleMarkAttendance = async () => {
    setSaving(true);
    try {
      const r = await api.put(`/anganwadi/${selected._id}/mark-attendance`, {
        present_ids: Array.from(presentIds),
      });
      setShowAttendModal(false);
      setSelected(r.data.data);
      fetchList();
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  // ── open detail view ──
  const openDetail = async (anganwadi) => {
    const r = await api.get(`/anganwadi/${anganwadi._id}`);
    setSelected(r.data.data);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="🏫 Anganwadi Module"
        subtitle="Manage Anganwadi centres, children, and facilities"
        action={
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Anganwadi
          </button>
        }
      />

      {/* ── Detail Panel ── */}
      {selected && (
        <div className="bg-white rounded-2xl border border-green-100 shadow-md mb-6 overflow-hidden">
          {/* Header */}
          <div className="bg-green-700 text-white px-6 py-4 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{selected.anganwadi_name}</h2>
              <p className="text-green-200 text-sm">
                {selected.village}, {selected.taluka}, {selected.district}
              </p>
              <p className="text-green-100 text-xs mt-1">
                Worker: {selected.worker_name}
                {selected.contact_number && ` · 📞 ${selected.contact_number}`}
              </p>
            </div>
            <button onClick={() => setSelected(null)} className="text-green-200 hover:text-white text-2xl leading-none">&times;</button>
          </div>

          <div className="p-6 space-y-6">
            {/* Statistics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">📊 Statistics</h3>
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="Total Registered Children" value={selected.total_registered} color="blue" />
                <StatBox label="Present Today"             value={selected.present_today}    color="green" />
                <StatBox label="Absent Today"              value={selected.absent_today}     color="red" />
              </div>
            </div>

            {/* Facility Monitoring */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">🏢 Facility Monitoring</h3>
              <div className="flex flex-wrap gap-2">
                <FacilityIcon ok={selected.facility?.drinking_water}  label="Drinking Water" />
                <FacilityIcon ok={selected.facility?.toilet}          label="Toilet" />
                <FacilityIcon ok={selected.facility?.electricity}     label="Electricity" />
                <FacilityIcon ok={selected.facility?.nutrition_stock} label="Nutrition Stock" />
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  selected.facility?.building_condition === 'Good'    ? 'bg-green-50 text-green-700 border-green-200' :
                  selected.facility?.building_condition === 'Average' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  🏗️ Building: {selected.facility?.building_condition}
                </span>
              </div>
            </div>

            {/* Children */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">👶 Children</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setError(''); setShowChildModal(true); }}
                    className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium"
                  >
                    + Add Child
                  </button>
                  {(selected.children?.length > 0) && (
                    <button
                      onClick={() => openAttendance(selected)}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium"
                    >
                      Mark Attendance
                    </button>
                  )}
                </div>
              </div>

              {!selected.children?.length ? (
                <EmptyState icon="👶" message="No children registered yet. Click '+ Add Child' to begin." />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Name','Age','Gender','Weight (kg)','Height (cm)','Nutrition','Vaccination','Attendance'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selected.children.map(c => (
                        <tr key={c._id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-medium text-gray-900">{c.child_name}</td>
                          <td className="px-3 py-2.5 text-gray-600">{c.age} yr</td>
                          <td className="px-3 py-2.5 text-gray-600">{c.gender}</td>
                          <td className="px-3 py-2.5 text-gray-600">{c.weight ?? '—'}</td>
                          <td className="px-3 py-2.5 text-gray-600">{c.height ?? '—'}</td>
                          <td className="px-3 py-2.5"><NutritionBadge status={c.nutrition_status} /></td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                              c.vaccination_status === 'Fully Vaccinated'
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : c.vaccination_status === 'Partially Vaccinated'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                            }`}>{c.vaccination_status}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            {c.present_today
                              ? <span className="text-green-600 font-medium text-xs">✅ Present</span>
                              : <span className="text-red-500 font-medium text-xs">❌ Absent</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Anganwadi Cards List ── */}
      {loading ? <Spinner /> : list.length === 0 ? (
        <EmptyState icon="🏫" message="No Anganwadi centres registered yet. Click '+ Add Anganwadi' to begin." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(a => (
            <div key={a._id}
              className={`bg-white rounded-xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md hover:border-green-300 ${
                selected?._id === a._id ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-100'
              }`}
              onClick={() => openDetail(a)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{a.anganwadi_name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">📍 {a.village}, {a.taluka}, {a.district}</p>
                </div>
                <span className="text-2xl">🏫</span>
              </div>

              <p className="text-sm text-gray-600 mb-3">👩 {a.worker_name}
                {a.contact_number && <span className="text-gray-400"> · {a.contact_number}</span>}
              </p>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  ['Total', a.total_registered ?? a.children?.length ?? 0, 'text-blue-600'],
                  ['Present', a.present_today ?? 0, 'text-green-600'],
                  ['Absent',  a.absent_today  ?? 0, 'text-red-500'],
                ].map(([l, v, cls]) => (
                  <div key={l} className="text-center bg-gray-50 rounded-lg py-2">
                    <p className={`text-lg font-bold ${cls}`}>{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>

              {/* Facility dots */}
              <div className="flex flex-wrap gap-1">
                {a.facility?.drinking_water  && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">💧 Water</span>}
                {a.facility?.toilet          && <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">🚽 Toilet</span>}
                {a.facility?.electricity     && <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-100">💡 Power</span>}
                {a.facility?.nutrition_stock && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">🥗 Stock</span>}
              </div>

              <p className="text-xs text-green-600 mt-3 font-medium">Click to view details →</p>
            </div>
          ))}
        </div>
      )}

      {/* ── ADD ANGANWADI MODAL ── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register Anganwadi Centre">
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleAddSubmit} className="space-y-4">

          {/* Location Information */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📍 Location Information</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="District" required>
              <input className={inputCls} required value={form.district} onChange={e => setF('district', e.target.value)} placeholder="e.g. Gandhinagar" />
            </FormField>
            <FormField label="Taluka" required>
              <input className={inputCls} required value={form.taluka} onChange={e => setF('taluka', e.target.value)} placeholder="e.g. Dehgam" />
            </FormField>
            <FormField label="Village" required>
              <select className={selectCls} value={form.village} onChange={e => setF('village', e.target.value)} required>
                <option value="">Select village</option>
                {user?.assigned_villages?.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Anganwadi Name" required>
              <input className={inputCls} required value={form.anganwadi_name} onChange={e => setF('anganwadi_name', e.target.value)} placeholder="e.g. Anganwadi No. 12" />
            </FormField>
          </div>

          {/* Anganwadi Details */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">👩 Anganwadi Details</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Worker Name" required>
              <input className={inputCls} required value={form.worker_name} onChange={e => setF('worker_name', e.target.value)} />
            </FormField>
            <FormField label="Contact Number">
              <input className={inputCls} value={form.contact_number} onChange={e => setF('contact_number', e.target.value)} />
            </FormField>
          </div>

          {/* Facility Monitoring */}
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">🏢 Facility Monitoring</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['facility.drinking_water',  'Drinking Water Available'],
              ['facility.toilet',          'Toilet Available'],
              ['facility.electricity',     'Electricity Available'],
              ['facility.nutrition_stock', 'Nutrition Stock Available'],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer bg-gray-50 rounded-lg px-3 py-2">
                <input type="checkbox"
                  checked={form[k] === 'true'}
                  onChange={e => setF(k, e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 text-green-600 rounded"
                />
                {label}
              </label>
            ))}
          </div>
          <FormField label="Building Condition">
            <select className={selectCls} value={form['facility.building_condition']} onChange={e => setF('facility.building_condition', e.target.value)}>
              <option>Good</option>
              <option>Average</option>
              <option>Poor</option>
            </select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Register Anganwadi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ADD CHILD MODAL ── */}
      <Modal open={showChildModal} onClose={() => setShowChildModal(false)} title={`Add Child — ${selected?.anganwadi_name || ''}`}>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleAddChild} className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">👶 Child Information</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Child Name" required>
              <input className={inputCls} required value={childForm.child_name} onChange={e => setCF('child_name', e.target.value)} />
            </FormField>
            <FormField label="Age (years)" required>
              <input type="number" min={0} max={6} className={inputCls} required value={childForm.age} onChange={e => setCF('age', e.target.value)} />
            </FormField>
            <FormField label="Gender">
              <select className={selectCls} value={childForm.gender} onChange={e => setCF('gender', e.target.value)}>
                <option>Female</option><option>Male</option><option>Other</option>
              </select>
            </FormField>
            <FormField label="Weight (kg)">
              <input type="number" step="0.1" className={inputCls} value={childForm.weight} onChange={e => setCF('weight', e.target.value)} />
            </FormField>
            <FormField label="Height (cm)">
              <input type="number" step="0.1" className={inputCls} value={childForm.height} onChange={e => setCF('height', e.target.value)} />
            </FormField>
            <FormField label="Nutrition Status">
              <select className={selectCls} value={childForm.nutrition_status} onChange={e => setCF('nutrition_status', e.target.value)}>
                <option>Normal</option>
                <option>Moderate Malnutrition</option>
                <option>Severe Malnutrition</option>
              </select>
            </FormField>
            <FormField label="Vaccination Status">
              <select className={selectCls} value={childForm.vaccination_status} onChange={e => setCF('vaccination_status', e.target.value)}>
                <option>Fully Vaccinated</option>
                <option>Partially Vaccinated</option>
                <option>Not Vaccinated</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowChildModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Adding...' : 'Add Child'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── ATTENDANCE MODAL ── */}
      <Modal open={showAttendModal} onClose={() => setShowAttendModal(false)} title={`Mark Attendance — ${selected?.anganwadi_name || ''}`}>
        <p className="text-sm text-gray-500 mb-4">Check children who are <strong>present today</strong>.</p>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {(selected?.children || []).map(c => (
            <label key={c._id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
              <input type="checkbox"
                checked={presentIds.has(c._id)}
                onChange={() => togglePresent(c._id)}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-sm text-gray-800 font-medium">{c.child_name}</span>
              <span className="text-xs text-gray-400">{c.age} yr · {c.gender}</span>
            </label>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-green-700">{presentIds.size}</span> present ·{' '}
            <span className="font-semibold text-red-600">{(selected?.children?.length || 0) - presentIds.size}</span> absent
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowAttendModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleMarkAttendance} disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
