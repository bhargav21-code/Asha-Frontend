import React, { useEffect, useState, useCallback } from 'react';
import {
  PageHeader, Spinner, Modal, FormField, EmptyState, inputCls, selectCls
} from '../../components/common/UI';
import api from '../../utils/api';
import { ALL_VILLAGES } from '../../utils/villages';

// ── Constants ─────────────────────────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const STATUS_COLORS = {
  Pending:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  Completed:   'bg-green-100 text-green-700 border-green-200',
  Missed:      'bg-red-100 text-red-700 border-red-200',
  Rescheduled: 'bg-blue-100 text-blue-700 border-blue-200',
};

const PRIORITY_DOT = {
  High:   'bg-red-500',
  Medium: 'bg-yellow-400',
  Low:    'bg-green-500',
};

const CALENDAR_STATUS_COLOR = {
  Completed:   'bg-green-500',
  Pending:     'bg-yellow-400',
  Missed:      'bg-red-500',
  Rescheduled: 'bg-blue-500',
};

const EMPTY_FORM = {
  patient_name: '', age: '', gender: 'Female', village: '', mobile_number: '',
  disease_name: '', disease_category: 'Other', description: '', symptoms: '',
  current_health_status: 'Stable',
  last_visit_date: '', next_followup_date: '',
  medicine_prescribed: '', treatment_notes: '', referral_information: '',
  hospital_visit_status: 'Not Required',
  status: 'Pending', priority: 'Medium',
};

const EMPTY_HISTORY = {
  visit_date: new Date().toISOString().split('T')[0],
  visit_type: 'Follow-Up', health_assessment: '',
  observations: '', actions_taken: '', referral_details: '',
  follow_up_required: 'false',
};

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || ''}`}>
      {status}
    </span>
  );
}

function PriorityDot({ priority }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${PRIORITY_DOT[priority] || 'bg-gray-400'}`} />;
}

