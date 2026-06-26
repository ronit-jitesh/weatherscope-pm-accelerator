'use client';

import Link from 'next/link';
import HistoryTable from '@/components/HistoryTable';
import { useState } from 'react';
import { apiFetch, errorMessage } from '@/lib/client';

interface CreatedRecord { record: { resolvedName: string } }

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
      const data = await apiFetch<CreatedRecord>('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormSuccess(`✅ Record created for ${data.record.resolvedName}`);
      setFormData({ locationQuery: '', startDate: '', endDate: '', notes: '' });
      setShowAddForm(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setFormLoading(false);
    }
  }

  const fieldCls = 'card-2 w-full px-3 py-2.5 text-sm text-white placeholder:text-dimmer focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [color-scheme:dark]';

  return (
    <div className="relative min-h-screen grain ambient-glow">
      <header className="sticky top-0 z-40">
        <div className="bg-black/80 backdrop-blur-md border-b hairline">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium">
                ← Back
              </Link>
              <span className="font-semibold tracking-tight hidden sm:inline">Saved records</span>
            </div>
            <button
              onClick={() => { setShowAddForm((v) => !v); setFormError(''); setFormSuccess(''); }}
              className="btn-accent px-4 py-2 text-sm"
            >
              {showAddForm ? 'Cancel' : '+ New record'}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="animate-fade-up">
          <span className="pill mb-2">CRUD</span>
          <h1 className="text-3xl font-bold tracking-tight">Your weather history</h1>
          <p className="text-dim text-sm mt-1.5 max-w-2xl">
            Create, read, update, and delete saved records — each one stores real temperature data for a place and date range. Export any of it as JSON, CSV, XML, Markdown, or PDF.
          </p>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="card p-6 animate-fade-up">
            <h2 className="font-semibold mb-4">Create a new record</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-dim mb-1.5">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London · Paris · 51.5074, -0.1278"
                  value={formData.locationQuery}
                  onChange={(e) => setFormData((f) => ({ ...f, locationQuery: e.target.value }))}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dim mb-1.5">Start date *</label>
                <input
                  type="date"
                  required
                  min="1940-01-01"
                  max={today}
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  className={fieldCls}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-dim mb-1.5">End date *</label>
                <input
                  type="date"
                  required
                  min={formData.startDate || '1940-01-01'}
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  className={fieldCls}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-dim mb-1.5">Notes <span className="opacity-60">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Business trip · holiday research…"
                value={formData.notes}
                maxLength={500}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className={fieldCls}
              />
            </div>
            {formError && <p className="text-sm text-red-400 mb-3">⚠️ {formError}</p>}
            {formSuccess && <p className="text-sm mb-3" style={{ color: 'var(--accent)' }}>{formSuccess}</p>}
            <div className="flex gap-3">
              <button type="submit" disabled={formLoading} className="btn-accent px-5 py-2.5 text-sm disabled:opacity-50">
                {formLoading ? 'Fetching weather & saving…' : 'Create record'}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-ghost px-5 py-2.5 text-sm font-medium">
                Cancel
              </button>
            </div>
            <p className="text-xs text-dimmer mt-3">
              The location is validated via geocoding. Date ranges can reach back to 1940 and up to 16 days ahead — maximum 365 days.
            </p>
          </form>
        )}

        {formSuccess && !showAddForm && (
          <div className="card px-4 py-3 text-sm animate-fade-up" style={{ color: 'var(--accent)' }}>
            {formSuccess}
          </div>
        )}

        <HistoryTable key={refreshKey} />
      </main>
    </div>
  );
}
