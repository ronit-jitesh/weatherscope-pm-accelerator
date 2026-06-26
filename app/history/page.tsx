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
    <div className="relative min-h-screen">
      <div className="sky-backdrop" style={{ background: 'linear-gradient(180deg, #5b7fb0 0%, #aebfd4 45%, #e9eef5 100%)' }} />
      <div className="sky-glow" style={{ background: 'radial-gradient(640px 340px at 82% 8%, rgba(255,255,255,0.35), transparent 72%)' }} />

      <header className="sticky top-0 z-40">
        <div className="glass border-b hairline">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="glass-strong inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:ring-2 hover:ring-[var(--accent)]/40 active:scale-95">
                ← Back
              </Link>
              <span className="font-semibold tracking-tight hidden sm:inline">Saved records</span>
            </div>
            <button
              onClick={() => { setShowAddForm((v) => !v); setFormError(''); setFormSuccess(''); }}
              className="px-4 py-2 bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--accent)]/25 active:scale-95"
            >
              {showAddForm ? 'Cancel' : '+ New record'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight">Your weather history</h1>
          <p className="text-muted text-sm mt-1.5 max-w-2xl">
            Create, read, update, and delete saved records — each one stores real temperature data for a place and date range. Export any of it as JSON, CSV, XML, Markdown, or PDF.
          </p>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="glass rounded-3xl p-6 animate-fade-up">
            <h2 className="font-semibold mb-4">Create a new record</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-medium text-muted mb-1.5">Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. London · Paris · 51.5074, -0.1278"
                  value={formData.locationQuery}
                  onChange={(e) => setFormData((f) => ({ ...f, locationQuery: e.target.value }))}
                  className="glass w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">Start date *</label>
                <input
                  type="date"
                  required
                  min="1940-01-01"
                  max={today}
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  className="glass w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">End date *</label>
                <input
                  type="date"
                  required
                  min={formData.startDate || '1940-01-01'}
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  className="glass w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted mb-1.5">Notes <span className="opacity-60">(optional)</span></label>
              <input
                type="text"
                placeholder="e.g. Business trip · holiday research…"
                value={formData.notes}
                maxLength={500}
                onChange={(e) => setFormData((f) => ({ ...f, notes: e.target.value }))}
                className="glass w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60"
              />
            </div>
            {formError && <p className="text-sm text-red-500 mb-3">⚠️ {formError}</p>}
            {formSuccess && <p className="text-sm text-emerald-500 mb-3">{formSuccess}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[var(--accent)]/25 active:scale-95"
              >
                {formLoading ? 'Fetching weather & saving…' : 'Create record'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="glass px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:ring-2 hover:ring-[var(--muted)]/30 active:scale-95"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-muted mt-3">
              The location is validated via geocoding. Date ranges can reach back to 1940 and up to 16 days ahead — maximum 365 days.
            </p>
          </form>
        )}

        {formSuccess && !showAddForm && (
          <div className="glass rounded-2xl px-4 py-3 text-emerald-600 dark:text-emerald-400 text-sm animate-fade-up">
            {formSuccess}
          </div>
        )}

        <HistoryTable key={refreshKey} />
      </main>
    </div>
  );
}
