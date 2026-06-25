import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SettingsPanel from '../common/SettingsPanel';

const NAV = [
  { to: '/asha',            label: 'Dashboard',    icon: '🏠', end: true },
  { to: '/asha/visits',     label: 'Log Visit',    icon: '📋' },
  { to: '/asha/women',      label: 'Women',        icon: '🤰' },
  { to: '/asha/children',   label: 'Children',     icon: '👶' },
  { to: '/asha/families',   label: 'Families',     icon: '🏡' },
  { to: '/asha/anganwadi',  label: 'Anganwadi',    icon: '🏫' },
  { to: '/asha/surveys',    label: 'Survey Forms', icon: '📄' },
  { to: '/asha/followups',  label: 'Follow-Ups',   icon: '🔔' },
  { to: '/asha/reports',    label: 'My Reports',   icon: '📝' },
];

export default function AshaLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-green-700">
        <p className="text-white font-semibold text-sm">{user?.name}</p>
        <p className="text-green-300 text-xs">ASHA Worker</p>
        {user?.assigned_villages?.length > 0 && (
          <p className="text-green-200 text-xs mt-1">📍 {user.assigned_villages.join(', ')}</p>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-green-700 text-white' : 'text-green-100 hover:bg-green-700/60 hover:text-white'
              }`}>
            <span>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 bg-green-800 flex-shrink-0">
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-white font-bold text-base">💚 ASHA Worker</h1>
          <p className="text-green-300 text-xs">Health Monitoring</p>
        </div>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-green-800 z-50">
            <div className="px-4 pt-5 pb-3 flex items-center justify-between">
              <h1 className="text-white font-bold">💚 ASHA Worker</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-white text-xl">&times;</button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button className="md:hidden text-gray-500" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm text-gray-500 hidden md:block">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
