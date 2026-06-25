import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SettingsPanel from '../common/SettingsPanel';

const NAV = [
  { to: '/admin',              label: 'Dashboard',    icon: '🏠', end: true },
  { to: '/admin/women',        label: 'Pregnant Women', icon: '🤰' },
  { to: '/admin/children',     label: 'Children',     icon: '👶' },
  { to: '/admin/asha-workers', label: 'ASHA Workers', icon: '👩‍⚕️' },
  { to: '/admin/analytics',    label: 'Analytics',    icon: '📊' },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-blue-700">
        <p className="text-white font-semibold text-sm">{user?.name}</p>
        <p className="text-blue-300 text-xs">Administrator</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-700/50 hover:text-white'
              }`}>
            <span>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-blue-800 flex-shrink-0">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-white font-bold text-lg">⚕ ASHA Admin</h1>
          <p className="text-blue-300 text-xs">Health Management System</p>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-blue-800 z-50">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between">
              <h1 className="text-white font-bold text-lg">⚕ ASHA Admin</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white text-xl">&times;</button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm text-gray-500 hidden md:block">
            Admin Panel · {new Date().toLocaleDateString('en-IN')}
          </span>
          {/* Settings button top-right */}
          <SettingsPanel />
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
