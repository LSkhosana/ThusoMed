import React, { useMemo } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Calendar,
  CreditCard,
  ChevronRight,
  Smartphone,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { storage } from '../utils/storage';

export const PatientAppPreviewPage: React.FC = () => {
  const profile = storage.getProfile();
  const appointmentTypes = storage.getAppointmentTypes().filter((t) => t.isActive);
  const scheduleSettings = storage.getScheduleSettings();

  const operatingHours = useMemo(() => {
    if (!profile?.operatingHours) return [];
    const hours = [];
    if (profile.operatingHours.weekdays) {
      hours.push({
        label: 'Monday - Friday',
        time: `${profile.operatingHours.weekdays.start} - ${profile.operatingHours.weekdays.end}`,
      });
    }
    if (profile.operatingHours.saturday?.enabled) {
      hours.push({
        label: 'Saturday',
        time: `${profile.operatingHours.saturday.start} - ${profile.operatingHours.saturday.end}`,
      });
    }
    if (profile.operatingHours.sunday?.enabled) {
      hours.push({
        label: 'Sunday',
        time: `${profile.operatingHours.sunday.start} - ${profile.operatingHours.sunday.end}`,
      });
    }
    return hours;
  }, [profile]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Patient App Preview
          </h1>
          <p className="text-slate-600">
            How your practice appears in the ThusoMed patient app
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-full">
          <Smartphone className="w-4 h-4 text-sky-600" />
          <span className="text-xs font-medium text-sky-700">
            Mobile Preview
          </span>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> This preview shows how the same practice data
          can later power the ThusoMed patient-facing app. All information is
          pulled from your practice profile.
        </p>
      </div>

      {/* Mobile Phone Frame */}
      <div className="max-w-sm mx-auto">
        <div className="bg-slate-900 rounded-[40px] p-3 shadow-2xl">
          <div className="bg-white rounded-[32px] overflow-hidden">
            {/* Phone Header */}
            <div className="bg-sky-600 px-5 py-4 text-white">
              <p className="text-xs text-sky-200">ThusoMed</p>
              <p className="text-lg font-bold">Find a Doctor</p>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
              {/* Doctor Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Profile Header */}
                <div className="bg-gradient-to-br from-sky-50 to-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-slate-900">
                        {profile?.practitionerName || 'Doctor Name'}
                      </h2>
                      <p className="text-sm text-sky-600 font-medium">
                        {profile?.specialty || 'Specialty'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          HPCSA: {profile?.hpcsaNumber || 'MP0000000'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practice Info */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-slate-900">
                    {profile?.practiceName || 'Practice Name'}
                  </h3>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {profile?.address || 'Address'}, {profile?.city || 'City'},{' '}
                      {profile?.province || 'Province'}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{profile?.phone || 'Phone Number'}</span>
                  </div>

                  {/* Medical Aids */}
                  {profile?.medicalAids && profile.medicalAids.length > 0 && (
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-800">
                          Medical Aids Accepted
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {profile.medicalAids.slice(0, 4).map((aid, index) => (
                          <span
                            key={index}
                            className="text-xs bg-white text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
                          >
                            {aid}
                          </span>
                        ))}
                        {profile.medicalAids.length > 4 && (
                          <span className="text-xs text-emerald-600">
                            +{profile.medicalAids.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operating Hours */}
                  {operatingHours.length > 0 && (
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">
                          Operating Hours
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600">
                        {operatingHours.map((hour) => (
                          <div key={hour.label} className="flex justify-between">
                            <span>{hour.label}</span>
                            <span className="font-medium">{hour.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {profile?.services && profile.services.length > 0 && (
                    <div className="border-t border-slate-100 pt-3 mt-3">
                      <p className="text-xs font-medium text-slate-700 mb-2">
                        Services
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {profile.services.slice(0, 6).map((service, index) => (
                          <span
                            key={index}
                            className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {profile.services.length > 6 && (
                          <span className="text-xs text-slate-500">
                            +{profile.services.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Types */}
              {appointmentTypes.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">
                      Available Appointments
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {appointmentTypes.map((type) => (
                      <div
                        key={type.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {type.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {type.durationMinutes} min
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sky-600">
                            R{type.price.toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Book Button */}
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>

              {/* Emergency Notice */}
              {profile?.emergencyDisclaimer && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-800">
                      {profile.emergencyDisclaimer}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-slate-200 px-6 py-3">
              <div className="flex justify-around">
                <button className="flex flex-col items-center text-sky-600">
                  <User className="w-5 h-5" />
                  <span className="text-xs mt-1">Doctors</span>
                </button>
                <button className="flex flex-col items-center text-slate-400">
                  <Calendar className="w-5 h-5" />
                  <span className="text-xs mt-1">Appointments</span>
                </button>
                <button className="flex flex-col items-center text-slate-400">
                  <MapPin className="w-5 h-5" />
                  <span className="text-xs mt-1">Nearby</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features List */}
      <Card title="Patient App Features" subtitle="What patients will see">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Doctor Profiles</p>
              <p className="text-sm text-slate-500">
                Search and view detailed practitioner information
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Online Booking</p>
              <p className="text-sm text-slate-500">
                Book appointments with real-time availability
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Medical Aids</p>
              <p className="text-sm text-slate-500">
                See which medical aids are accepted
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="font-medium text-slate-900">Location Search</p>
              <p className="text-sm text-slate-500">
                Find doctors near your location
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
