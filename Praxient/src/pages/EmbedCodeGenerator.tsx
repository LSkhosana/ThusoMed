import React, { useState } from 'react';
import { Code, Copy, Check, Info, ExternalLink } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { storage } from '../utils/storage';

type EmbedType = 'full' | 'schedule' | 'profile' | 'button';

export const EmbedCodeGeneratorPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<EmbedType>('full');
  const [copied, setCopied] = useState<string | null>(null);
  const { showToast } = useToast();

  const profile = storage.getProfile();
  const practiceId = 'demo-practice';

  const embedOptions: { type: EmbedType; label: string; description: string }[] = [
    {
      type: 'full',
      label: 'Full Booking Form',
      description: 'Complete booking form with all features',
    },
    {
      type: 'schedule',
      label: 'Appointment Schedule Only',
      description: 'Shows available slots for booking',
    },
    {
      type: 'profile',
      label: 'Practice Profile Card',
      description: 'Compact profile card with key information',
    },
    {
      type: 'button',
      label: 'Book Appointment Button',
      description: 'Simple button that opens booking modal',
    },
  ];

  const generateIframeCode = () => {
    const baseUrl = 'https://app.thusomed.co.za/embed';
    const heights = {
      full: 720,
      schedule: 500,
      profile: 400,
      button: 60,
    };

    return `<iframe
  src="${baseUrl}/${selectedType}/${practiceId}"
  width="100%"
  height="${heights[selectedType]}"
  style="border:0; border-radius:16px;"
  title="ThusoMed Booking"
  loading="lazy"
></iframe>`;
  };

  const generateJsCode = () => {
    return `<script src="https://app.thusomed.co.za/embed.js"></script>

<div data-thusomed-booking data-practice-id="${practiceId}" data-type="${selectedType}"></div>`;
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Embed Widgets</h1>
        <p className="text-slate-600">
          Add booking functionality to your existing website
        </p>
      </div>

      {/* Info Notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-sky-900">
              Iframe Embeds Recommended for MVP
            </p>
            <p className="text-xs text-sky-700 mt-1">
              Iframe embeds are recommended because they are easier to isolate,
              safer to place on different websites, and less likely to be
              affected by a website's existing CSS.
            </p>
          </div>
        </div>
      </div>

      {/* Embed Type Selection */}
      <Card title="Select Embed Type">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {embedOptions.map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedType(option.type)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedType === option.type
                  ? 'border-sky-600 bg-sky-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-slate-500" />
                <span className="font-semibold text-slate-900">
                  {option.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">{option.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Iframe Code */}
      <Card title="Iframe Embed Code" subtitle="Recommended for easy integration">
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-100 font-mono">
              {generateIframeCode()}
            </pre>
          </div>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(generateIframeCode(), 'iframe')}
            className="w-full sm:w-auto"
          >
            {copied === 'iframe' ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Iframe Code
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* JavaScript Code */}
      <Card
        title="JavaScript Embed Code"
        subtitle="Future option for more customization"
      >
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-slate-100 font-mono">{generateJsCode()}</pre>
          </div>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(generateJsCode(), 'js')}
            className="w-full sm:w-auto"
          >
            {copied === 'js' ? (
              <>
                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy JavaScript Code
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Preview */}
      <Card title="Preview" subtitle="How your embed will appear">
        <div className="bg-slate-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
          {selectedType === 'full' && (
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-lg font-bold text-slate-900 mb-2">
                {profile?.practiceName || 'Practice Name'}
              </p>
              <p className="text-sky-600 mb-4">
                {profile?.practitionerName || 'Doctor Name'}
              </p>
              <Button className="w-full">Book Appointment</Button>
              <p className="text-xs text-slate-500 mt-4">
                Full booking form would display here
              </p>
            </div>
          )}

          {selectedType === 'schedule' && (
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
              <p className="text-lg font-bold text-slate-900 mb-4">
                Select a Date
              </p>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs text-slate-500"
                  >
                    {day}
                  </div>
                ))}
                {Array.from({ length: 14 }, (_, i) => (
                  <button
                    key={i}
                    className="p-2 rounded bg-slate-50 text-sm hover:bg-sky-100 hover:text-sky-600"
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 text-center">
                Schedule calendar would display here
              </p>
            </div>
          )}

          {selectedType === 'profile' && (
            <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 text-xl">?</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    {profile?.practiceName || 'Practice Name'}
                  </p>
                  <p className="text-sm text-sky-600">
                    {profile?.specialty || 'Specialty'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-2">
                {profile?.address || 'Address'}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Book Appointment
              </Button>
            </div>
          )}

          {selectedType === 'button' && (
            <div className="bg-white rounded-lg p-8 text-center">
              <Button size="lg">Book Appointment</Button>
              <p className="text-xs text-slate-500 mt-4">
                Button opens booking modal
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Integration Guide */}
      <Card title="Integration Guide">
        <div className="space-y-4 text-sm text-slate-600">
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex-shrink-0">
              1
            </span>
            <div>
              <p className="font-medium text-slate-900">
                Copy the embed code
              </p>
              <p>
                Choose your preferred embed type and click "Copy Code"
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex-shrink-0">
              2
            </span>
            <div>
              <p className="font-medium text-slate-900">
                Add to your website
              </p>
              <p>
                Paste the code into your website's HTML where you want the
                booking form to appear
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 font-bold flex-shrink-0">
              3
            </span>
            <div>
              <p className="font-medium text-slate-900">
                Customize styling (optional)
              </p>
              <p>
                The iframe will automatically adjust to your page width. For
                JavaScript embeds, you can add custom CSS classes
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
