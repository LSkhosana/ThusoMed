import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  Info,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';
import { BookingForm, BookingFormField } from '../types';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'date', label: 'Date' },
  { value: 'yesno', label: 'Yes/No' },
];

const DEFAULT_FIELDS: BookingFormField[] = [
  {
    id: 'firstName',
    type: 'text',
    label: 'First Name',
    required: true,
    placeholder: 'Enter your first name',
    helpText: '',
    order: 1,
  },
  {
    id: 'lastName',
    type: 'text',
    label: 'Last Name',
    required: true,
    placeholder: 'Enter your last name',
    helpText: '',
    order: 2,
  },
  {
    id: 'email',
    type: 'text',
    label: 'Email',
    required: true,
    placeholder: 'your@email.com',
    helpText: '',
    order: 3,
  },
  {
    id: 'phone',
    type: 'text',
    label: 'Phone Number',
    required: true,
    placeholder: '+27 XX XXX XXXX',
    helpText: '',
    order: 4,
  },
  {
    id: 'reasonForVisit',
    type: 'textarea',
    label: 'Reason for Visit',
    required: true,
    placeholder: 'Briefly describe your symptoms or reason for booking',
    helpText: '',
    order: 5,
  },
  {
    id: 'hasMedicalAid',
    type: 'yesno',
    label: 'Do you have Medical Aid?',
    required: true,
    placeholder: '',
    helpText: '',
    order: 6,
  },
  {
    id: 'medicalAidScheme',
    type: 'dropdown',
    label: 'Medical Aid Scheme',
    required: false,
    placeholder: 'Select your scheme',
    helpText: '',
    options: [
      'Discovery Health',
      'Momentum Health',
      'Bonitas',
      'Medihelp',
      'Fedhealth',
      'GEMS',
      'Profmed',
      'Other',
    ],
    order: 7,
  },
  {
    id: 'memberNumber',
    type: 'text',
    label: 'Member Number',
    required: false,
    placeholder: 'Your medical aid member number',
    helpText: '',
    order: 8,
  },
  {
    id: 'currentMedications',
    type: 'textarea',
    label: 'Current Medications',
    required: false,
    placeholder: 'List any medications you are currently taking',
    helpText: '',
    order: 9,
  },
  {
    id: 'allergies',
    type: 'textarea',
    label: 'Allergies',
    required: false,
    placeholder: 'List any known allergies',
    helpText: '',
    order: 10,
  },
  {
    id: 'recentSymptoms',
    type: 'textarea',
    label: 'Recent Symptoms',
    required: false,
    placeholder: 'Describe any recent symptoms',
    helpText: '',
    order: 11,
  },
  {
    id: 'consent',
    type: 'checkbox',
    label:
      'I consent to this practice collecting my information for appointment booking and pre-consultation purposes.',
    required: true,
    placeholder: '',
    helpText: '',
    order: 12,
  },
];

