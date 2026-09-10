import React, { useEffect, useState } from 'react';
import { Check, Copy, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { usePractice } from '../context/PracticeContext';
import { FormFieldBuilder } from '../components/booking/FormFieldBuilder';
import { BookingFlow } from '../components/booking/BookingFlow';
import {
  createAppointmentType,
  deleteAppointmentType,
  listAppointmentTypes,
  updateAppointmentType,
} from '../lib/api';
import {
  DEFAULT_BOOKING_FORM_FIELDS,
  DEFAULT_PRE_CONSULTATION_FORM_FIELDS,
  isUrlSafeSlug,
  publicBookingPath,
  publicUrl,
  slugify,
} from '../lib/booking';
import { AppointmentType, BookingFormField } from '../types';

const TABS = ['Details', 'Booking Form', 'Pre-Consultation Form', 'Preview', 'Publish'] as const;
type Tab = (typeof TABS)[number];

export const AppointmentTypesPage: React.FC = () => {
  const { practice, availability } = usePractice();
  const [types, setTypes] = useState<AppointmentType[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('Details');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    durationMinutes: 30,
    price: 0,
    requiresDeposit: false,
    depositAmount: 0,
    depositType: 'fixed' as 'percentage' | 'fixed',
    maxBookingsPerDay: 10,
    isActive: true,
  });

  const selected = types.find((type) => type.id === selectedId) || null;

  const loadTypes = async (keepSelectedId?: string | null) => {
    if (!practice) return;
    const loaded = await listAppointmentTypes(practice.id);
    setTypes(loaded);
    const nextId = keepSelectedId && loaded.some((type) => type.id === keepSelectedId)
      ? keepSelectedId
      : loaded[0]?.id || null;
    setSelectedId(nextId);
  };

  useEffect(() => {
    if (!practice) return;
    void loadTypes().catch((err) => {
      showToast(err instanceof Error ? err.message : 'Unable to load appointment types', 'error');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practice?.id]);

  useEffect(() => {
    if (!selected) return;
    setFormData({
      name: selected.name,
      slug: selected.slug,
      description: selected.description,
      durationMinutes: selected.durationMinutes,
      price: selected.price,
      requiresDeposit: selected.requiresDeposit,
      depositAmount: selected.depositAmount,
      depositType: selected.depositType,
      maxBookingsPerDay: selected.maxBookingsPerDay,
      isActive: selected.isActive,
    });
  }, [selected]);

  const handleCreate = async () => {
    if (!practice) return;
    if (!formData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    const slug = slugify(formData.slug || formData.name);
    if (!isUrlSafeSlug(slug)) {
      showToast('Slug must be URL-safe', 'error');
      return;
    }
    try {
      const created = await createAppointmentType(practice.id, {
        name: formData.name,
        slug,
        description: formData.description,
        durationMinutes: formData.durationMinutes,
        price: formData.price,
        requiresDeposit: formData.requiresDeposit,
        depositAmount: formData.depositAmount,
        depositType: formData.depositType,
        maxBookingsPerDay: formData.maxBookingsPerDay,
        isActive: formData.isActive,
        isPublished: false,
        bookingFormFields: DEFAULT_BOOKING_FORM_FIELDS,
        preConsultationFormFields: DEFAULT_PRE_CONSULTATION_FORM_FIELDS,
      });
      setIsModalOpen(false);
      await loadTypes(created.id);
      setActiveTab('Details');
      showToast('Appointment type created', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to create appointment type', 'error');
    }
  };

  const handleSaveDetails = async () => {
    if (!selected) return;
    if (formData.durationMinutes < 10) {
      showToast('Duration must be at least 10 minutes', 'error');
      return;
    }
    const slug = slugify(formData.slug || formData.name);
    if (!isUrlSafeSlug(slug)) {
      showToast('Slug must be URL-safe', 'error');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateAppointmentType(selected.id, { ...formData, slug });
      setTypes((prev) => prev.map((type) => (type.id === updated.id ? updated : type)));
      showToast('Details saved', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save details', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const saveFields = async (
    patch: { bookingFormFields?: BookingFormField[]; preConsultationFormFields?: BookingFormField[] }
  ) => {
    if (!selected) return;
    try {
      const updated = await updateAppointmentType(selected.id, patch);
      setTypes((prev) => prev.map((type) => (type.id === updated.id ? updated : type)));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save form fields', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this appointment type?')) return;
    try {
      await deleteAppointmentType(id);
      await loadTypes(null);
      showToast('Appointment type deleted', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to delete appointment type', 'error');
    }
  };

  const handlePublish = async (publish: boolean) => {
    if (!selected) return;
    try {
      const updated = await updateAppointmentType(selected.id, {
        isPublished: publish,
        publishedAt: publish ? new Date().toISOString() : selected.publishedAt,
      });
      setTypes((prev) => prev.map((type) => (type.id === updated.id ? updated : type)));
      showToast(publish ? 'Appointment type published' : 'Appointment type unpublished', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to update publish state', 'error');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (selected) {
      setFormData({
        name: selected.name,
        slug: selected.slug,
        description: selected.description,
        durationMinutes: selected.durationMinutes,
        price: selected.price,
        requiresDeposit: selected.requiresDeposit,
        depositAmount: selected.depositAmount,
        depositType: selected.depositType,
        maxBookingsPerDay: selected.maxBookingsPerDay,
        isActive: selected.isActive,
      });
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      durationMinutes: 30,
      price: 0,
      requiresDeposit: false,
      depositAmount: 0,
      depositType: 'fixed',
      maxBookingsPerDay: 10,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const publicLink =
    practice && selected
      ? publicUrl(publicBookingPath(practice.slug, selected.slug))
      : '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Types</h1>
          <p className="text-slate-600">
            Details, forms, preview, and publish live on each appointment type.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Create Appointment Type
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Types" subtitle="Select a type to configure">
          <div className="space-y-3">
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedId(type.id);
                  setActiveTab('Details');
                }}
                className={`w-full text-left p-3 rounded-lg border ${
                  selectedId === type.id
                    ? 'border-sky-600 bg-sky-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{type.name}</p>
                    <p className="text-xs text-slate-500">
                      {type.durationMinutes} min · R{type.price.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      type.isPublished
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {type.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </button>
            ))}
            {types.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">No appointment types yet.</p>
            )}
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <Card>
              <p className="text-sm text-slate-500 text-center py-8">
                Create or select an appointment type to continue.
              </p>
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      activeTab === tab
                        ? 'bg-sky-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === 'Details' && (
                <Card title="Details" subtitle={selected.name}>
                  <div className="space-y-4">
                    <Input
                      label="Name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: slugify(e.target.value),
                        })
                      }
                      required
                    />
                    <Input
                      label="Slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      helpText="Used in the public booking URL"
                      required
                    />
                    <Textarea
                      label="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Duration (minutes)"
                        type="number"
                        value={formData.durationMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            durationMinutes: parseInt(e.target.value, 10) || 0,
                          })
                        }
                      />
                      <Input
                        label="Price (ZAR)"
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Toggle
                      label="Require Deposit"
                      checked={formData.requiresDeposit}
                      onChange={(checked) =>
                        setFormData({ ...formData, requiresDeposit: checked })
                      }
                    />
                    {formData.requiresDeposit && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Deposit Amount"
                          type="number"
                          value={formData.depositAmount}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              depositAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                        <Select
                          label="Deposit Type"
                          options={[
                            { value: 'fixed', label: 'Fixed Amount' },
                            { value: 'percentage', label: 'Percentage' },
                          ]}
                          value={formData.depositType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              depositType: e.target.value as 'percentage' | 'fixed',
                            })
                          }
                        />
                      </div>
                    )}
                    <Input
                      label="Max Bookings Per Day"
                      type="number"
                      value={formData.maxBookingsPerDay}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxBookingsPerDay: parseInt(e.target.value, 10) || 1,
                        })
                      }
                    />
                    <Toggle
                      label="Active"
                      description="Inactive types cannot be published for new bookings"
                      checked={formData.isActive}
                      onChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <div className="flex gap-3">
                      <Button onClick={() => void handleSaveDetails()} isLoading={isSaving}>
                        <Check className="w-4 h-4 mr-2" />
                        Save Details
                      </Button>
                      <Button variant="danger" onClick={() => void handleDelete(selected.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {activeTab === 'Booking Form' && (
                <FormFieldBuilder
                  title="Booking Form"
                  subtitle="Fields collected before the appointment is submitted"
                  fields={selected.bookingFormFields}
                  onChange={(fields) => void saveFields({ bookingFormFields: fields })}
                />
              )}

              {activeTab === 'Pre-Consultation Form' && (
                <FormFieldBuilder
                  title="Pre-Consultation Form"
                  subtitle="Clinical and consent questions for this appointment type"
                  fields={selected.preConsultationFormFields}
                  onChange={(fields) => void saveFields({ preConsultationFormFields: fields })}
                />
              )}

              {activeTab === 'Preview' && availability && practice && (
                <BookingFlow
                  practice={practice}
                  availability={availability}
                  appointmentType={selected}
                />
              )}

              {activeTab === 'Publish' && (
                <Card title="Publish" subtitle="Share a public Praxient booking page">
                  <div className="space-y-4">
                    <Toggle
                      label="Published"
                      description="Only active published types appear on the public booking pages"
                      checked={selected.isPublished}
                      onChange={(checked) => void handlePublish(checked)}
                    />
                    {selected.isPublished && (
                      <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                        <p className="text-sm text-slate-600">Public booking link</p>
                        <p className="text-sm font-mono break-all text-slate-900">{publicLink}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void navigator.clipboard.writeText(publicLink);
                            showToast('Link copied', 'success');
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </Button>
                      </div>
                    )}
                    {!selected.isActive && (
                      <p className="text-sm text-amber-700">
                        This type is inactive, so it will not appear on the public list even if published.
                      </p>
                    )}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Appointment Type"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
                slug: slugify(e.target.value),
              })
            }
            required
          />
          <Input
            label="Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  durationMinutes: parseInt(e.target.value, 10) || 0,
                })
              }
            />
            <Input
              label="Price (ZAR)"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => void handleCreate()}>
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
