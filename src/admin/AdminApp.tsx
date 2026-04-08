import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminGuard from './AdminGuard';
import AdminLayout from './AdminLayout';
import LeadersPage from './pages/LeadersPage';
import TextsPage from './pages/TextsPage';
import ContactPage from './pages/ContactPage';
import SermonsPage from './pages/SermonsPage';
import MinistriesPage from './pages/MinistriesPage';
import PrayerRequestsPage from './pages/PrayerRequestsPage';
import { ToastProvider } from './components/Toast';
import './admin.css';

const AdminApp: React.FC = () => {
  return (
    <ToastProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          path="*"
          element={
            <AdminGuard>
              <AdminLayout>
                <Routes>
                  <Route index element={<Navigate to="leaders" replace />} />
                  <Route path="leaders" element={<LeadersPage />} />
                  <Route path="sermons" element={<SermonsPage />} />
                  <Route path="ministries" element={<MinistriesPage />} />
                  <Route path="prayer" element={<PrayerRequestsPage />} />
                  <Route path="texts" element={<TextsPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="*" element={<Navigate to="leaders" replace />} />
                </Routes>
              </AdminLayout>
            </AdminGuard>
          }
        />
      </Routes>
    </ToastProvider>
  );
};

export default AdminApp;