export const BookingFormBuilderPage: React.FC = () => {
  const [bookingForms, setBookingForms] = useState<BookingForm[]>([]);
  const [editingField, setEditingField] = useState<BookingFormField | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  const appointmentTypes = storage.getAppointmentTypes();

  const [formData, setFormData] = useState({
    type: 'text' as BookingFormField['type'],
    label: '',
    required: false,
    placeholder: '',
    helpText: '',
    options: '',
  });

  useEffect(() => {
    const savedForms = storage.getBookingForms();
    setBookingForms(savedForms);
  }, []);

  const saveBookingForms = (forms: BookingForm[]) => {
    storage.setBookingForms(forms);
    setBookingForms(forms);
  };

  const getForm = () => {
    return bookingForms[0] || {
      id: '',
      appointmentTypeId: appointmentTypes[0]?.id || '',
      name: 'Standard Patient Registration',
      fields: DEFAULT_FIELDS,
      isActive: true,
    };
  };

  const handleAddField = () => {
    const form = getForm();
    const newField: BookingFormField = {
      id: Math.random().toString(36).substring(2, 15),
      type: formData.type,
      label: formData.label,
      required: formData.required,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
      options: formData.options
        ? formData.options.split('\n').map((s) => s.trim())
        : undefined,
      order: form.fields.length + 1,
    };

    const updatedForm: BookingForm = {
      ...form,
      id: form.id || Math.random().toString(36).substring(2, 15),
      fields: [...form.fields, newField],
    };

    saveBookingForms([updatedForm]);
    handleCloseModal();
    showToast('Field added to form!', 'success');
  };

  const handleEditField = () => {
    if (!editingField) return;

    const form = getForm();
    const updatedFields = form.fields.map((field) =>
      field.id === editingField.id
        ? {
            ...field,
            type: formData.type,
            label: formData.label,
            required: formData.required,
            placeholder: formData.placeholder,
            helpText: formData.helpText,
            options: formData.options
              ? formData.options.split('\n').map((s) => s.trim())
              : undefined,
          }
        : field
    );

    const updatedForm = { ...form, fields: updatedFields };
    saveBookingForms([updatedForm]);
    handleCloseModal();
    showToast('Field updated!', 'success');
  };

  const handleDeleteField = (fieldId: string) => {
    const form = getForm();
    const updatedFields = form.fields
      .filter((field) => field.id !== fieldId)
      .map((field, index) => ({ ...field, order: index + 1 }));

    const updatedForm = { ...form, fields: updatedFields };
    saveBookingForms([updatedForm]);
    showToast('Field removed', 'success');
  };

  const moveFieldUp = (fieldId: string) => {
    const form = getForm();
    const index = form.fields.findIndex((f) => f.id === fieldId);
    if (index <= 0) return;

    const fields = [...form.fields];
    [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
    const reorderedFields = fields.map((field, i) => ({
      ...field,
      order: i + 1,
    }));

    saveBookingForms([{ ...form, fields: reorderedFields }]);
  };

  const moveFieldDown = (fieldId: string) => {
    const form = getForm();
    const index = form.fields.findIndex((f) => f.id === fieldId);
    if (index >= form.fields.length - 1) return;

    const fields = [...form.fields];
    [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    const reorderedFields = fields.map((field, i) => ({
      ...field,
      order: i + 1,
    }));

    saveBookingForms([{ ...form, fields: reorderedFields }]);
  };

  const handleOpenModal = (field?: BookingFormField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        type: field.type,
        label: field.label,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: field.options?.join('\n') || '',
      });
    } else {
      setEditingField(null);
      setFormData({
        type: 'text',
        label: '',
        required: false,
        placeholder: '',
        helpText: '',
        options: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const toggleFormActive = () => {
    const form = getForm();
    const updatedForm = { ...form, isActive: !form.isActive };
    saveBookingForms([updatedForm]);
    showToast(
      `Form ${updatedForm.isActive ? 'activated' : 'deactivated'}!`,
      'success'
    );
  };

  const resetToDefault = () => {
    if (confirm('Reset form to default fields? This cannot be undone.')) {
      const form = getForm();
      const updatedForm = { ...form, fields: DEFAULT_FIELDS };
      saveBookingForms([updatedForm]);
      showToast('Form reset to default', 'success');
    }
  };

  const form = getForm();
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'reasonForVisit', 'consent'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Booking Form Builder
          </h1>
          <p className="text-slate-600">
            Customize your patient intake form
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={resetToDefault}>
            Reset to Default
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
      </div>

      {/* POPIA Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-sky-900">
            POPIA Compliance Reminder
          </p>
          <p className="text-xs text-sky-700 mt-1">
            In the real system, patient information must be securely stored and
            protected according to POPIA requirements.
          </p>
        </div>
      </div>

      {/* Form Status */}
      <Card title="Form Status" subtitle="Control form availability">
        <Toggle
          label="Form Active"
          description="Patient booking form is accepting submissions"
          checked={form.isActive}
          onChange={toggleFormActive}
        />
      </Card>

      {/* Form Fields */}
      <Card title="Form Fields" subtitle="Drag to reorder fields">
        <div className="space-y-3">
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field, index) => {
              const isDefaultRequired = requiredFields.includes(field.id);
              return (
                <div
                  key={field.id}
                  className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveFieldUp(field.id)}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <span className="block transform rotate-180">▼</span>
                    </button>
                    <button
                      onClick={() => moveFieldDown(field.id)}
                      disabled={index === form.fields.length - 1}
                      className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                      <span>▼</span>
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                      {isDefaultRequired && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                          Standard
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="capitalize">{field.type}</span>
                      {field.placeholder && (
                        <span className="text-slate-400">
                          Placeholder: {field.placeholder}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(field)}
                      className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!isDefaultRequired && (
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Field Preview */}
      <Card title="Form Preview" subtitle="How fields appear to patients">
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {form.fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {field.helpText && (
                  <p className="text-xs text-slate-500 mb-1">{field.helpText}</p>
                )}
                {field.type === 'text' && (
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    disabled
                  />
                )}
                {field.type === 'textarea' && (
                  <textarea
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    rows={3}
                    disabled
                  />
                )}
                {field.type === 'dropdown' && (
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    disabled
                  >
                    <option>{field.placeholder}</option>
                    {field.options?.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                )}
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300"
                      disabled
                    />
                    <span className="text-sm text-slate-700">{field.label}</span>
                  </label>
                )}
                {field.type === 'radio' && (
                  <div className="space-y-2">
                    {field.options?.map((opt) => (
                      <label key={opt} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={field.id}
                          className="border-slate-300"
                          disabled
                        />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {field.type === 'date' && (
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    disabled
                  />
                )}
                {field.type === 'yesno' && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-not-allowed">
                      <input type="radio" name={field.id} disabled />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-not-allowed">
                      <input type="radio" name={field.id} disabled />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                )}
              </div>
            ))}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingField ? 'Edit Field' : 'Add New Field'}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Field Type"
            options={FIELD_TYPES}
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as BookingFormField['type'] })
            }
          />
          <Input
            label="Label"
            placeholder="Field label shown to patients"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
          <Input
            label="Placeholder"
            placeholder="Optional placeholder text"
            value={formData.placeholder}
            onChange={(e) =>
              setFormData({ ...formData, placeholder: e.target.value })
            }
          />
          <Input
            label="Help Text"
            placeholder="Optional help text below the field"
            value={formData.helpText}
            onChange={(e) =>
              setFormData({ ...formData, helpText: e.target.value })
            }
          />

          {(formData.type === 'dropdown' || formData.type === 'radio') && (
            <Textarea
              label="Options"
              placeholder="Enter each option on a new line"
              value={formData.options}
              onChange={(e) =>
                setFormData({ ...formData, options: e.target.value })
              }
              rows={4}
              helpText="One option per line"
            />
          )}

          <Toggle
            label="Required"
            description="Patient must fill this field to submit"
            checked={formData.required}
            onChange={(checked) =>
              setFormData({ ...formData, required: checked })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={editingField ? handleEditField : handleAddField}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {editingField ? 'Update' : 'Add Field'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
