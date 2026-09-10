import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, User, Check, X, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { useToast } from '../components/ui/Toast';
import { usePractice } from '../context/PracticeContext';
import { listAppointmentTypes, listAppointments, updateAppointment } from '../lib/api';
import { answerToString, formatRand } from '../lib/booking';
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  FormAnswers,
  PaymentStatus,
} from '../types';

export const AppointmentsManagementPage: React.FC = () => {
  const { practice } = usePractice();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const loadData = async () => {
    if (!practice) return;
    const [loadedAppointments, loadedTypes] = await Promise.all([
      listAppointments(practice.id),
      listAppointmentTypes(practice.id),
    ]);
    setAppointments(loadedAppointments);
    setAppointmentTypes(loadedTypes);
  };

  useEffect(() => {
    if (!practice) return;
    void loadData()
      .catch((err) => {
        showToast(err instanceof Error ? err.message : 'Unable to load appointments', 'error');
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice?.id]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const haystack = `${apt.patientDisplayName} ${apt.patientEmail} ${apt.patientPhone}`.toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || apt.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [appointments, searchTerm, statusFilter, paymentFilter]);

  const getAppointmentType = (id: string): AppointmentType | undefined =>
    appointmentTypes.find((type) => type.id === id);

  const persistAppointment = async (
    aptId: string,
    patch: Partial<Pick<Appointment, 'status' | 'notes' | 'paymentStatus'>>
  ) => {
    try {
      const updated = await updateAppointment(aptId, patch);
      setAppointments((prev) => prev.map((apt) => (apt.id === updated.id ? updated : apt)));
      setSelectedAppointment((current) => (current?.id === updated.id ? updated : current));
      return updated;
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to update appointment', 'error');
      return null;
    }
  };

  const updateAppointmentStatus = async (aptId: string, status: AppointmentStatus) => {
    const updated = await persistAppointment(aptId, { status });
    if (updated) {
      closeModal();
      showToast(
        `Appointment ${status}. In the live system, SMS and email notifications would be sent.`,
        'success'
      );
    }
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
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border border-red-200',
      completed: 'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (status: Appointment['paymentStatus']) => {
    const styles = {
      not_required: 'bg-slate-100 text-slate-600 border border-slate-200',
      pending: 'bg-amber-50 text-amber-700 border border-amber-200',
      paid: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      failed: 'bg-red-50 text-red-700 border border-red-200',
    };
    const labels = {
      not_required: 'Not Required',
      pending: 'Pending',
      paid: 'Paid',
      failed: 'Failed',
    };
    return (
      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const renderAnswers = (title: string, answers: FormAnswers) => {
    const entries = Object.entries(answers);
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No answers submitted.</p>
        ) : (
          <div className="space-y-3 text-sm">
            {entries.map(([key, value]) => (
              <div key={key}>
                <span className="text-slate-500">{key}</span>
                <p className="font-medium text-slate-900">{answerToString(value) || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Appointments</h1>
        <p className="text-slate-500 mt-1">Manage patient appointments and booking requests</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[74px] bg-white rounded-lg border border-slate-200 animate-pulse"
            />
          ))
        ) : (
          <>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-[13px] text-slate-500">Total</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">
                {appointments.length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-[13px] text-amber-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">
                {appointments.filter((item) => item.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-[13px] text-emerald-600 font-medium">Confirmed</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">
                {appointments.filter((item) => item.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-[13px] text-slate-500 font-medium">Completed</p>
              <p className="text-2xl font-bold text-navy-900 tabular-nums">
                {appointments.filter((item) => item.status === 'completed').length}
              </p>
            </div>
          </>
        )}
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by patient name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
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
                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => {
                const aptType = getAppointmentType(apt.appointmentTypeId);
                return (
                  <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(apt.appointmentDate).toLocaleDateString('en-ZA')}
                          </p>
                          <p className="text-xs text-slate-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {apt.appointmentTime}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-slate-900">{apt.patientDisplayName}</p>
                      <p className="text-xs text-slate-500">{apt.patientEmail || 'No email'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-slate-900">{aptType?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{aptType?.durationMinutes} min</p>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(apt.status)}</td>
                    <td className="py-3 px-4">{getPaymentBadge(apt.paymentStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => viewAppointment(apt)}>
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isLoading && (
            <div className="space-y-2 py-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-12 bg-slate-50 rounded-md animate-pulse" />
              ))}
            </div>
          )}
          {!isLoading && filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No appointments found</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Appointment Details" size="lg">
        {selectedAppointment && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusBadge(selectedAppointment.status)}
                {getPaymentBadge(selectedAppointment.paymentStatus)}
              </div>
              <div className="flex gap-2">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => void updateAppointmentStatus(selectedAppointment.id, 'confirmed')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => void updateAppointmentStatus(selectedAppointment.id, 'cancelled')}
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
                    onClick={() => void updateAppointmentStatus(selectedAppointment.id, 'completed')}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Mark Completed
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Appointment</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Confirmation #:</span>
                  <p className="font-mono font-bold text-teal-700">
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
                    {new Date(selectedAppointment.appointmentDate).toLocaleDateString('en-ZA', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Time:</span>
                  <p className="font-medium text-slate-900">{selectedAppointment.appointmentTime}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-slate-900">Patient Details</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Name:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientDisplayName}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientPhone || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <p className="font-medium text-slate-900">
                    {selectedAppointment.patientEmail || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Payment amount:</span>
                  <p className="font-medium text-slate-900">
                    {formatRand(selectedAppointment.paymentAmount)}
                  </p>
                </div>
              </div>
            </div>

            {selectedAppointment.paymentStatus !== 'not_required' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-800 mb-3">Mock payment</p>
                <Select
                  label="Payment status"
                  value={selectedAppointment.paymentStatus}
                  onChange={(e) =>
                    void persistAppointment(selectedAppointment.id, {
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                />
              </div>
            )}

            {renderAnswers('Booking answers', selectedAppointment.bookingAnswers)}
            {renderAnswers('Pre-consultation answers', selectedAppointment.preConsultationAnswers)}

            <Textarea
              label="Internal Notes"
              placeholder="Add notes about this appointment..."
              value={selectedAppointment.notes}
              onChange={(e) =>
                setSelectedAppointment({
                  ...selectedAppointment,
                  notes: e.target.value,
                })
              }
              onBlur={(e) =>
                void persistAppointment(selectedAppointment.id, {
                  notes: e.target.value,
                }).then((updated) => {
                  if (updated) showToast('Notes saved', 'success');
                })
              }
              rows={3}
              helpText="Notes save automatically when you click away"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
