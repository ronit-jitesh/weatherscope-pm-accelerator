'use client';

import { useState, useEffect, useCallback } from 'react';
import ExportButtons from './ExportButtons';
import type { WeatherRecordRow } from '@/types/weather';
import { getWmoInfo } from '@/lib/wmo-codes';

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
      const res = await fetch(`/api/records/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: editNotes, startDate: editStart, endDate: editEnd, locationQuery: editLocation }),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || 'Update failed'); return; }
      setEditId(null);
      fetchRecords();
    } catch {
      setEditError('Network error');
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

  if (loading) return (
    <div className="flex items-center justify-center py-16 text-gray-400">
      <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mr-2" />
      Loading records…
    </div>
  );

  if (error) return (
    <div className="text-center py-12 text-red-500">
      <p>⚠️ {error}</p>
      <button onClick={fetchRecords} className="mt-3 text-sm underline">Retry</button>
    </div>
  );

  if (records.length === 0) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">📭</p>
      <p className="font-medium">No records yet</p>
      <p className="text-sm mt-1">Search for a location and save a weather record from the home page.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{records.length} record{records.length !== 1 ? 's' : ''} stored</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">Export all:</span>
          <ExportButtons />
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Location', 'Date Range', 'Days', 'Temp Range', 'Saved', 'Notes', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {records.map((r) => {
              const temps = r.temperatureData;
              const maxTemp = temps.length ? Math.round(Math.max(...temps.map((d) => d.tempMax))) : null;
              const minTemp = temps.length ? Math.round(Math.min(...temps.map((d) => d.tempMin))) : null;
              const isEditing = editId === r.id;

              return (
                <>
                  <tr key={r.id} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-gray-100 max-w-[160px] truncate">{r.resolvedName}</p>
                      <p className="text-xs text-gray-400">{r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {r.startDate} → {r.endDate}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                      {temps.length}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {maxTemp !== null && minTemp !== null ? `${maxTemp}° / ${minTemp}°` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[120px] truncate">
                      {r.notes || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setExpandId(expandId === r.id ? null : r.id)}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300"
                          title="View data"
                        >
                          {expandId === r.id ? '▲' : '▼'}
                        </button>
                        <button
                          onClick={() => startEdit(r)}
                          className="px-2 py-1 text-xs bg-sky-100 dark:bg-sky-900/40 hover:bg-sky-200 dark:hover:bg-sky-900/60 rounded-lg text-sky-700 dark:text-sky-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-lg text-red-700 dark:text-red-400"
                        >
                          Delete
                        </button>
                        <ExportButtons recordId={r.id} />
                      </div>
                    </td>
                  </tr>

                  {/* Edit row */}
                  {isEditing && (
                    <tr key={`${r.id}-edit`} className="bg-sky-50 dark:bg-sky-900/10">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Location</label>
                            <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Start Date</label>
                            <input type="date" value={editStart} min="1940-01-01"
                              onChange={(e) => setEditStart(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">End Date</label>
                            <input type="date" value={editEnd}
                              onChange={(e) => setEditEnd(e.target.value)}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Notes</label>
                            <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                              maxLength={500}
                              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                          </div>
                        </div>
                        {editError && <p className="text-xs text-red-500 mb-2">⚠️ {editError}</p>}
                        <div className="flex gap-2">
                          <button onClick={saveEdit} disabled={editLoading}
                            className="px-4 py-2 text-xs font-medium bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-lg transition-colors">
                            {editLoading ? 'Saving…' : 'Save Changes'}
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="px-4 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Expand row */}
                  {expandId === r.id && (
                    <tr key={`${r.id}-expand`} className="bg-gray-50 dark:bg-gray-800/50">
                      <td colSpan={7} className="px-4 py-4">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Daily Temperature Data</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
                          {r.temperatureData.map((d) => (
                            <div key={d.date} className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center text-xs border border-gray-100 dark:border-gray-700">
                              <p className="text-gray-400">{d.date}</p>
                              <p className="text-lg">{getWmoInfo(d.weatherCode).emoji}</p>
                              <p className="font-medium text-gray-800 dark:text-gray-200">{Math.round(d.tempMax)}°</p>
                              <p className="text-gray-400">{Math.round(d.tempMin)}°</p>
                              {d.precipitationSum > 0 && <p className="text-blue-400">{d.precipitationSum}mm</p>}
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Record?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                Cancel
              </button>
              <button onClick={() => confirmDelete(deleteId)}
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
