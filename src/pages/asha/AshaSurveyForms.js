import React, { useEffect, useState, useCallback } from 'react';
import {
  PageHeader, Spinner, Modal, FormField, EmptyState, inputCls
} from '../../components/common/UI';
import api from '../../utils/api';

// ── helpers ──────────────────────────────────────────────────────────────────
const EMPTY = { form_name: '', google_link: '', description: '' };

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Form Card ─────────────────────────────────────────────────────────────────
function FormCard({ form, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(form.google_link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openForm = () => window.open(form.google_link, '_blank', 'noopener,noreferrer');

  const shareForm = () => {
    if (navigator.share) {
      navigator.share({ title: form.form_name, url: form.google_link });
    } else {
      copyLink();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{form.form_name}</h3>
        </div>
      </div>

      {/* Link preview */}
      <p className="text-xs text-blue-600 truncate mb-2 font-mono bg-blue-50 px-2 py-1 rounded">
        {form.google_link}
      </p>

      {/* Description */}
      {form.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{form.description}</p>
      )}

      {/* Dates */}
      <div className="flex gap-4 text-xs text-gray-400 mb-4">
        <span>Created: {fmtDate(form.createdAt)}</span>
        <span>Updated: {fmtDate(form.updatedAt)}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={openForm}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          🔗 Open
        </button>
        <button
          onClick={shareForm}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          📤 Share
        </button>
        <button
          onClick={copyLink}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
            copied
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
          }`}
        >
          {copied ? '✅ Copied!' : '📎 Copy Link'}
        </button>
        <button
          onClick={() => onEdit(form)}
          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-xs font-medium rounded-lg border border-yellow-200 transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => onDelete(form)}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AshaSurveyForms() {
  const [forms, setForms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');

  const [showAddModal, setShowAddModal]     = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editTarget, setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm]   = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  // ── fetch ──
  const fetchForms = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      const r = await api.get('/survey-forms', { params });
      setForms(r.data.data || []);
    } catch {
      setForms([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchForms(); }, [fetchForms]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── ADD ──
  const handleAdd = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/survey-forms', form);
      setShowAddModal(false);
      setForm({ ...EMPTY });
      fetchForms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  // ── EDIT ──
  const openEdit = (f) => {
    setEditTarget(f);
    setForm({ form_name: f.form_name, google_link: f.google_link, description: f.description || '' });
    setError('');
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.put(`/survey-forms/${editTarget._id}`, form);
      setShowEditModal(false);
      setEditTarget(null);
      fetchForms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  // ── DELETE ──
  const openDelete = (f) => { setDeleteTarget(f); setShowDeleteModal(true); };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/survey-forms/${deleteTarget._id}`);
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchForms();
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete'); }
    finally { setSaving(false); }
  };

  // ── Form Modal Content (reused for Add & Edit) ──
  const FormModalBody = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
      <FormField label="Survey Form Name" required>
        <input
          className={inputCls} required
          placeholder="e.g. Maternal Health Survey"
          value={form.form_name}
          onChange={e => setF('form_name', e.target.value)}
        />
      </FormField>
      <FormField label="Google Form Link" required>
        <input
          className={inputCls} required
          type="url"
          placeholder="https://forms.google.com/..."
          value={form.google_link}
          onChange={e => setF('google_link', e.target.value)}
        />
      </FormField>
      <FormField label="Description (Optional)">
        <textarea
          rows={3}
          className={inputCls}
          placeholder="Brief description of the survey purpose..."
          value={form.description}
          onChange={e => setF('description', e.target.value)}
        />
      </FormField>
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="📋 Survey Forms"
        subtitle="Manage Google Forms used during field surveys"
        action={
          <button
            onClick={() => { setForm({ ...EMPTY }); setError(''); setShowAddModal(true); }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add Survey Form
          </button>
        }
      />

      {/* Search & Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Search survey forms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-sm text-gray-500">{forms.length} form{forms.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <Spinner />
      ) : forms.length === 0 ? (
        <EmptyState icon="📋" message={search ? `No forms found for "${search}"` : 'No survey forms added yet. Click "+ Add Survey Form" to begin.'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {forms.map(f => (
            <FormCard key={f._id} form={f} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      )}

      {/* ADD Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Survey Form">
        <FormModalBody onSubmit={handleAdd} submitLabel="Add Form" />
      </Modal>

      {/* EDIT Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Survey Form">
        <FormModalBody onSubmit={handleEdit} submitLabel="Save Changes" />
      </Modal>

      {/* DELETE Confirm Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Survey Form">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
            <p className="text-2xl mb-2">🗑️</p>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <strong>"{deleteTarget?.form_name}"</strong>?
            </p>
            <p className="text-xs text-gray-500 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-60"
            >
              {saving ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
