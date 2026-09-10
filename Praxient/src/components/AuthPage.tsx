import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, User, Phone, FolderHeart } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';

export const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup state
  const [practiceName, setPracticeName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const specialtyOptions = [
    { value: '', label: 'Select Specialty' },
    { value: 'General Practitioner', label: 'General Practitioner' },
    { value: 'Cardiologist', label: 'Cardiologist' },
    { value: 'Dermatologist', label: 'Dermatologist' },
    { value: 'Gynecologist', label: 'Gynecologist' },
    { value: 'Pediatrician', label: 'Pediatrician' },
    { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon' },
    { value: 'Neurologist', label: 'Neurologist' },
    { value: 'Psychiatrist', label: 'Psychiatrist' },
    { value: 'Radiologist', label: 'Radiologist' },
    { value: 'Other', label: 'Other' },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(loginEmail, loginPassword);
    showToast('Welcome back! Redirecting to dashboard...', 'success');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signup({
      practiceName,
      doctorName,
      email: signupEmail,
      phone,
      specialty,
      password: signupPassword,
    });
    showToast('Account created successfully!', 'success');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">ThusoMed</span>
          </div>
          <a
            href="#"
            className="text-sm text-sky-600 hover:text-sky-700 font-medium"
          >
            Learn More
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome to ThusoMed
            </h1>
            <p className="text-slate-600">
              Your medical practice management platform
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'login'
                    ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Practice Login
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'signup'
                    ? 'text-sky-600 border-b-2 border-sky-600 bg-sky-50/50'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Forms */}
            <div className="p-6">
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Log In
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <Input
                    label="Practice Name"
                    placeholder="e.g., Thuso Family Medical Practice"
                    value={practiceName}
                    onChange={(e) => setPracticeName(e.target.value)}
                    required
                  />
                  <Input
                    label="Doctor/Practitioner Name"
                    placeholder="e.g., Dr. Naledi Mokoena"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="practice@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+27 XX XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Select
                    label="Specialty"
                    options={specialtyOptions}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    required
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              )}

              {/* Demo Notice */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <FolderHeart className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Demo Mode
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      No real account is created. Data is stored locally in your
                      browser.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                <User className="w-4 h-4 text-sky-600" />
              </div>
              <span>Create your practice profile</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Online appointment booking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-amber-600" />
              </div>
              <span>Embed widgets on your website</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-sm text-slate-500">
          ThusoMed - Medical Practice Management Platform
        </p>
      </footer>
    </div>
  );
};
