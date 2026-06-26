'use client';

const FORMATS = [
  { key: 'json', label: 'JSON', icon: '{}' },
  { key: 'csv', label: 'CSV', icon: '📊' },
  { key: 'xml', label: 'XML', icon: '🗂️' },
  { key: 'markdown', label: 'Markdown', icon: '📝' },
  { key: 'pdf', label: 'PDF', icon: '📄' },
];

interface Props {
  recordId?: string;
}

export default function ExportButtons({ recordId }: Props) {
  function handleExport(format: string) {
    const params = new URLSearchParams({ format });
    if (recordId) params.set('id', recordId);
    window.open(`/api/export?${params.toString()}`, '_blank');
  }

  return (
    <div className="flex flex-wrap gap-2">
      {FORMATS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => handleExport(key)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors shadow-sm"
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