// ── FollowUpForm — OUTSIDE main component to prevent focus loss ───────────────
function FollowUpForm({ form, setF, error, saving, onSubmit, submitLabel, onCancel }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient Information</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Patient Name" required>
          <input className={inputCls} required value={form.patient_name} onChange={e => setF('patient_name', e.target.value)} />
        </FormField>
        <FormField label="Age">
          <input type="number" className={inputCls} value={form.age} onChange={e => setF('age', e.target.value)} />
        </FormField>
        <FormField label="Gender">
          <select className={selectCls} value={form.gender} onChange={e => setF('gender', e.target.value)}>
            <option>Female</option><option>Male</option><option>Other</option>
          </select>
        </FormField>
        <FormField label="Village">
          <select className={selectCls} value={form.village} onChange={e => setF('village', e.target.value)}>
            <option value="">Select village</option>
            {ALL_VILLAGES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </FormField>
        <FormField label="Mobile Number">
          <input className={inputCls} value={form.mobile_number} onChange={e => setF('mobile_number', e.target.value)} />
        </FormField>
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Disease Information</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Disease Name">
          <input className={inputCls} value={form.disease_name} onChange={e => setF('disease_name', e.target.value)} />
        </FormField>
        <FormField label="Disease Category">
          <select className={selectCls} value={form.disease_category} onChange={e => setF('disease_category', e.target.value)}>
            {['Maternal','Child','Communicable','Non-Communicable','Nutritional','Other'].map(c => <option key={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Current Health Status">
          <select className={selectCls} value={form.current_health_status} onChange={e => setF('current_health_status', e.target.value)}>
            {['Critical','Serious','Stable','Improving','Recovered'].map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Symptoms">
        <input className={inputCls} placeholder="Comma-separated symptoms..." value={form.symptoms} onChange={e => setF('symptoms', e.target.value)} />
      </FormField>
      <FormField label="Description">
        <textarea rows={2} className={inputCls} value={form.description} onChange={e => setF('description', e.target.value)} />
      </FormField>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Visit Information</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Last Visit Date">
          <input type="date" className={inputCls} value={form.last_visit_date} onChange={e => setF('last_visit_date', e.target.value)} />
        </FormField>
        <FormField label="Next Follow-Up Date" required>
          <input type="date" className={inputCls} required value={form.next_followup_date} onChange={e => setF('next_followup_date', e.target.value)} />
        </FormField>
      </div>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Treatment Tracking</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Medicine Prescribed">
          <input className={inputCls} value={form.medicine_prescribed} onChange={e => setF('medicine_prescribed', e.target.value)} />
        </FormField>
        <FormField label="Hospital Visit Status">
          <select className={selectCls} value={form.hospital_visit_status} onChange={e => setF('hospital_visit_status', e.target.value)}>
            {['Not Required','Referred','Visited','Admitted','Discharged'].map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Referral Information">
          <input className={inputCls} value={form.referral_information} onChange={e => setF('referral_information', e.target.value)} />
        </FormField>
      </div>
      <FormField label="Treatment Notes">
        <textarea rows={2} className={inputCls} value={form.treatment_notes} onChange={e => setF('treatment_notes', e.target.value)} />
      </FormField>

      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Status & Priority</p>
      <div className="grid grid-cols-2 gap-3">
        <FormField label="Follow-Up Status">
          <select className={selectCls} value={form.status} onChange={e => setF('status', e.target.value)}>
            {['Pending','Completed','Missed','Rescheduled'].map(s => <option key={s}>{s}</option>)}
          </select>
        </FormField>
        <FormField label="Priority">
          <select className={selectCls} value={form.priority} onChange={e => setF('priority', e.target.value)}>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </FormField>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Calendar Component ────────────────────────────────────────────────────────
function Calendar({ events, onDateClick, viewMode, setViewMode }) {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const prevMonth = () => setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 });
  const nextMonth = () => setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const eventMap = {};
  events.forEach(e => {
    const d = new Date(e.next_followup_date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (!eventMap[key]) eventMap[key] = [];
    eventMap[key].push(e);
  });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isToday = (d) =>
    d === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

  const getEventsForDay = (d) => {
    const key = `${current.year}-${current.month}-${d}`;
    return eventMap[key] || [];
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      return d;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-green-700 text-white px-4 py-3 flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 hover:bg-green-600 rounded-lg text-lg leading-none">‹</button>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{MONTHS[current.month]} {current.year}</span>
          <div className="flex gap-1 text-xs">
            {['Monthly','Weekly','Daily'].map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-2 py-1 rounded ${viewMode === v ? 'bg-white text-green-700 font-semibold' : 'text-green-200 hover:bg-green-600'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <button onClick={nextMonth} className="p-1 hover:bg-green-600 rounded-lg text-lg leading-none">›</button>
      </div>

      <div className="px-4 py-2 bg-gray-50 border-b flex flex-wrap gap-3 text-xs text-gray-600">
        {[['bg-red-500','High Priority'],['bg-yellow-400','Pending'],['bg-green-500','Completed'],['bg-blue-500','Rescheduled']].map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-full ${cls}`} /> {label}
          </span>
        ))}
      </div>

      {viewMode === 'Monthly' && (
        <div className="p-3">
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const dayEvents = getEventsForDay(day);
              return (
                <button
                  key={day}
                  onClick={() => dayEvents.length > 0 && onDateClick(dayEvents, `${day} ${MONTHS[current.month]}`)}
                  className={`min-h-[52px] p-1 rounded-lg text-left transition-colors ${
                    isToday(day) ? 'bg-green-100 border-2 border-green-500' :
                    dayEvents.length > 0 ? 'bg-blue-50 hover:bg-blue-100 cursor-pointer border border-blue-100' :
                    'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${isToday(day) ? 'text-green-700' : 'text-gray-700'}`}>{day}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(e => (
                      <div key={e._id} className={`w-full h-1.5 rounded-full ${CALENDAR_STATUS_COLOR[e.status] || 'bg-gray-400'}`} />
                    ))}
                    {dayEvents.length > 2 && <p className="text-xs text-gray-400">+{dayEvents.length - 2}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'Weekly' && (
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1">
            {getWeekDays().map((d, i) => {
              const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const dayEvents = (eventMap[key] || []);
              const isToday2 = d.toDateString() === today.toDateString();
              return (
                <div key={i} className={`rounded-lg p-2 min-h-[80px] ${isToday2 ? 'bg-green-50 border border-green-300' : 'bg-gray-50 border border-gray-100'}`}>
                  <p className={`text-xs font-semibold mb-1 ${isToday2 ? 'text-green-700' : 'text-gray-600'}`}>
                    {DAYS[d.getDay()]} {d.getDate()}
                  </p>
                  {dayEvents.map(e => (
                    <div key={e._id} onClick={() => onDateClick([e], fmtDate(e.next_followup_date))}
                      className={`text-xs px-1 py-0.5 rounded mb-0.5 cursor-pointer text-white truncate ${CALENDAR_STATUS_COLOR[e.status] || 'bg-gray-400'}`}>
                      {e.patient_name}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'Daily' && (
        <div className="p-4">
          <p className="font-semibold text-gray-700 mb-3">Today — {today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          {(() => {
            const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
            const todayEvents = eventMap[key] || [];
            return todayEvents.length === 0
              ? <p className="text-gray-400 text-sm">No follow-ups scheduled for today</p>
              : todayEvents.map(e => (
                <div key={e._id} onClick={() => onDateClick([e], 'Today')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 mb-2 hover:bg-gray-50 cursor-pointer">
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${CALENDAR_STATUS_COLOR[e.status]}`} />
                  <div>
                    <p className="font-medium text-sm text-gray-900">{e.patient_name}</p>
                    <p className="text-xs text-gray-500">{e.village} · {e.disease_name}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
              ));
          })()}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AshaFollowUps() {
  const [records, setRecords]   = useState([]);
  const [calEvents, setCalEvents] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [calendarView, setCalendarView] = useState('Monthly');

  const [filterStatus,   setFilterStatus]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch]                 = useState('');

  const [showAddModal,     setShowAddModal]     = useState(false);
  const [showEditModal,    setShowEditModal]     = useState(false);
  const [showDetailModal,  setShowDetailModal]   = useState(false);
  const [showHistoryModal, setShowHistoryModal]  = useState(false);
  const [showCalModal,     setShowCalModal]      = useState(false);
  const [calModalEvents,   setCalModalEvents]    = useState([]);
  const [calModalDate,     setCalModalDate]      = useState('');

  const [selected, setSelected] = useState(null);
  const [form, setForm]         = useState({ ...EMPTY_FORM });
  const [histForm, setHistForm] = useState({ ...EMPTY_HISTORY });
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus)   params.status   = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (search)         params.search   = search;
      const r = await api.get('/followups', { params });
      setRecords(r.data.data || []);
    } catch { setRecords([]); }
    finally { setLoading(false); }
  }, [filterStatus, filterPriority, search]);

  const fetchCalendar = useCallback(async () => {
    const now = new Date();
    const r  = await api.get('/followups/calendar', { params: { year: now.getFullYear(), month: now.getMonth() + 1 } });
    const r2 = await api.get('/followups/calendar', { params: { year: now.getFullYear(), month: now.getMonth() + 2 } });
    setCalEvents([...(r.data.data || []), ...(r2.data.data || [])]);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);
  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  const setF  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setHF = (k, v) => setHistForm(f => ({ ...f, [k]: v }));

  const counts = {
    All:         records.length,
    Pending:     records.filter(r => r.status === 'Pending').length,
    Completed:   records.filter(r => r.status === 'Completed').length,
    Missed:      records.filter(r => r.status === 'Missed').length,
    Rescheduled: records.filter(r => r.status === 'Rescheduled').length,
  };

  const handleAdd = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/followups', {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        last_visit_date:    form.last_visit_date    || undefined,
        next_followup_date: form.next_followup_date,
      });
      setShowAddModal(false);
      setForm({ ...EMPTY_FORM });
      fetchRecords(); fetchCalendar();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const openEdit = (rec) => {
    setSelected(rec);
    setForm({
      patient_name: rec.patient_name, age: rec.age || '', gender: rec.gender || 'Female',
      village: rec.village || '', mobile_number: rec.mobile_number || '',
      disease_name: rec.disease_name || '', disease_category: rec.disease_category || 'Other',
      description: rec.description || '', symptoms: rec.symptoms || '',
      current_health_status: rec.current_health_status || 'Stable',
      last_visit_date:    rec.last_visit_date    ? rec.last_visit_date.split('T')[0]    : '',
      next_followup_date: rec.next_followup_date ? rec.next_followup_date.split('T')[0] : '',
      medicine_prescribed:  rec.medicine_prescribed  || '',
      treatment_notes:      rec.treatment_notes      || '',
      referral_information: rec.referral_information || '',
      hospital_visit_status: rec.hospital_visit_status || 'Not Required',
      status: rec.status || 'Pending', priority: rec.priority || 'Medium',
    });
    setError(''); setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.put(`/followups/${selected._id}`, {
        ...form, age: form.age ? Number(form.age) : undefined,
        last_visit_date:    form.last_visit_date    || undefined,
        next_followup_date: form.next_followup_date,
      });
      setShowEditModal(false);
      fetchRecords(); fetchCalendar();
    } catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  const openHistory = (rec) => {
    setSelected(rec); setHistForm({ ...EMPTY_HISTORY }); setError(''); setShowHistoryModal(true);
  };

  const handleAddHistory = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post(`/followups/${selected._id}/history`, {
        ...histForm,
        follow_up_required: histForm.follow_up_required === 'true',
      });
      setShowHistoryModal(false);
      fetchRecords();
    } catch (err) { setError(err.response?.data?.message || 'Failed to add history'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this follow-up record?')) return;
    await api.delete(`/followups/${id}`);
    fetchRecords(); fetchCalendar();
    if (showDetailModal) setShowDetailModal(false);
  };

  const handleDateClick = (events, dateLabel) => {
    setCalModalEvents(events);
    setCalModalDate(dateLabel);
    setShowCalModal(true);
  };

  const summaryData = [
    { label: 'Total',       val: counts.All,         color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Pending',     val: counts.Pending,     color: 'bg-yellow-50 text-yellow-700 border-yellow-100' },
    { label: 'Completed',   val: counts.Completed,   color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Missed',      val: counts.Missed,      color: 'bg-red-50 text-red-700 border-red-100' },
    { label: 'Rescheduled', val: counts.Rescheduled, color: 'bg-purple-50 text-purple-700 border-purple-100' },
  ];

  return (
    <div>
      <PageHeader
        title="🔔 Follow-Up Management"
        subtitle="Track and manage all patient follow-up visits"
        action={
          <button
            onClick={() => { setForm({ ...EMPTY_FORM }); setError(''); setShowAddModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Follow-Up
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {summaryData.map(s => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 mb-4">
        {['list','calendar'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {t === 'list' ? '📋 List View' : '📅 Calendar View'}
          </button>
        ))}
      </div>

      {/* ── LIST VIEW ── */}
      {activeTab === 'list' && (
        <>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-48"
                placeholder="Search patient..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className={`${selectCls} w-36`} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Status</option>
              {['Pending','Completed','Missed','Rescheduled'].map(s => <option key={s}>{s}</option>)}
            </select>
            <select className={`${selectCls} w-36`} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priority</option>
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            {(search || filterStatus || filterPriority) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}
                className="text-xs text-gray-500 hover:text-gray-700 underline">Clear filters</button>
            )}
          </div>

          {loading ? <Spinner /> : records.length === 0 ? (
            <EmptyState icon="🔔" message="No follow-up records found." />
          ) : (
            <div className="space-y-3">
              {records.map(r => (
                <div key={r._id} className={`bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition-shadow ${
                  r.priority === 'High' ? 'border-l-4 border-l-red-400' :
                  r.priority === 'Medium' ? 'border-l-4 border-l-yellow-400' : 'border-l-4 border-l-green-400'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <PriorityDot priority={r.priority} />
                        <h3 className="font-semibold text-gray-900">{r.patient_name}</h3>
                        <StatusBadge status={r.status} />
                        <span className="text-xs text-gray-400">{r.age ? `${r.age} yr` : ''} {r.gender || ''}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {r.disease_name || '—'} · <span className="text-gray-500">{r.disease_category}</span>
                        {r.village && <> · 📍 {r.village}</>}
                      </p>
                      {r.symptoms && <p className="text-xs text-gray-400 mt-1">Symptoms: {r.symptoms}</p>}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Last visit: {fmtDate(r.last_visit_date)}</span>
                        <span className={`font-medium ${new Date(r.next_followup_date) < new Date() && r.status === 'Pending' ? 'text-red-600' : 'text-green-700'}`}>
                          Next: {fmtDate(r.next_followup_date)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <button onClick={() => { setSelected(r); setShowDetailModal(true); }}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded-lg border border-blue-200 font-medium">View</button>
                      <button onClick={() => openEdit(r)}
                        className="px-3 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs rounded-lg border border-yellow-200 font-medium">Edit</button>
                      <button onClick={() => openHistory(r)}
                        className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded-lg border border-green-200 font-medium">+ Visit</button>
                      <button onClick={() => handleDelete(r._id)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs rounded-lg border border-red-200 font-medium">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── CALENDAR VIEW ── */}
      {activeTab === 'calendar' && (
        <Calendar events={calEvents} onDateClick={handleDateClick} viewMode={calendarView} setViewMode={setCalendarView} />
      )}

      {/* ── ADD Modal ── */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Follow-Up Record">
        <FollowUpForm
          form={form} setF={setF} error={error} saving={saving}
          onSubmit={handleAdd} submitLabel="Add Follow-Up"
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* ── EDIT Modal ── */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Follow-Up Record">
        <FollowUpForm
          form={form} setF={setF} error={error} saving={saving}
          onSubmit={handleEdit} submitLabel="Save Changes"
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* ── DETAIL Modal ── */}
      <Modal open={showDetailModal} onClose={() => setShowDetailModal(false)} title="Follow-Up Details">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Patient</p><p className="font-semibold">{selected.patient_name}</p></div>
              <div><p className="text-xs text-gray-400">Age / Gender</p><p className="font-semibold">{selected.age || '—'} yr · {selected.gender}</p></div>
              <div><p className="text-xs text-gray-400">Village</p><p className="font-semibold">{selected.village || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Mobile</p><p className="font-semibold">{selected.mobile_number || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Disease</p><p className="font-semibold">{selected.disease_name || '—'} ({selected.disease_category})</p></div>
              <div><p className="text-xs text-gray-400">Status</p><StatusBadge status={selected.status} /></div>
              <div><p className="text-xs text-gray-400">Health Status</p><p className="font-semibold">{selected.current_health_status}</p></div>
              <div><p className="text-xs text-gray-400">Priority</p><div className="flex items-center gap-1"><PriorityDot priority={selected.priority} /><span className="font-semibold">{selected.priority}</span></div></div>
              <div><p className="text-xs text-gray-400">Last Visit</p><p className="font-semibold">{fmtDate(selected.last_visit_date)}</p></div>
              <div><p className="text-xs text-gray-400">Next Follow-Up</p><p className="font-semibold text-green-700">{fmtDate(selected.next_followup_date)}</p></div>
            </div>

            {selected.symptoms && <div className="bg-gray-50 rounded-lg p-3 text-sm"><p className="text-xs text-gray-400 mb-1">Symptoms</p><p>{selected.symptoms}</p></div>}
            {selected.medicine_prescribed && <div className="bg-blue-50 rounded-lg p-3 text-sm"><p className="text-xs text-gray-400 mb-1">Medicine Prescribed</p><p>{selected.medicine_prescribed}</p></div>}
            {selected.treatment_notes && <div className="bg-green-50 rounded-lg p-3 text-sm"><p className="text-xs text-gray-400 mb-1">Treatment Notes</p><p>{selected.treatment_notes}</p></div>}
            {selected.referral_information && <div className="bg-yellow-50 rounded-lg p-3 text-sm"><p className="text-xs text-gray-400 mb-1">Referral</p><p>{selected.referral_information}</p></div>}

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-700">📅 Visit History Timeline</p>
                <button onClick={() => openHistory(selected)}
                  className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium">
                  + Add Visit
                </button>
              </div>
              {!selected.visit_history?.length ? (
                <p className="text-sm text-gray-400 text-center py-4">No visits recorded yet</p>
              ) : (
                <div className="relative pl-4">
                  <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-gray-200" />
                  {selected.visit_history.slice().reverse().map((h, i) => (
                    <div key={h._id || i} className="relative mb-4">
                      <div className="absolute -left-3 top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      <div className="bg-gray-50 rounded-lg p-3 text-sm ml-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-gray-800">{fmtDate(h.visit_date)}</p>
                          <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded border">{h.visit_type}</span>
                        </div>
                        {h.health_assessment && <p className="text-gray-600 text-xs mb-1"><span className="font-medium">Assessment:</span> {h.health_assessment}</p>}
                        {h.observations && <p className="text-gray-600 text-xs mb-1"><span className="font-medium">Observations:</span> {h.observations}</p>}
                        {h.actions_taken && <p className="text-gray-600 text-xs mb-1"><span className="font-medium">Actions:</span> {h.actions_taken}</p>}
                        {h.referral_details && <p className="text-gray-600 text-xs"><span className="font-medium">Referral:</span> {h.referral_details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => openEdit(selected)} className="flex-1 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm hover:bg-yellow-100">Edit Record</button>
              <button onClick={() => handleDelete(selected._id)} className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm hover:bg-red-100">Delete</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── ADD VISIT HISTORY Modal ── */}
      <Modal open={showHistoryModal} onClose={() => setShowHistoryModal(false)} title={`Add Visit — ${selected?.patient_name || ''}`}>
        {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
        <form onSubmit={handleAddHistory} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Visit Date" required>
              <input type="date" className={inputCls} required value={histForm.visit_date} onChange={e => setHF('visit_date', e.target.value)} />
            </FormField>
            <FormField label="Visit Type">
              <select className={selectCls} value={histForm.visit_type} onChange={e => setHF('visit_type', e.target.value)}>
                {['Follow-Up','Pregnancy','Child','Vaccination','General','Postnatal'].map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Health Assessment">
            <input className={inputCls} value={histForm.health_assessment} onChange={e => setHF('health_assessment', e.target.value)} />
          </FormField>
          <FormField label="Observations">
            <textarea rows={2} className={inputCls} value={histForm.observations} onChange={e => setHF('observations', e.target.value)} />
          </FormField>
          <FormField label="Actions Taken">
            <textarea rows={2} className={inputCls} value={histForm.actions_taken} onChange={e => setHF('actions_taken', e.target.value)} />
          </FormField>
          <FormField label="Referral Details">
            <input className={inputCls} value={histForm.referral_details} onChange={e => setHF('referral_details', e.target.value)} />
          </FormField>
          <FormField label="Follow-Up Required?">
            <select className={selectCls} value={histForm.follow_up_required} onChange={e => setHF('follow_up_required', e.target.value)}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </FormField>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setShowHistoryModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60">
              {saving ? 'Saving...' : 'Add Visit Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── CALENDAR DATE Modal ── */}
      <Modal open={showCalModal} onClose={() => setShowCalModal(false)} title={`Follow-Ups — ${calModalDate}`}>
        <div className="space-y-3">
          {calModalEvents.map(e => (
            <div key={e._id} className={`p-3 rounded-lg border-l-4 ${
              e.priority === 'High' ? 'border-l-red-400 bg-red-50' :
              e.priority === 'Medium' ? 'border-l-yellow-400 bg-yellow-50' : 'border-l-green-400 bg-green-50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-gray-900">{e.patient_name}</p>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-sm text-gray-600">{e.disease_name} · {e.village}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setShowCalModal(false); const full = records.find(r => r._id === e._id); if (full) { setSelected(full); setShowDetailModal(true); }}}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">View</button>
                <button onClick={() => { setShowCalModal(false); const full = records.find(r => r._id === e._id); if (full) openEdit(full); }}
                  className="text-xs bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}