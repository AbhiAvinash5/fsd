import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import AuditDetail from './pages/AuditDetail';
import AuditHistory from './pages/AuditHistory';
import Comparison from './pages/Comparison';
import WcagReference from './pages/WcagReference';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedLayout() {
  const { isAuthenticated, loading, loginAsDemo } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If loading session
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Initializing AccessAudit Engine...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<NewScan />} />
            <Route path="/audits/:id" element={<AuditDetail />} />
            <Route path="/history" element={<AuditHistory />} />
            <Route path="/compare" element={<Comparison />} />
            <Route path="/wcag-guide" element={<WcagReference />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

