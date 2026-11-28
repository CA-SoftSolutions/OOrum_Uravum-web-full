'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useUserAuth } from '@/contexts/UserAuthContext';
import AuthModal from '@/components/ui/AuthModal';
import Breadcrumb from '@/components/ui/Breadcrumb';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface ActivityComment {
  id: string;
  displayName: string;
  content: string;
  status: string;
  createdAt: string;
  article: { id: string; title: string; slug: string } | null;
}

interface ActivityObituary {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

interface Activity {
  comments: ActivityComment[];
  obituaries: ActivityObituary[];
}

interface FamilyEntry {
  id: string;
  label: string;
  version: number;
  updatedAt: string;
  data: Record<string, { name: string; alive: boolean }[]>;
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'நிலுவையில்', className: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'அங்கீகரிக்கப்பட்டது', className: 'bg-green-100 text-green-800' },
  FLAGGED: { label: 'மதிப்பாய்வில்', className: 'bg-orange-100 text-orange-800' },
  REJECTED: { label: 'நிராகரிக்கப்பட்டது', className: 'bg-red-100 text-red-800' },
};

function statusBadge(status: string) {
  const s = STATUS_LABELS[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${s.className}`}>
      {s.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ta-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  const { user, token, loading: authLoading, logout } = useUserAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [familyEntries, setFamilyEntries] = useState<FamilyEntry[]>([]);
  const [deleteFamilyTarget, setDeleteFamilyTarget] = useState<FamilyEntry | null>(null);
  const [familyBusy, setFamilyBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    setError('');
    try {
      const [meRes, actRes, famRes] = await Promise.all([
        fetch(`${API_URL}/public-auth/me`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${API_URL}/public-auth/me/activity`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        fetch(`${API_URL}/public-auth/family-details`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
      ]);
      if (meRes.status === 401 || actRes.status === 401) {
        logout();
        return;
      }
      if (!meRes.ok || !actRes.ok) throw new Error('load failed');
      setProfile(await meRes.json());
      setActivity(await actRes.json());
      if (famRes.ok) {
        const famJson = await famRes.json().catch(() => null);
        setFamilyEntries(famJson?.entries ?? []);
      }
    } catch {
      setError('தகவலை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoadingData(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (!authLoading && user && token) fetchData();
    else if (!authLoading) setLoadingData(false);
  }, [authLoading, user, token, fetchData]);

  const startEdit = () => {
    setEditName(profile?.name ?? '');
    setEditPhone(profile?.phone ?? '');
    setEditAddress(profile?.address ?? '');
    setSaveMessage('');
    setEditing(true);
  };

  const handleDeleteFamily = async () => {
    if (!token || !deleteFamilyTarget) return;
    const target = deleteFamilyTarget;
    setFamilyBusy(true);
    try {
      const res = await fetch(`${API_URL}/public-auth/family-details/${encodeURIComponent(target.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message || 'சேமிப்பை நீக்க முடியவில்லை.');
        return;
      }
      setFamilyEntries((prev) => prev.filter((e) => e.id !== target.id));
      setDeleteFamilyTarget(null);
    } catch {
      setError('சேமிப்பை நீக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setFamilyBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!token) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch(`${API_URL}/public-auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, phone: editPhone || null, address: editAddress || null }),
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setSaveMessage(body?.error?.message || 'சேமிக்க முடியவில்லை.');
        return;
      }
      const updated = await res.json();
      setProfile(updated);
      setEditing(false);
      // Keep the cached session user in sync so the header shows the new name
      const stored = localStorage.getItem('user_data');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem('user_data', JSON.stringify({ ...parsed, name: updated.name, phone: updated.phone, avatarUrl: updated.avatarUrl }));
        } catch { /* ignore */ }
      }
      window.location.reload();
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || (user && loadingData)) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-foreground/50">
        ஏற்றுகிறது...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <Breadcrumb items={[{ label: 'முகப்பு', href: '/' }, { label: 'சுயவிவரம்' }]} />
        <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-8 border border-foreground/10 text-center">
          <h1 className="text-2xl font-bold mb-3">சுயவிவரம்</h1>
          <p className="text-sm text-foreground/70 mb-6">
            உங்கள் சுயவிவரம் மற்றும் செயல்பாடுகளை பார்க்க உள்நுழையவும் அல்லது பதிவு செய்யவும்.
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

  const approvedComments = activity?.comments.filter((c) => c.status === 'APPROVED').length ?? 0;
  const pendingObituaries = activity?.obituaries.filter((o) => o.status === 'PENDING').length ?? 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb items={[{ label: 'முகப்பு', href: '/' }, { label: 'சுயவிவரம்' }]} />

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      {/* Profile card */}
      <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-6 border border-foreground/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent-red flex items-center justify-center text-white text-2xl font-bold">
              {(profile?.name ?? user.name).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="பெயர்"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="தொலைபேசி எண்"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="முகவரி"
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={saving || !editName.trim()}
                    className="bg-accent-red text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-accent-red/90 disabled:opacity-50"
                  >
                    {saving ? 'சேமிக்கிறது...' : 'சேமி'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="border border-foreground/20 px-4 py-2 rounded-lg text-sm"
                  >
                    ரத்து செய்
                  </button>
                </div>
                {saveMessage && <p className="text-xs text-red-600">{saveMessage}</p>}
              </div>
            ) : (
              <>
                <h1 className="text-xl font-bold truncate">{profile?.name ?? user.name}</h1>
                <p className="text-sm text-foreground/60 truncate">{profile?.email ?? user.email}</p>
                {profile?.phone && <p className="text-sm text-foreground/60">{profile.phone}</p>}
                {profile?.address && <p className="text-sm text-foreground/50 truncate">{profile.address}</p>}
                {profile?.createdAt && (
                  <p className="text-xs text-foreground/40 mt-1">
                    உறுப்பினர் முதல்: {formatDate(profile.createdAt)}
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="border border-foreground/20 px-3 py-1.5 rounded-lg text-sm hover:bg-foreground/5"
                  >
                    சுயவிவரத்தை திருத்து
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50"
                  >
                    வெளியேறு
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-foreground/10 text-center">
          <div>
            <p className="text-2xl font-bold">{activity?.comments.length ?? 0}</p>
            <p className="text-xs text-foreground/50">மொத்த கருத்துகள்</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{approvedComments}</p>
            <p className="text-xs text-foreground/50">அங்கீகரிக்கப்பட்டவை</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{activity?.obituaries.length ?? 0}</p>
            <p className="text-xs text-foreground/50">இரங்கல்கள் (நிலுவை: {pendingObituaries})</p>
          </div>
        </div>
      </div>

      {/* My comments */}
      <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-6 border border-foreground/10">
        <h2 className="text-lg font-bold mb-4">என் கருத்துகள்</h2>
        {!activity || activity.comments.length === 0 ? (
          <p className="text-sm text-foreground/50">இதுவரை கருத்துகள் இல்லை.</p>
        ) : (
          <div className="space-y-3">
            {activity.comments.map((c) => (
              <div key={c.id} className="rounded-lg border border-foreground/10 p-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    {statusBadge(c.status)}
                    <span className="text-foreground/40 text-xs">{formatDate(c.createdAt)}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{c.content}</p>
                {c.article && (
                  <Link href={`/news/${c.article.slug}`} className="mt-2 inline-block text-xs text-blue-600 hover:underline">
                    {c.article.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My obituaries */}
      <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-6 border border-foreground/10 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">என் இரங்கல்கள்</h2>
          <Link href="/submit-obituary" className="text-xs bg-accent-red text-white px-3 py-1.5 rounded font-bold hover:bg-accent-red/90">
            புதிய இரங்கல்
          </Link>
        </div>
        {!activity || activity.obituaries.length === 0 ? (
          <p className="text-sm text-foreground/50">இதுவரை இரங்கல் சமர்ப்பிக்கப்படவில்லை.</p>
        ) : (
          <div className="space-y-3">
            {activity.obituaries.map((o) => (
              <div key={o.id} className="rounded-lg border border-foreground/10 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{o.name}</p>
                  <p className="text-xs text-foreground/40">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(o.status)}
                  {o.status === 'APPROVED' && (
                    <Link href={`/obituary/${o.slug}`} className="text-xs text-blue-600 hover:underline">
                      காண்க
                    </Link>
                  )}
                  <Link
                    href={`/submit-obituary?edit=${o.id}`}
                    className="text-xs text-accent-red font-semibold hover:underline"
                  >
                    திருத்து
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-foreground/40 mt-3">
          திருத்திய பிறகு இரங்கல் நிர்வாக மதிப்பாய்வுக்கு மீண்டும் அனுப்பப்படும் (நிலுவை நிலைக்குத் திரும்பும்).
        </p>
      </div>

      {/* Saved family detail entries */}
      <div className="mt-6 bg-card-bg rounded-2xl shadow-sm p-6 border border-foreground/10 mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">சேமித்த குடும்ப விவரங்கள்</h2>
          <Link href="/submit-obituary" className="text-xs bg-accent-red text-white px-3 py-1.5 rounded font-bold hover:bg-accent-red/90">
            புதிய பதிவு
          </Link>
        </div>
        {familyEntries.length === 0 ? (
          <p className="text-sm text-foreground/50">
            இதுவரை குடும்ப விவரங்கள் சேமிக்கப்படவில்லை. இரங்கல் படிவத்தில் குடும்ப உறுப்பினர்களைச் சேமித்து, இங்கே திருத்தலாம்.
          </p>
        ) : (
          <div className="space-y-3">
            {familyEntries.map((e) => {
              const memberCount = Object.values(e.data).reduce((n, list) => n + (list?.length ?? 0), 0);
              return (
                <div key={e.id} className="rounded-lg border border-foreground/10 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{e.label || 'குடும்ப விவரங்கள்'}</p>
                    <p className="text-xs text-foreground/40">
                      v{e.version} · {memberCount} உறுப்பினர்கள் · {formatDate(e.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href={`/submit-obituary?family=${e.id}`}
                      className="text-xs text-accent-red font-semibold hover:underline"
                    >
                      திருத்து / Use
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteFamilyTarget(e)}
                      className="text-xs text-red-500 font-semibold hover:underline"
                    >
                      நீக்கு
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteFamilyTarget}
        title="சேமிப்பை நீக்கவா?"
        message={`"${deleteFamilyTarget?.label || 'குடும்ப விவரங்கள்'}" சேமிப்பை நிரந்தரமாக நீக்கப்படும். தொடரவா?`}
        confirmLabel="நீக்கு"
        danger
        busy={familyBusy}
        onConfirm={handleDeleteFamily}
        onCancel={() => setDeleteFamilyTarget(null)}
      />
    </main>
  );
}
