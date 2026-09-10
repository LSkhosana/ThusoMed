import React from 'react';
import { BookingFormField, FormAnswers } from '../../types';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';

interface DynamicFormFieldsProps {
  fields: BookingFormField[];
  answers: FormAnswers;
  onChange: (fieldId: string, value: string | boolean) => void;
  disabled?: boolean;
}

export const DynamicFormFields: React.FC<DynamicFormFieldsProps> = ({
  fields,
  answers,
  onChange,
  disabled = false,
}) => {
  const sorted = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sorted.map((field) => {
        const value = answers[field.id];

        if (field.type === 'checkbox') {
          return (
            <label key={field.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={value === true}
                disabled={disabled}
                onChange={(e) => onChange(field.id, e.target.checked)}
                className="rounded border-slate-300 mt-1"
              />
              <span className="text-sm text-slate-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
          );
        }

        if (field.type === 'yesno') {
          return (
            <div key={field.id}>
              <p className="block text-sm font-medium text-slate-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <div className="flex gap-4">
                {['Yes', 'No'].map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-lg ${
                      disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${value === option ? 'border-teal-600 bg-teal-50' : 'border-slate-300'}`}
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={value === option}
                      disabled={disabled}
                      onChange={() => onChange(field.id, option)}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.type === 'radio') {
          return (
            <div key={field.id}>
              <p className="block text-sm font-medium text-slate-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              <div className="space-y-2">
                {(field.options || []).map((option) => (
                  <label key={option} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={field.id}
                      value={option}
                      checked={value === option}
                      disabled={disabled}
                      onChange={() => onChange(field.id, option)}
                      className="border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

        if (field.type === 'dropdown') {
          return (
            <Select
              key={field.id}
              label={field.label}
              required={field.required}
              helpText={field.helpText || undefined}
              disabled={disabled}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              options={[
                { value: '', label: field.placeholder || 'Select an option' },
                ...(field.options || []).map((option) => ({
                  value: option,
                  label: option,
                })),
              ]}
            />
          );
        }

        if (field.type === 'textarea') {
          return (
            <Textarea
              key={field.id}
              label={field.label}
              required={field.required}
              placeholder={field.placeholder}
              helpText={field.helpText || undefined}
              disabled={disabled}
              rows={3}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          );
        }

        if (field.type === 'date') {
          return (
            <Input
              key={field.id}
              type="date"
              label={field.label}
              required={field.required}
              helpText={field.helpText || undefined}
              disabled={disabled}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(field.id, e.target.value)}
            />
          );
        }

        return (
          <Input
            key={field.id}
            type="text"
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            helpText={field.helpText || undefined}
            disabled={disabled}
            value={typeof value === 'string' ? value : ''}
            onChange={(e) => onChange(field.id, e.target.value)}
          />
        );
      })}
    </div>
  );
};
