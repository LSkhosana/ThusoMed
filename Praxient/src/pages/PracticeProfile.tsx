import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Globe,
  MapPin,
  Shield,
  AlertTriangle,
  Upload,
  Check,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { usePractice } from '../context/PracticeContext';
import { updatePractice } from '../lib/api';
import { isUrlSafeSlug, slugify } from '../lib/booking';
import { PracticeProfile } from '../types';

const PROVINCES = [
  { value: '', label: 'Select Province' },
  { value: 'Eastern Cape', label: 'Eastern Cape' },
  { value: 'Free State', label: 'Free State' },
  { value: 'Gauteng', label: 'Gauteng' },
  { value: 'KwaZulu-Natal', label: 'KwaZulu-Natal' },
  { value: 'Limpopo', label: 'Limpopo' },
  { value: 'Mpumalanga', label: 'Mpumalanga' },
  { value: 'Northern Cape', label: 'Northern Cape' },
  { value: 'North West', label: 'North West' },
  { value: 'Western Cape', label: 'Western Cape' },
];

const FORBIDDEN_TERMS = [
  'best doctor',
  'best practice',
  'cheapest',
  'number one',
  'guaranteed cure',
  'cure guaranteed',
  '100% cure',
  'miracle cure',
  'guaranteed results',
];

