'use client';

import Link from 'next/link';
import HistoryTable from '@/components/HistoryTable';
import { useState } from 'react';

export default function HistoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ locationQuery: '', startDate: '', endDate: '', notes: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    if (!formData.locationQuery || !formData.startDate || !formData.endDate) {
      setFormError('Location, start date, and end date are required');
      return;
    }
    setFormLoading(true);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || 'Failed to create record'); return; }
      setFormSuccess(`✅ Record created for ${data.record.resolvedName}`);
      setFormData({ locationQuery: '', startDate: '', endDate: '', notes: '' });
      setShowAddForm(false);
      setRefreshKey((k) => k + 1);
    } catch {
      setFormError('Network error — please try again');
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm">← Back</Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">⛅ WeatherScope — History</span>
          </div>
          <button
            onClick={() => { setShowAddForm((v) => !v); setFormError(''); setFormSuccess(''); }}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ New Record'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Weather Record History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Create, read, update, and delete stored weather records. Export in JSON, CSV, XML, Markdown, or PDF.
          </p>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Create New Weather Record</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London, Paris, 51.5074,-0.1278"
                  value={formData.locationQuery}
                  onChange={(e) => setFormData((f) => ({ ...f, locationQuery: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date *</label>
                <input
                  type="date"
                  required
                  min="1940-01-01"
                  max={today}
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Date *</label>
                <input
                  type="date"
                  required
                  min={formData.startDate || '1940-01-01'}
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. Business trip, holiday research…"
                value={formData.notes}
                maxLength={500}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            {formError && <p className="text-sm text-red-500 mb-3">⚠️ {formError}</p>}
            {formSuccess && <p className="text-sm text-green-500 mb-3">{formSuccess}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {formLoading ? 'Fetching weather & saving…' : 'Create Record'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Location is validated via geocoding. Date range can span past (back to 1940) + future (up to 16 days). Max 365 days.
            </p>
          </form>
        )}

        {formSuccess && !showAddForm && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 text-green-700 dark:text-green-400 text-sm">
            {formSuccess}
          </div>
        )}

        <HistoryTable key={refreshKey} />
      </main>
    </div>
  );
}
