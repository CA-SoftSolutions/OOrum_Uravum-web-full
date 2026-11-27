'use client';

import { useState } from 'react';

export interface FamilyPerson {
  name: string;
  alive: boolean;
}

/** Serialize persons for storage/submission: "Name (Alive), Name2 (Deceased)" */
export function serializeFamilyPersons(list: FamilyPerson[]): string {
  return list.map((p) => `${p.name} (${p.alive ? 'Alive' : 'Deceased'})`).join(', ');
}

/** Parse a comma/newline separated string into person entries (default: alive). */
export function parseFamilyPersons(text: string): FamilyPerson[] {
  return text
    .split(/[,،\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name, alive: true }));
}

interface FamilyMembersInputProps {
  id: string;
  label: string;
  value: FamilyPerson[];
  onChange: (next: FamilyPerson[]) => void;
  placeholder?: string;
}

export default function FamilyMembersInput({ id, label, value, onChange, placeholder }: FamilyMembersInputProps) {
  const [draft, setDraft] = useState('');

  const commitDraft = () => {
    const names = draft
      .split(/[,،\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setDraft('');
    if (!names.length) return;
    const existing = new Set(value.map((p) => p.name.toLowerCase()));
    const additions = names
      .filter((n) => !existing.has(n.toLowerCase()))
      .map((name) => ({ name, alive: true }));
    if (additions.length) onChange([...value, ...additions]);
  };

  const removePerson = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const toggleAlive = (index: number) => {
    onChange(value.map((p, i) => (i === index ? { ...p, alive: !p.alive } : p)));
  };

  return (
    <div>
      <label htmlFor={`${id}-input`} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-input`}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              commitDraft();
            }
          }}
          onBlur={commitDraft}
          placeholder={placeholder ?? 'Type a name and press Enter or comma'}
          className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-accent-red/30 focus:border-accent-red"
        />
        <button
          type="button"
          onClick={commitDraft}
          className="px-4 py-2.5 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
        >
          Add
        </button>
      </div>
      <p className="text-xs text-foreground/50 mt-1">Separate multiple names with commas. Mark each person Alive or Deceased.</p>
      {value.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label={`${label} entries`}>
          {value.map((person, i) => (
            <li
              key={`${person.name}-${i}`}
              className="flex items-center gap-2 flex-wrap rounded-lg border border-yellow-200 bg-yellow-50/50 px-3 py-2"
            >
              <span className="text-sm font-medium flex-1 min-w-[120px] break-words">{person.name}</span>
              <div className="flex rounded-full overflow-hidden border border-yellow-300 text-xs font-bold" role="group" aria-label={`Alive status for ${person.name}`}>
                <button
                  type="button"
                  onClick={() => toggleAlive(i)}
                  aria-pressed={person.alive}
                  className={`px-3 py-1 transition-colors ${person.alive ? 'bg-green-600 text-white' : 'bg-white text-foreground/50 hover:bg-green-50'}`}
                >
                  Alive
                </button>
                <button
                  type="button"
                  onClick={() => toggleAlive(i)}
                  aria-pressed={!person.alive}
                  className={`px-3 py-1 transition-colors ${!person.alive ? 'bg-gray-600 text-white' : 'bg-white text-foreground/50 hover:bg-gray-50'}`}
                >
                  Deceased
                </button>
              </div>
              <button
                type="button"
                onClick={() => removePerson(i)}
                aria-label={`Remove ${person.name}`}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
