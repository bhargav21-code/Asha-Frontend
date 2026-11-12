import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminWomen from './pages/admin/AdminWomen';
import AdminChildren from './pages/admin/AdminChildren';
import AdminASHA from './pages/admin/AdminASHA';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminUserManagement from './pages/admin/AdminUserManagement';

import AshaLayout from './components/asha/AshaLayout';
import AshaDashboard from './pages/asha/AshaDashboard';
import AshaWomen from './pages/asha/AshaWomen';
import AshaChildren from './pages/asha/AshaChildren';
import AshaFamilies from './pages/asha/AshaFamilies';
import AshaVisits from './pages/asha/AshaVisits';
import AshaReports from './pages/asha/AshaReports';
import AshaAnganwadi from './pages/asha/AshaAnganwadi';
import AshaSurveyForms from './pages/asha/AshaSurveyForms';
import AshaFollowUps from './pages/asha/AshaFollowUps';

function SessionVerificationError() {
  const { retrySessionRestore, logout } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center text-gray-600" role="alert">
      <p>We could not verify your saved session. Check your connection and try again.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={retrySessionRestore} className="rounded bg-gray-900 px-4 py-2 text-white">
          Retry session check
        </button>
        <button type="button" onClick={logout} className="rounded border px-4 py-2">
          Sign in again
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading, sessionCheckError } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>;
  if (sessionCheckError) return <SessionVerificationError />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'Admin' ? '/admin' : '/asha'} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading, sessionCheckError } = useAuth();
  if (loading) return null;
  if (sessionCheckError) return <SessionVerificationError />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'Admin' ? '/admin' : '/asha'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="women" element={<AdminWomen />} />
              <Route path="children" element={<AdminChildren />} />
              <Route path="asha-workers" element={<AdminASHA />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="user-management" element={<AdminUserManagement />} />
            </Route>

            {/* ASHA Routes */}
            <Route path="/asha" element={<ProtectedRoute role="ASHA"><AshaLayout /></ProtectedRoute>}>
              <Route index element={<AshaDashboard />} />
              <Route path="women"     element={<AshaWomen />} />
              <Route path="children"  element={<AshaChildren />} />
              <Route path="families"  element={<AshaFamilies />} />
              <Route path="anganwadi" element={<AshaAnganwadi />} />
              <Route path="surveys"   element={<AshaSurveyForms />} />
              <Route path="followups" element={<AshaFollowUps />} />
              <Route path="visits"    element={<AshaVisits />} />
              <Route path="reports"   element={<AshaReports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}
