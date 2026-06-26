'use client';

import { useState } from 'react';
import type { GeocodedLocation } from '@/types/weather';

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
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationQuery: [location.name, location.admin1, location.country].filter(Boolean).join(', '),
          startDate,
          endDate,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      onSaved();
      onClose();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Save Weather Record</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Store temperature history for <strong>{location.name}</strong> to your database.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                min="1940-01-01"
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Trip to Paris, checking weather for conference…"
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 flex items-center gap-1"><span>⚠️</span> {error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {loading ? 'Fetching & saving…' : 'Save Record'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
