import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { PracticeProvider } from './context/PracticeContext';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardOverview } from './pages/DashboardOverview';
import { PracticeProfilePage } from './pages/PracticeProfile';
import { AppointmentSchedulePage } from './pages/AppointmentSchedule';
import { AppointmentTypesPage } from './pages/AppointmentTypes';
import { AppointmentsManagementPage } from './pages/AppointmentsManagement';
import { PatientAppPreviewPage } from './pages/PatientAppPreview';
import { SettingsPage } from './pages/Settings';
import { PublicPracticeAppointmentsPage } from './pages/PublicPracticeAppointments';
import { PublicAppointmentBookingPage } from './pages/PublicAppointmentBooking';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PracticeProvider>
                <DashboardLayout />
              </PracticeProvider>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<PracticeProfilePage />} />
            <Route path="availability" element={<AppointmentSchedulePage />} />
            <Route path="appointment-types" element={<AppointmentTypesPage />} />
            <Route path="appointments" element={<AppointmentsManagementPage />} />
            <Route path="patient-app" element={<PatientAppPreviewPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/:practiceSlug/appointments" element={<PublicPracticeAppointmentsPage />} />
          <Route
            path="/:practiceSlug/appointments/:appointmentSlug"
            element={<PublicAppointmentBookingPage />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