export const PracticeProfilePage: React.FC = () => {
  const { practice, setPractice } = usePractice();
  const [profile, setProfile] = useState<PracticeProfile | null>(null);
  const [servicesInput, setServicesInput] = useState('');
  const [medicalAidsInput, setMedicalAidsInput] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!practice) return;
    setProfile(practice);
    setServicesInput(practice.services.join('\n'));
    setMedicalAidsInput(practice.medicalAids.join('\n'));
  }, [practice]);

  const checkDescription = (text: string) => {
    const lowerText = text.toLowerCase();
    const hasForbiddenTerm = FORBIDDEN_TERMS.some((term) =>
      lowerText.includes(term)
    );
    setShowWarning(hasForbiddenTerm);
  };

  const handleChange = (
    field: keyof PracticeProfile,
    value: string | boolean
  ) => {
    if (!profile) return;

    if (field === 'description') {
      checkDescription(value as string);
    }

    setProfile({ ...profile, [field]: value });
  };

  const handleOperatingHours = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    if (!profile) return;

    setProfile({
      ...profile,
      operatingHours: {
        ...profile.operatingHours,
        [day]: {
          ...profile.operatingHours[day as keyof typeof profile.operatingHours],
          [field]: value,
        },
      },
    });
  };

  const parseList = (input: string): string[] => {
    return input
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSave = async () => {
    if (!profile) return;

    const nextSlug = slugify(profile.slug || profile.practiceName);
    if (!isUrlSafeSlug(nextSlug)) {
      showToast('Slug must be URL-safe, for example dr-mokoena', 'error');
      return;
    }

    setIsSaving(true);
    const updatedProfile = {
      ...profile,
      slug: nextSlug,
      services: parseList(servicesInput),
      medicalAids: parseList(medicalAidsInput),
    };

    try {
      const saved = await updatePractice(profile.id, updatedProfile);
      setProfile(saved);
      setPractice(saved);
      showToast('Practice profile saved successfully!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
            Practice Profile
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your practice information and public profile
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving}>
          <Check className="w-4 h-4 mr-2" />
          Save Profile
        </Button>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Please avoid superlative or misleading medical advertising claims.
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Terms like "best doctor", "guaranteed cure", or similar claims
              should be avoided per medical advertising guidelines.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-6">
          <Card title="Basic Information">
            <div className="space-y-4">
              <Input
                label="Practice Name"
                placeholder="e.g., Thuso Family Medical Practice"
                value={profile.practiceName}
                onChange={(e) => handleChange('practiceName', e.target.value)}
                required
              />
              <Input
                label="Public slug"
                placeholder="e.g., dr-mokoena"
                value={profile.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                required
                helpText="Used in the public booking URL. Letters, numbers, and hyphens only. Changing this breaks links you have already shared."
              />
              <Input
                label="Practitioner Name"
                placeholder="e.g., Dr. Naledi Mokoena"
                value={profile.practitionerName}
                onChange={(e) => handleChange('practitionerName', e.target.value)}
                required
              />
              <Input
                label="Specialty"
                placeholder="e.g., General Practitioner"
                value={profile.specialty}
                onChange={(e) => handleChange('specialty', e.target.value)}
                required
              />
              <Input
                label="HPCSA Registration Number"
                placeholder="e.g., MP0123456"
                value={profile.hpcsaNumber}
                onChange={(e) => handleChange('hpcsaNumber', e.target.value)}
                required
                helpText="Required for medical practitioners in South Africa"
              />
            </div>
          </Card>

          <Card title="About Your Practice">
            <div className="space-y-4">
              <Textarea
                label="Practice Description"
                placeholder="Describe your practice, approach to patient care, and what patients can expect..."
                value={profile.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                helpText="Avoid superlatives like 'best', 'cheapest', or medical claims"
              />
              <Textarea
                label="Services Offered"
                placeholder="Enter each service on a new line"
                value={servicesInput}
                onChange={(e) => setServicesInput(e.target.value)}
                rows={5}
                helpText="List the medical services your practice provides"
              />
              <Textarea
                label="Medical Aids Accepted"
                placeholder="Enter each medical aid on a new line"
                value={medicalAidsInput}
                onChange={(e) => setMedicalAidsInput(e.target.value)}
                rows={4}
              />
            </div>
          </Card>

          <Card title="Contact Details">
            <div className="space-y-4">
              <Input
                label="Address"
                placeholder="Street address"
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="e.g., Johannesburg"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                />
                <Select
                  label="Province"
                  options={PROVINCES}
                  value={profile.province}
                  onChange={(e) => handleChange('province', e.target.value)}
                />
              </div>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+27 XX XXX XXXX"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <Input
                label="Email"
                type="email"
                placeholder="practice@email.com"
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
              <Input
                label="Website"
                type="url"
                placeholder="www.example.co.za"
                value={profile.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
          </Card>

          <Card title="Operating Hours">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Weekdays Start"
                  type="time"
                  value={profile.operatingHours.weekdays.start}
                  onChange={(e) =>
                    handleOperatingHours('weekdays', 'start', e.target.value)
                  }
                />
                <Input
                  label="Weekdays End"
                  type="time"
                  value={profile.operatingHours.weekdays.end}
                  onChange={(e) =>
                    handleOperatingHours('weekdays', 'end', e.target.value)
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.operatingHours.saturday.enabled}
                      onChange={(e) =>
                        handleOperatingHours('saturday', 'enabled', e.target.checked)
                      }
                      className="rounded border-slate-300 text-navy-800 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Saturday
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={profile.operatingHours.saturday.start}
                      onChange={(e) =>
                        handleOperatingHours('saturday', 'start', e.target.value)
                      }
                      disabled={!profile.operatingHours.saturday.enabled}
                    />
                    <Input
                      type="time"
                      value={profile.operatingHours.saturday.end}
                      onChange={(e) =>
                        handleOperatingHours('saturday', 'end', e.target.value)
                      }
                      disabled={!profile.operatingHours.saturday.enabled}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={profile.operatingHours.sunday.enabled}
                      onChange={(e) =>
                        handleOperatingHours('sunday', 'enabled', e.target.checked)
                      }
                      className="rounded border-slate-300 text-navy-800 focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Sunday
                    </span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={profile.operatingHours.sunday.start}
                      onChange={(e) =>
                        handleOperatingHours('sunday', 'start', e.target.value)
                      }
                      disabled={!profile.operatingHours.sunday.enabled}
                    />
                    <Input
                      type="time"
                      value={profile.operatingHours.sunday.end}
                      onChange={(e) =>
                        handleOperatingHours('sunday', 'end', e.target.value)
                      }
                      disabled={!profile.operatingHours.sunday.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Emergency Disclaimer">
            <Textarea
              value={profile.emergencyDisclaimer}
              onChange={(e) =>
                handleChange('emergencyDisclaimer', e.target.value)
              }
              rows={3}
              helpText="This text will be shown to patients when booking"
            />
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-[72px] h-fit">
          <Card
            title="Profile Preview"
            subtitle="How your profile appears to patients"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {profile.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {profile.practiceName || 'Practice Name'}
                  </h3>
                  <p className="text-teal-700 font-medium">
                    {profile.practitionerName || 'Doctor Name'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {profile.specialty || 'Specialty'}
                  </p>
                </div>
              </div>

              {/* HPCSA Number */}
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4" />
                <span>
                  HPCSA: {profile.hpcsaNumber || 'Registration Number'}
                </span>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  About
                </h4>
                <p className="text-sm text-slate-600">
                  {profile.description || 'Practice description will appear here'}
                </p>
              </div>

              {/* Services */}
              {profile.services.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parseList(servicesInput).map((service, index) => (
                      <span
                        key={index}
                        className="text-xs bg-teal-50 text-teal-800 px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Aids */}
              {profile.medicalAids.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">
                    Medical Aids Accepted
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {parseList(medicalAidsInput).map((aid, index) => (
                      <span
                        key={index}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full"
                      >
                        {aid}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {[profile.address, profile.city, profile.province]
                      .filter(Boolean)
                      .join(', ') || 'Address'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{profile.phone || 'Phone Number'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{profile.email || 'Email'}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>{profile.website}</span>
                  </div>
                )}
              </div>

              {/* Operating Hours */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">
                  Operating Hours
                </h4>
                <p className="text-sm text-slate-600">
                  Mon-Fri: {profile.operatingHours.weekdays.start} -{' '}
                  {profile.operatingHours.weekdays.end}
                </p>
                {profile.operatingHours.saturday.enabled && (
                  <p className="text-sm text-slate-600">
                    Sat: {profile.operatingHours.saturday.start} -{' '}
                    {profile.operatingHours.saturday.end}
                  </p>
                )}
                {profile.operatingHours.sunday.enabled && (
                  <p className="text-sm text-slate-600">
                    Sun: {profile.operatingHours.sunday.start} -{' '}
                    {profile.operatingHours.sunday.end}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
