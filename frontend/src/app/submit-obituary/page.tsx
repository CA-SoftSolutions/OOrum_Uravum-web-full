'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import AuthModal from '@/components/ui/AuthModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import FamilyMembersInput, { FamilyPerson, serializeFamilyPersons } from '@/components/ui/FamilyMembersInput';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');

// Form field -> saved family-details key
const FAMILY_FIELD_MAP: Record<string, string> = {
  spouseName: 'spouse',
  sonsInLawNames: 'sonsInLaw',
  daughtersInLawNames: 'daughtersInLaw',
  brothersNames: 'brothers',
  sistersNames: 'sisters',
  sonsNames: 'sons',
  daughtersNames: 'daughters',
  grandchildrenNames: 'grandchildren',
};

const FAMILY_FORM_KEYS = Object.keys(FAMILY_FIELD_MAP) as (keyof FormData)[];

type FamilyData = Record<string, FamilyPerson[]>;

interface SavedFamily {
  data: FamilyData;
  version: number;
  updatedAt: string | null;
}

interface FormData {
  photo: File | null;
  firstName: string;
  middleName: string;
  surname: string;
  otherNames: string;
  dateOfBirth: string;
  dateOfDeath: string;
  placeOfBirth: string;
  lastResidentialAddress: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
  spouseName: FamilyPerson[];
  brothersNames: FamilyPerson[];
  sistersNames: FamilyPerson[];
  fatherInLawName: string;
  motherInLawName: string;
  sonsNames: FamilyPerson[];
  daughtersNames: FamilyPerson[];
  sonsInLawNames: FamilyPerson[];
  daughtersInLawNames: FamilyPerson[];
  grandchildrenNames: FamilyPerson[];
  occupations: string;
  hobbiesInterests: string;
  communityActivities: string;
  otherDetails: string;
  lifeStory: string;
}

const initialFormData: FormData = {
  photo: null,
  firstName: '',
  middleName: '',
  surname: '',
  otherNames: '',
  dateOfBirth: '',
  dateOfDeath: '',
  placeOfBirth: '',
  lastResidentialAddress: '',
  fatherName: '',
  motherName: '',
  maritalStatus: '',
  spouseName: [],
  brothersNames: [],
  sistersNames: [],
  fatherInLawName: '',
  motherInLawName: '',
  sonsNames: [],
  daughtersNames: [],
  sonsInLawNames: [],
  daughtersInLawNames: [],
  grandchildrenNames: [],
  occupations: '',
  hobbiesInterests: '',
  communityActivities: '',
  otherDetails: '',
  lifeStory: '',
};

export const dynamic = 'force-dynamic';

