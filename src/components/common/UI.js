import React from 'react';

export function StatCard({ label, value, icon, color = 'green', sub }) {
  const colors = {
    green:  'bg-green-50 text-green-600 border-green-100',
    red:    'bg-red-50 text-red-600 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-xl border text-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    Red:    'bg-red-100 text-red-700 border-red-200',
    Yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Green:  'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[priority] || map.Green}`}>
      {priority}
    </span>
  );
}

export function NutritionBadge({ status }) {
  const map = {
    'Normal':               'bg-green-100 text-green-700 border-green-200',
    'Moderate Malnutrition':'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Severe Malnutrition':  'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || ''}`}>
      {status}
    </span>
  );
}

export function HighRiskBadge({ isHighRisk }) {
  return isHighRisk
    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">⚠ High Risk</span>
    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-100 text-green-700 border-green-200">Normal</span>;
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, error, children, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
export const selectCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white';

export function EmptyState({ icon = '📋', message }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}
        className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
    </div>
  );
}
