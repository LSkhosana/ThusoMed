import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Check,
  X,
  AlertTriangle,
  Filter,
  Search,
  Eye,
  FileText,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';
import { Appointment, AppointmentType } from '../types';

export const AppointmentsManagementPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const { showToast } = useToast();

  const appointmentTypes = storage.getAppointmentTypes();

  useMemo(() => {
    setAppointments(storage.getAppointments());
  }, []);

  const refreshAppointments = () => {
    setAppointments(storage.getAppointments());
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch =
        apt.patientFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesPayment =
        paymentFilter === 'all' || apt.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [appointments, searchTerm, statusFilter, paymentFilter]);

  const getAppointmentType = (id: string): AppointmentType | undefined => {
    return appointmentTypes.find((type) => type.id === id);
  };

  const updateAppointmentStatus = (
    aptId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => {
    const updatedAppointments = appointments.map((apt) =>
      apt.id === aptId ? { ...apt, status } : apt
    );
    storage.setAppointments(updatedAppointments);
    setAppointments(updatedAppointments);
    closeModal();
    showToast(
      `Appointment ${status}. In the live system, SMS and email notifications would be sent.`,
      'success'
    );
  };

  const viewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      confirmed: 'bg-emerald-100 text-emerald-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-slate-100 text-slate-700',
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: Appointment['paymentStatus']) => {
    const styles = {
      not_required: 'bg-slate-100 text-slate-600',
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-emerald-100 text-emerald-700',
      failed: 'bg-red-100 text-red-700',
    };
    const labels = {
      not_required: 'Not Required',
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
    };
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-600">Manage patient appointments and booking requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-700">Pending</p>
          <p className="text-2xl font-bold text-amber-900">
            {appointments.filter((a) => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-sm text-emerald-700">Confirmed</p>
          <p className="text-2xl font-bold text-emerald-900">
            {appointments.filter((a) => a.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-600">Completed</p>
          <p className="text-2xl font-bold text-slate-900">
            {appointments.filter((a) => a.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by patient name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="md:w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'All Payments' },
              { value: 'not_required', label: 'Not Required' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'failed', label: 'Failed' },
            ]}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="md:w-48"
          />
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Date & Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Patient
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Appointment Type
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Payment
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Priority
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((apt) => {
                  const aptType = getAppointmentType(apt.appointmentTypeId);
                  return (
                    <tr
                      key={apt.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {new Date(apt.date).toLocaleDateString('en-ZA')}
                            </p>
                            <p className="text-xs text-slate-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {apt.time}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {apt.patientFirstName} {apt.patientLastName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {apt.patientEmail}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-900">
                          {aptType?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {aptType?.durationMinutes} min
                        </p>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(apt.status)}</td>
                      <td className="py-3 px-4">
                        {getPaymentBadge(apt.paymentStatus)}
                      </td>
                      <td className="py-3 px-4">
                        {apt.isPriority && (
                          <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Priority review
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewAppointment(apt)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedAppointment.status)}
                {getPaymentBadge(selectedAppointment.paymentStatus)}
                {selectedAppointment.isPriority && (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Priority
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          'confirmed'
                        )
                      }
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        updateAppointmentStatus(
                          selectedAppointment.id,
                          'cancelled'
                        )
                      }
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateAppointmentStatus(selectedAppointment.id, 'completed')
                    }
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>

            {/* Appointment Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">
                Appointment
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Confirmation #:</span>
                  <p className="font-mono font-bold text-sky-600">
                    {selectedAppointment.confirmationNumber}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Type:</span>
                  <p className="font-medium text-slate-900">
                    {getAppointmentType(selectedAppointment.appointmentTypeId)?.name}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedAppointment.date).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Time:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Patient Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientFirstName}{' '}
                    {selectedAppointment.patientLastName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientPhone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientEmail}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Medical Aid:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.hasMedicalAid
                      ? selectedAppointment.medicalAidScheme
                      : 'None'}
                  </p>
                </div>
                {selectedAppointment.memberNumber && (
                  <div>
                    <span className="text-slate-500">Member #:</span>
                    <p className="font-medium text-slate-900">
                      {selectedAppointment.memberNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Medical Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">
                Medical Information
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-500">Reason for Visit:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.reasonForVisit}
                  </p>
                </div>
                {selectedAppointment.currentMedications && (
                  <div>
                    <span className="text-slate-500">Current Medications:</span>
                    <p className="text-slate-900">
                      {selectedAppointment.currentMedications}
                    </p>
                  </div>
                )}
                {selectedAppointment.allergies && (
                  <div>
                    <span className="text-slate-500">Allergies:</span>
                    <p className="text-slate-900">
                      {selectedAppointment.allergies}
                    </p>
                  </div>
                )}
                {selectedAppointment.recentSymptoms && (
                  <div>
                    <span className="text-slate-500">Recent Symptoms:</span>
                    <p className="text-slate-900">
                      {selectedAppointment.recentSymptoms}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Input
                label="Internal Notes"
                placeholder="Add notes about this appointment..."
                value={selectedAppointment.notes}
                onChange={(e) => {
                  const updated = appointments.map((apt) =>
                    apt.id === selectedAppointment.id
                      ? { ...apt, notes: e.target.value }
                      : apt
                  );
                  storage.setAppointments(updated);
                  setAppointments(updated);
                  setSelectedAppointment({
                    ...selectedAppointment,
                    notes: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
