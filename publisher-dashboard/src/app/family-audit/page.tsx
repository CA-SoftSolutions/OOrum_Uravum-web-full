'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch, AdminApiError, toQueryString } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FamilyPerson {
  name: string;
  alive: boolean;
}

type FamilyData = Record<string, FamilyPerson[]>;

interface AuditEntry {
  id: string;
  familyId: string | null;
  label: string | null;
  version: number;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | string;
  createdAt: string;
  beforeData: FamilyData | null;
  afterData: FamilyData;
  user: { id: string; name: string; email: string } | null;
}

interface PaginatedAudit {
  data: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const FIELD_LABELS: Record<string, string> = {
  spouse: "Wife's / Husband's Name",
  sonsInLaw: "Son(s)-in-Law / Son's Wife",
  daughtersInLaw: "Daughter(s)-in-Law / Daughter's Husband",
  brothers: 'Brother(s)',
  sisters: 'Sister(s)',
  sons: 'Son(s)',
  daughters: 'Daughter(s)',
  grandchildren: "Grandchildren's",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderData(data: FamilyData | null | undefined) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-xs text-gray-400 italic">No data</p>;
  }
  return (
    <div className="space-y-2">
      {Object.entries(FIELD_LABELS).map(([key, label]) => {
        const list = data[key];
        if (!list || list.length === 0) return null;
        return (
          <div key={key}>
            <p className="text-xs font-semibold text-gray-600">{label}</p>
            <ul className="text-xs text-gray-800 list-disc list-inside">
              {list.map((p, i) => (
                <li key={i}>
                  {p.name} <span className={p.alive ? 'text-green-700' : 'text-gray-500'}>({p.alive ? 'Alive' : 'Deceased'})</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function FamilyAuditPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchAudit = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setListError('');
    try {
      const qs = toQueryString({ page, pageSize: 20 });
      const data = await adminFetch<PaginatedAudit>(`/public-auth/admin/family-audit${qs}`, { token });
      setEntries(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      setListError(err instanceof AdminApiError ? err.message : 'Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Family Details Audit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Version history of saved obituary family details — {total} entr{total === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <button
          onClick={fetchAudit}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {listError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">{listError}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          No family detail saves recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                      entry.action === 'CREATED'
                        ? 'bg-green-100 text-green-800'
                        : entry.action === 'DELETED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {entry.action}
                  </span>
                  <span className="text-sm font-medium">v{entry.version}</span>
                  {entry.label && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded truncate max-w-[180px]">
                      {entry.label}
                    </span>
                  )}
                  <span className="text-sm text-gray-700 truncate">
                    {entry.user ? `${entry.user.name} (${entry.user.email})` : 'Unknown user'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 shrink-0 ml-4">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </button>

              {expanded === entry.id && (
                <div className="border-t border-gray-100 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Before (v{entry.version - 1})</h3>
                    {renderData(entry.beforeData)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">After (v{entry.version})</h3>
                    {renderData(entry.afterData)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border rounded text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 border rounded text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
