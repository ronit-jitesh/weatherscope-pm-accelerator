'use client';

import { useState } from 'react';
import type { GeocodedLocation } from '@/types/weather';
import { apiFetch, errorMessage } from '@/lib/client';

interface Props {
  location: GeocodedLocation;
  onSaved: () => void;
  onClose: () => void;
}

export default function SaveRecordModal({ location, onSaved, onClose }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setError('');
    if (startDate > endDate) { setError('Start date must be before end date'); return; }
    setLoading(true);
    try {
      await apiFetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationQuery: [location.name, location.admin1, location.country].filter(Boolean).join(', '),
          startDate,
          endDate,
          notes: notes || undefined,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-md p-6 animate-fade-up border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-1">
          <span className="grid h-10 w-10 place-items-center rounded-2xl text-lg" style={{ background: 'var(--accent)' }} aria-hidden>🗃️</span>
          <h3 className="text-lg font-semibold">Save to your history</h3>
        </div>
        <p className="text-sm text-dim mb-5">
          We&apos;ll pull temperature data for <strong className="text-white">{location.name}</strong> across your chosen dates and store it.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                min="1940-01-01"
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="card-2 w-full px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dim mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="card-2 w-full px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [color-scheme:dark]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dim mb-1.5">Notes <span className="opacity-60">(optional)</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paris trip · checking weather before the conference…"
              rows={2}
              maxLength={500}
              className="card-2 w-full px-3 py-2.5 text-sm text-white placeholder:text-dimmer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-1.5"><span aria-hidden>⚠️</span> {error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="btn-ghost flex-1 px-4 py-2.5 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn-accent flex-1 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {loading ? 'Fetching & saving…' : 'Save record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