export default function SubmitObituaryPage() {
  const { user, token, loading: authLoading, logout } = useUserAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const now = new Date();
  const latestDateOfDeath = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const latestDateOfBirth = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedFamily, setSavedFamily] = useState<SavedFamily | null>(null);
  const [familyBusy, setFamilyBusy] = useState(false);
  const [familyMessage, setFamilyMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const authHeaders = useCallback(
    () => (token ? { Authorization: `Bearer ${token}` } : undefined),
    [token],
  );

  // Load the user's saved family details (owner-only, fetched with their token)
  useEffect(() => {
    if (!token) {
      setSavedFamily(null);
      return;
    }
    let cancelled = false;
    fetch(`${API_URL}/public-auth/family-details`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.data) {
          setSavedFamily({ data: json.data as FamilyData, version: json.version, updatedAt: json.updatedAt });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token, authHeaders]);

  const buildFamilyPayload = (): FamilyData => {
    const data: FamilyData = {};
    for (const key of FAMILY_FORM_KEYS) {
      const list = formData[key] as FamilyPerson[];
      if (list.length) data[FAMILY_FIELD_MAP[key]] = list;
    }
    return data;
  };

  const handleSaveFamily = async () => {
    if (!token) return;
    setFamilyBusy(true);
    setFamilyMessage('');
    try {
      const res = await fetch(`${API_URL}/public-auth/family-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ data: buildFamilyPayload() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        logout();
        setAuthModalOpen(true);
        throw new Error('உள்நுழைவு காலாவதியானது. மீண்டும் உள்நுழையவும்.');
      }
      if (!res.ok) throw new Error(json.error?.message || 'Failed to save family details');
      setSavedFamily({ data: json.data as FamilyData, version: json.version, updatedAt: json.updatedAt });
      setFamilyMessage(`சேமிக்கப்பட்டது (version ${json.version})`);
    } catch (err) {
      setFamilyMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setFamilyBusy(false);
    }
  };

  const handleLoadFamily = () => {
    if (!savedFamily) return;
    setFormData((prev) => {
      const next = { ...prev };
      for (const [formKey, familyKey] of Object.entries(FAMILY_FIELD_MAP)) {
        const list = savedFamily.data[familyKey];
        (next as Record<string, unknown>)[formKey] = list ? list.map((p) => ({ ...p })) : [];
      }
      return next;
    });
    setFamilyMessage('சேமிக்கப்பட்ட குடும்ப விவரங்கள் ஏற்றப்பட்டன.');
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, photo: null }));
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only PNG, JPG, JPEG, or WEBP images are allowed');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, photo: file }));
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFamilyChange = (field: keyof FormData, value: FamilyPerson[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateOfDeathChange = (value: string) => {
    handleInputChange('dateOfDeath', value);
    if (value && value > latestDateOfDeath) {
      setFieldErrors(prev => ({ ...prev, dateOfDeath: 'Date of death cannot be in the future' }));
    }
  };

  const handleDateOfBirthChange = (value: string) => {
    handleInputChange('dateOfBirth', value);
    if (value && value > latestDateOfBirth) {
      setFieldErrors(prev => ({ ...prev, dateOfBirth: 'Date of birth must be before today' }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleClear = () => {
    const hasData = Object.values(formData).some(val =>
      Array.isArray(val) ? val.length > 0 : typeof val === 'string' ? val.trim() !== '' : val !== null
    );

    if (hasData && !confirm('Are you sure you want to clear the form? All data will be lost.')) {
      return;
    }

    setFormData(initialFormData);
    setImagePreview(null);
    setFieldErrors({});
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const fd = new FormData();

      // Required fields
      fd.append('firstName', formData.firstName);
      fd.append('dateOfDeath', formData.dateOfDeath);

      // Optional fields
      if (formData.photo) fd.append('photo', formData.photo);
      if (formData.middleName) fd.append('middleName', formData.middleName);
      if (formData.surname) fd.append('surname', formData.surname);
      if (formData.otherNames) fd.append('otherNames', formData.otherNames);
      if (formData.dateOfBirth) fd.append('dateOfBirth', formData.dateOfBirth);
      if (formData.placeOfBirth) fd.append('placeOfBirth', formData.placeOfBirth);
      if (formData.lastResidentialAddress) fd.append('lastResidentialAddress', formData.lastResidentialAddress);
      if (formData.fatherName) fd.append('fatherName', formData.fatherName);
      if (formData.motherName) fd.append('motherName', formData.motherName);
      if (formData.maritalStatus) fd.append('maritalStatus', formData.maritalStatus);
      if (formData.spouseName.length) fd.append('spouseName', serializeFamilyPersons(formData.spouseName));
      if (formData.brothersNames.length) fd.append('brothersNames', serializeFamilyPersons(formData.brothersNames));
      if (formData.sistersNames.length) fd.append('sistersNames', serializeFamilyPersons(formData.sistersNames));
      if (formData.fatherInLawName) fd.append('fatherInLawName', formData.fatherInLawName);
      if (formData.motherInLawName) fd.append('motherInLawName', formData.motherInLawName);
      if (formData.sonsNames.length) fd.append('sonsNames', serializeFamilyPersons(formData.sonsNames));
      if (formData.daughtersNames.length) fd.append('daughtersNames', serializeFamilyPersons(formData.daughtersNames));
      if (formData.sonsInLawNames.length) fd.append('sonsInLawNames', serializeFamilyPersons(formData.sonsInLawNames));
      if (formData.daughtersInLawNames.length) fd.append('daughtersInLawNames', serializeFamilyPersons(formData.daughtersInLawNames));
      if (formData.grandchildrenNames.length) fd.append('grandchildrenNames', serializeFamilyPersons(formData.grandchildrenNames));
      if (formData.occupations) fd.append('occupations', formData.occupations);
      if (formData.hobbiesInterests) fd.append('hobbiesInterests', formData.hobbiesInterests);
      if (formData.communityActivities) fd.append('communityActivities', formData.communityActivities);
      if (formData.otherDetails) fd.append('otherDetails', formData.otherDetails);
      if (formData.lifeStory) fd.append('lifeStory', formData.lifeStory);

      const res = await fetch('/api/obituaries/submit', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd,
      });

      if (res.status === 401) {
        logout();
        setAuthModalOpen(true);
        throw new Error('உள்நுழைவு காலாவதியானது. மீண்டும் உள்நுழையவும்.');
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error?.details) {
          const details = data.error.details as Record<string, string[]>;
          setFieldErrors(Object.fromEntries(
            Object.entries(details).map(([field, messages]) => [field, messages[0] ?? 'Invalid value']),
          ));
          throw new Error('Please fix the errors above');
        }
        throw new Error(data.error?.message || 'Submission failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center">
        <Breadcrumb items={[
          { label: 'முகப்பு', href: '/' },
          { label: 'Obituary (அஞ்சலி)', href: '/obituary' },
          { label: 'Obituary Information Form' },
        ]} />
        <div className="mt-6 bg-green-50 rounded-2xl p-8 border border-green-200">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-green-800 mb-2">Submission Successful!</h1>
          <p className="text-sm text-green-700 mb-4">
            Your obituary has been submitted successfully. It will be published after admin approval.
          </p>
          <Link href="/" className="inline-block bg-accent-red text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-accent-red/90">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  if (!authLoading && !token) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Breadcrumb items={[
          { label: 'முகப்பு', href: '/' },
          { label: 'Obituary (அஞ்சலி)', href: '/obituary' },
          { label: 'Obituary Information Form' },
        ]} />
        <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-8 border border-yellow-200/50 text-center">
          <h1 className="text-2xl font-bold text-accent-red mb-3">Obituary Information Form</h1>
          <p className="text-sm text-foreground/70 mb-6">
            இரங்கல் படிவத்தை சமர்ப்பிக்க உள்நுழையவும் அல்லது பதிவு செய்யவும்.
          </p>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="inline-block bg-accent-red text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-accent-red/90"
          >
            உள்நுழைய / பதிவு செய்க
          </button>
        </div>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb items={[
        { label: 'முகப்பு', href: '/' },
        { label: 'Obituary (அஞ்சலி)', href: '/obituary' },
        { label: 'Obituary Information Form' },
      ]} />

      <div className="bg-card-bg rounded-2xl shadow-sm p-6 sm:p-8 md:p-10 border border-yellow-200/50">
        {/* Header */}
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full mb-3">
            OBITUARY FORM
          </span>
          <h1 className="text-3xl font-bold text-accent-red mb-2">Obituary Information Form</h1>
          <p className="text-sm text-foreground/60">Complete information required to prepare an obituary notice</p>
          <div className="w-full h-px bg-yellow-200 mt-4" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>
        )}
        {user && (
          <p className="mb-4 text-sm text-foreground/60" role="status">
            {user.name} ({user.email}) கணக்கில் சமர்ப்பிக்கப்படுகிறது.
          </p>
        )}

        {token && (
          <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">குடும்ப விவரங்கள் (Family Details)</h3>
                <p className="text-xs text-foreground/60 mt-0.5">
                  {savedFamily
                    ? `சேமிக்கப்பட்டது — version ${savedFamily.version}${savedFamily.updatedAt ? `, ${new Date(savedFamily.updatedAt).toLocaleString()}` : ''}. பயன்படுத்த ஏற்றி திருத்தலாம்.`
                    : 'குடும்ப உறுப்பினர் விவரங்களை உங்கள் கணக்கில் சேமித்து பின்னர் மீண்டும் பயன்படுத்தலாம்.'}
                </p>
                {familyMessage && <p className="text-xs text-green-700 mt-1" role="status">{familyMessage}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                {savedFamily && (
                  <button
                    type="button"
                    onClick={handleLoadFamily}
                    className="px-4 py-2 border border-yellow-400 text-yellow-800 rounded-lg text-xs font-bold hover:bg-yellow-100 transition-colors"
                  >
                    ஏற்று / Load saved
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSaveFamily}
                  disabled={familyBusy}
                  className="px-4 py-2 bg-accent-red text-white rounded-lg text-xs font-bold hover:bg-accent-red/90 disabled:opacity-50 transition-colors"
                >
                  {familyBusy ? 'சேமிக்கிறது...' : 'சேமி / Save details'}
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Deceased Photo Upload */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Deceased Photo Upload
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-yellow-300 rounded-lg p-6 cursor-pointer hover:border-accent-red hover:bg-red-50/20 transition-colors text-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') fileInputRef.current?.click(); }}
              >
                <svg className="w-10 h-10 text-accent-red mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-foreground mb-1">Click to upload photo or drag & drop</p>
                <p className="text-xs text-foreground/50">PNG, JPG, JPEG or WEBP (Max: 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
              </div>

              {/* Photo Preview */}
              <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 flex items-center justify-center min-h-[160px]">
                {imagePreview ? (
                  <div className="relative w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-auto rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleFileChange(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-foreground/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-sm text-foreground/50">No image selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Personal Details */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                  placeholder="First name"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red ${fieldErrors.firstName ? 'border-red-500' : ''}`}
                  aria-invalid={!!fieldErrors.firstName}
                  aria-describedby={fieldErrors.firstName ? 'firstName-error' : undefined}
                />
                {fieldErrors.firstName && (
                  <p id="firstName-error" className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="middleName" className="block text-sm font-medium mb-1">Middle Name</label>
                <input
                  id="middleName"
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  placeholder="Middle name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div>
                <label htmlFor="surname" className="block text-sm font-medium mb-1">Surname</label>
                <input
                  id="surname"
                  type="text"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  placeholder="Surname"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div>
                <label htmlFor="otherNames" className="block text-sm font-medium mb-1">Any Other Names / Known As</label>
                <input
                  id="otherNames"
                  type="text"
                  value={formData.otherNames}
                  onChange={(e) => handleInputChange('otherNames', e.target.value)}
                  placeholder="Other names"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  max={latestDateOfBirth}
                  value={formData.dateOfBirth}
                  onChange={(e) => handleDateOfBirthChange(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red ${fieldErrors.dateOfBirth ? 'border-red-500' : ''}`}
                  aria-invalid={!!fieldErrors.dateOfBirth}
                  aria-describedby={fieldErrors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                />
                {fieldErrors.dateOfBirth && (
                  <p id="dateOfBirth-error" className="text-xs text-red-500 mt-1">{fieldErrors.dateOfBirth}</p>
                )}
              </div>
              <div>
                <label htmlFor="dateOfDeath" className="block text-sm font-medium mb-1">
                  Date of Death <span className="text-red-500">*</span>
                </label>
                <input
                  id="dateOfDeath"
                  type="date"
                  max={latestDateOfDeath}
                  value={formData.dateOfDeath}
                  onChange={(e) => handleDateOfDeathChange(e.target.value)}
                  required
                  placeholder="dd/mm/yyyy"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red ${fieldErrors.dateOfDeath ? 'border-red-500' : ''}`}
                  aria-invalid={!!fieldErrors.dateOfDeath}
                  aria-describedby={fieldErrors.dateOfDeath ? 'dateOfDeath-error' : undefined}
                />
                {fieldErrors.dateOfDeath && (
                  <p id="dateOfDeath-error" className="text-xs text-red-500 mt-1">{fieldErrors.dateOfDeath}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="placeOfBirth" className="block text-sm font-medium mb-1">Place / Address of Birth</label>
                <input
                  id="placeOfBirth"
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  placeholder="Place of birth"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="lastResidentialAddress" className="block text-sm font-medium mb-1">Last Residential Address</label>
                <textarea
                  id="lastResidentialAddress"
                  value={formData.lastResidentialAddress}
                  onChange={(e) => handleInputChange('lastResidentialAddress', e.target.value)}
                  rows={3}
                  placeholder="Last residential address"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Parents */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Parents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fatherName" className="block text-sm font-medium mb-1">Father&apos;s Name</label>
                <input
                  id="fatherName"
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  placeholder="Father&apos;s name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div>
                <label htmlFor="motherName" className="block text-sm font-medium mb-1">Mother&apos;s Name</label>
                <input
                  id="motherName"
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  placeholder="Mother&apos;s name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Marital & Family Details */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Marital & Family Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium mb-1">Marital Status</label>
                <select
                  id="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="widowed">Widowed</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <div>
                <FamilyMembersInput
                  id="spouseName"
                  label="Wife's Name / Husband's Name"
                  value={formData.spouseName}
                  onChange={(v) => handleFamilyChange('spouseName', v)}
                  placeholder="Spouse's name"
                />
              </div>
              <div className="md:col-span-2">
                <FamilyMembersInput
                  id="brothersNames"
                  label="Brother(s) Names"
                  value={formData.brothersNames}
                  onChange={(v) => handleFamilyChange('brothersNames', v)}
                  placeholder="Brothers' names"
                />
              </div>
              <div className="md:col-span-2">
                <FamilyMembersInput
                  id="sistersNames"
                  label="Sister(s) Names"
                  value={formData.sistersNames}
                  onChange={(v) => handleFamilyChange('sistersNames', v)}
                  placeholder="Sisters' names"
                />
              </div>
              <div>
                <label htmlFor="fatherInLawName" className="block text-sm font-medium mb-1">Father-in-Law&apos;s Name</label>
                <input
                  id="fatherInLawName"
                  type="text"
                  value={formData.fatherInLawName}
                  onChange={(e) => handleInputChange('fatherInLawName', e.target.value)}
                  placeholder="Father-in-law&apos;s name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
              <div>
                <label htmlFor="motherInLawName" className="block text-sm font-medium mb-1">Mother-in-Law&apos;s Name</label>
                <input
                  id="motherInLawName"
                  type="text"
                  value={formData.motherInLawName}
                  onChange={(e) => handleInputChange('motherInLawName', e.target.value)}
                  placeholder="Mother-in-law&apos;s name"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Children */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Children
            </h2>
            <div className="space-y-4">
              <FamilyMembersInput
                id="sonsNames"
                label="Son(s) Names"
                value={formData.sonsNames}
                onChange={(v) => handleFamilyChange('sonsNames', v)}
                placeholder="Sons' names"
              />
              <FamilyMembersInput
                id="daughtersNames"
                label="Daughter(s) Names"
                value={formData.daughtersNames}
                onChange={(v) => handleFamilyChange('daughtersNames', v)}
                placeholder="Daughters' names"
              />
              <FamilyMembersInput
                id="sonsInLawNames"
                label="Son(s)-in-Law / Son's Wife Name(s)"
                value={formData.sonsInLawNames}
                onChange={(v) => handleFamilyChange('sonsInLawNames', v)}
                placeholder="Sons-in-law names"
              />
              <FamilyMembersInput
                id="daughtersInLawNames"
                label="Daughter(s)-in-Law / Daughter's Husband Name(s)"
                value={formData.daughtersInLawNames}
                onChange={(v) => handleFamilyChange('daughtersInLawNames', v)}
                placeholder="Daughters-in-law names"
              />
              <FamilyMembersInput
                id="grandchildrenNames"
                label="Grandchildren's Names"
                value={formData.grandchildrenNames}
                onChange={(v) => handleFamilyChange('grandchildrenNames', v)}
                placeholder="Grandchildren's names"
              />
            </div>
          </div>

          {/* SECTION 6: Life & Background */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Life & Background
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="occupations" className="block text-sm font-medium mb-1">Occupation(s)</label>
                <textarea
                  id="occupations"
                  value={formData.occupations}
                  onChange={(e) => handleInputChange('occupations', e.target.value)}
                  rows={2}
                  placeholder="Occupations"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y"
                />
              </div>
              <div>
                <label htmlFor="hobbiesInterests" className="block text-sm font-medium mb-1">Hobbies / Interests</label>
                <textarea
                  id="hobbiesInterests"
                  value={formData.hobbiesInterests}
                  onChange={(e) => handleInputChange('hobbiesInterests', e.target.value)}
                  rows={2}
                  placeholder="Hobbies and interests"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y"
                />
              </div>
              <div>
                <label htmlFor="communityActivities" className="block text-sm font-medium mb-1">Community, Religious, Social or Other Activities</label>
                <textarea
                  id="communityActivities"
                  value={formData.communityActivities}
                  onChange={(e) => handleInputChange('communityActivities', e.target.value)}
                  rows={2}
                  placeholder="Community activities"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y"
                />
              </div>
              <div>
                <label htmlFor="otherDetails" className="block text-sm font-medium mb-1">Any Other Important Details</label>
                <textarea
                  id="otherDetails"
                  value={formData.otherDetails}
                  onChange={(e) => handleInputChange('otherDetails', e.target.value)}
                  rows={2}
                  placeholder="Other important details"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y"
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: Short Life Story */}
          <div>
            <h2 className="text-lg font-bold text-accent-red mb-4 border-b border-yellow-200 pb-2">
              Short Life Story
            </h2>
            <div>
              <label htmlFor="lifeStory" className="block text-sm font-medium mb-1">Life Story</label>
              <textarea
                id="lifeStory"
                value={formData.lifeStory}
                onChange={(e) => handleInputChange('lifeStory', e.target.value)}
                rows={8}
                placeholder="Briefly describe the person&apos;s life, experiences, and contributions to family or community."
                className="w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red resize-y min-h-[220px]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={handleClear}
              disabled={submitting}
              className="px-6 py-3 border-2 border-accent-red text-accent-red rounded-lg text-sm font-bold hover:bg-accent-red/5 disabled:opacity-50 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={submitting || authLoading}
              className="flex-1 px-6 py-3 bg-accent-red text-white rounded-lg text-sm font-bold hover:bg-accent-red/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Obituary Information'}
            </button>
          </div>
        </form>
      </div>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
