'use client';

import { useState, useEffect, useCallback } from 'react';
import ExportButtons from './ExportButtons';
import type { WeatherRecordRow } from '@/types/weather';
import { getWmoInfo } from '@/lib/wmo-codes';
import { apiFetch, errorMessage } from '@/lib/client';

export default function HistoryTable() {
  const [records, setRecords] = useState<WeatherRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandId, setExpandId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecords(data.records);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  function startEdit(r: WeatherRecordRow) {
    setEditId(r.id);
    setEditNotes(r.notes || '');
    setEditStart(r.startDate);
    setEditEnd(r.endDate);
    setEditLocation(r.locationQuery);
    setEditError('');
  }

  async function saveEdit() {
    if (!editId) return;
    setEditLoading(true);
    setEditError('');
    try {
      await apiFetch(`/api/records/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes, startDate: editStart, endDate: editEnd, locationQuery: editLocation }),
      });
      setEditId(null);
      fetchRecords();
    } catch (err) {
      setEditError(errorMessage(err));
    } finally {
      setEditLoading(false);
    }
  }

  async function confirmDelete(id: string) {
    try {
      const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteId(null);
      fetchRecords();
    } catch {
      alert('Failed to delete record');
    }
  }

  const inputCls = 'card-2 w-full px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)] [color-scheme:dark]';

  if (loading) return (
    <div className="card flex items-center justify-center py-16 text-dim">
      <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mr-2" />
      Loading records…
    </div>
  );

  if (error) return (
    <div className="card text-center py-12 text-red-400">
      <p>⚠️ {error}</p>
      <button onClick={fetchRecords} className="mt-3 text-sm underline">Retry</button>
    </div>
  );

  if (records.length === 0) return (
    <div className="card text-center py-16 text-dim animate-fade-up">
      <p className="text-5xl mb-3">📭</p>
      <p className="font-medium text-white">No records yet</p>
      <p className="text-sm mt-1">Search a place on the home page and save it, or use “+ New record” above.</p>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-dim">{records.length} record{records.length !== 1 ? 's' : ''} stored</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-dim">Export all:</span>
          <ExportButtons />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b hairline">
                {['Location', 'Date range', 'Days', 'Temp range', 'Saved', 'Notes', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3.5 text-[11px] font-semibold text-dim uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const temps = r.temperatureData;
                const maxTemp = temps.length ? Math.round(Math.max(...temps.map((d) => d.tempMax))) : null;
                const minTemp = temps.length ? Math.round(Math.min(...temps.map((d) => d.tempMin))) : null;
                const isEditing = editId === r.id;

                return (
                  <>
                    <tr key={r.id} className="border-b hairline last:border-0 hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3.5">
                        <p className="font-medium max-w-[180px] truncate">{r.resolvedName}</p>
                        <p className="text-xs text-dimmer">{r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-dim">{r.startDate} → {r.endDate}</td>
                      <td className="px-4 py-3.5 text-center text-dim">{temps.length}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {maxTemp !== null && minTemp !== null ? (
                          <span><span className="font-medium">{maxTemp}°</span> <span className="text-dim">/ {minTemp}°</span></span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-dimmer whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3.5 text-xs text-dim max-w-[140px] truncate">{r.notes || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandId(expandId === r.id ? null : r.id)}
                            className="px-2 py-1 text-xs rounded-lg bg-[var(--surface-2)] hover:bg-[#333] transition-colors"
                            title="View daily data"
                          >
                            {expandId === r.id ? '▲' : '▼'}
                          </button>
                          <button
                            onClick={() => startEdit(r)}
                            className="px-2.5 py-1 text-xs rounded-lg font-medium text-black transition-all active:scale-95"
                            style={{ background: 'var(--accent)' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-medium"
                          >
                            Delete
                          </button>
                          <ExportButtons recordId={r.id} compact />
                        </div>
                      </td>
                    </tr>

                    {/* Edit row */}
                    {isEditing && (
                      <tr key={`${r.id}-edit`} className="bg-white/[0.02]">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="text-xs font-medium text-dim mb-1.5 block">Location</label>
                              <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-dim mb-1.5 block">Start date</label>
                              <input type="date" value={editStart} min="1940-01-01" onChange={(e) => setEditStart(e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-dim mb-1.5 block">End date</label>
                              <input type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} className={inputCls} />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-dim mb-1.5 block">Notes</label>
                              <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} maxLength={500} className={inputCls} />
                            </div>
                          </div>
                          {editError && <p className="text-xs text-red-400 mb-2">⚠️ {editError}</p>}
                          <div className="flex gap-2">
                            <button onClick={saveEdit} disabled={editLoading} className="btn-accent px-4 py-2 text-xs disabled:opacity-50">
                              {editLoading ? 'Saving…' : 'Save changes'}
                            </button>
                            <button onClick={() => setEditId(null)} className="btn-ghost px-4 py-2 text-xs font-medium">
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Expand row */}
                    {expandId === r.id && (
                      <tr key={`${r.id}-expand`} className="bg-white/[0.02]">
                        <td colSpan={7} className="px-4 py-4">
                          <p className="text-[11px] font-semibold text-dim mb-2.5 uppercase tracking-wider">Daily temperature data</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
                            {r.temperatureData.map((d) => (
                              <div key={d.date} className="card-2 p-2 text-center text-xs">
                                <p className="text-dimmer text-[10px]">{d.date.slice(5)}</p>
                                <p className="text-lg my-0.5">{getWmoInfo(d.weatherCode).emoji}</p>
                                <p className="font-medium">{Math.round(d.tempMax)}°</p>
                                <p className="text-dim">{Math.round(d.tempMin)}°</p>
                                {d.precipitationSum > 0 && <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{d.precipitationSum}mm</p>}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="card p-6 max-w-sm w-full animate-fade-up border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-red-500/20 text-xl" aria-hidden>🗑️</span>
              <h3 className="font-semibold">Delete this record?</h3>
            </div>
            <p className="text-sm text-dim mb-5">This permanently removes the record and its stored weather data. This can’t be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1 px-4 py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteId)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-all active:scale-95">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
