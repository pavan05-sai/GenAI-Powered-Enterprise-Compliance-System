import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DocumentsPage from './pages/DocumentsPage';
import KnowledgeGraphPage from './pages/KnowledgeGraphPage';
import AiAnalystPage from './pages/AiAnalystPage';
import CompliancePage from './pages/CompliancePage';
import AuditTrailPage from './pages/AuditTrailPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still rehydrating from localStorage — show nothing yet
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#E6E2D8] border-t-[#8C6B1B] animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Enterprise Workspace Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="graph" element={<KnowledgeGraphPage />} />
            <Route path="ai-analyst" element={<AiAnalystPage />} />
            <Route path="compliance" element={<CompliancePage />} />
            <Route path="audit-trail" element={<AuditTrailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
