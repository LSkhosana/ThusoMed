import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { AuthPage } from './components/AuthPage';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { PracticeProfilePage } from './pages/PracticeProfile';
import { AppointmentSchedulePage } from './pages/AppointmentSchedule';
import { BookingFormBuilderPage } from './pages/BookingFormBuilder';
import { BookingPreviewPage } from './pages/BookingPreview';
import { AppointmentsManagementPage } from './pages/AppointmentsManagement';
import { EmbedCodeGeneratorPage } from './pages/EmbedCodeGenerator';
import { PatientAppPreviewPage } from './pages/PatientAppPreview';
import { SettingsPage } from './pages/Settings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { account, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!account) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { account } = useAuth();

  return (
    <Routes>
      <Route path="/" element={account ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="profile" element={<PracticeProfilePage />} />
        <Route path="schedule" element={<AppointmentSchedulePage />} />
        <Route path="booking-form" element={<BookingFormBuilderPage />} />
        <Route path="booking-preview" element={<BookingPreviewPage />} />
        <Route path="appointments" element={<AppointmentsManagementPage />} />
        <Route path="embeds" element={<EmbedCodeGeneratorPage />} />
        <Route path="patient-app" element={<PatientAppPreviewPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
