import React, { useState } from 'react';
import { Pencil, Plus, Trash2, Check } from 'lucide-react';
import { BookingFormField } from '../../types';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Toggle } from '../ui/Toggle';
import { Modal } from '../ui/Modal';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio Group' },
  { value: 'date', label: 'Date' },
  { value: 'yesno', label: 'Yes/No' },
];

interface FormFieldBuilderProps {
  title: string;
  subtitle: string;
  fields: BookingFormField[];
  onChange: (fields: BookingFormField[]) => void;
}

export const FormFieldBuilder: React.FC<FormFieldBuilderProps> = ({
  title,
  subtitle,
  fields,
  onChange,
}) => {
  const [editingField, setEditingField] = useState<BookingFormField | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'text' as BookingFormField['type'],
    label: '',
    required: false,
    placeholder: '',
    helpText: '',
    options: '',
  });

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  const reorder = (next: BookingFormField[]) =>
    next.map((field, index) => ({ ...field, order: index + 1 }));

  const handleOpenModal = (field?: BookingFormField) => {
    if (field) {
      setEditingField(field);
      setFormData({
        type: field.type,
        label: field.label,
        required: field.required,
        placeholder: field.placeholder,
        helpText: field.helpText,
        options: (field.options || []).join('\n'),
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

  const handleSaveField = () => {
    const options = formData.options
      ? formData.options.split('\n').map((item) => item.trim()).filter(Boolean)
      : [];

    if (editingField) {
      onChange(
        sorted.map((field) =>
          field.id === editingField.id
            ? {
                ...field,
                type: formData.type,
                label: formData.label,
                required: formData.required,
                placeholder: formData.placeholder,
                helpText: formData.helpText,
                options,
              }
            : field
        )
      );
    } else {
      const newField: BookingFormField = {
        id: `field_${Math.random().toString(36).substring(2, 10)}`,
        type: formData.type,
        label: formData.label,
        required: formData.required,
        placeholder: formData.placeholder,
        helpText: formData.helpText,
        options,
        order: sorted.length + 1,
      };
      onChange([...sorted, newField]);
    }
    handleCloseModal();
  };

  const handleDeleteField = (fieldId: string) => {
    onChange(reorder(sorted.filter((field) => field.id !== fieldId)));
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    const index = sorted.findIndex((field) => field.id === fieldId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= sorted.length) return;
    const next = [...sorted];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(reorder(next));
  };

  return (
    <Card
      title={title}
      subtitle={subtitle}
      action={
        <Button size="sm" onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Field
        </Button>
      }
    >
      <div className="space-y-3">
        {sorted.map((field, index) => (
          <div
            key={field.id}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <button
                onClick={() => moveField(field.id, -1)}
                disabled={index === 0}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <span className="block transform rotate-180">▼</span>
              </button>
              <button
                onClick={() => moveField(field.id, 1)}
                disabled={index === sorted.length - 1}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <span>▼</span>
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900">{field.label}</span>
                {field.required && (
                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 capitalize">{field.type}</p>
            </div>
            <button
              onClick={() => handleOpenModal(field)}
              className="p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-md"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteField(field.id)}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-6">No fields yet.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingField ? 'Edit Field' : 'Add Field'}
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
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
          <Input
            label="Placeholder"
            value={formData.placeholder}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
          />
          <Input
            label="Help Text"
            value={formData.helpText}
            onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
          />
          {(formData.type === 'dropdown' || formData.type === 'radio') && (
            <Textarea
              label="Options"
              placeholder="One option per line"
              value={formData.options}
              onChange={(e) => setFormData({ ...formData, options: e.target.value })}
              rows={4}
            />
          )}
          <Toggle
            label="Required"
            description="Patient must complete this field"
            checked={formData.required}
            onChange={(checked) => setFormData({ ...formData, required: checked })}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveField} className="flex-1" disabled={!formData.label.trim()}>
              <Check className="w-4 h-4 mr-2" />
              {editingField ? 'Update' : 'Add Field'}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};
