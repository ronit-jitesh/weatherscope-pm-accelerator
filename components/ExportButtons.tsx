'use client';

const FORMATS = [
  { key: 'json', label: 'JSON', icon: '{ }' },
  { key: 'csv', label: 'CSV', icon: '📊' },
  { key: 'xml', label: 'XML', icon: '🗂️' },
  { key: 'markdown', label: 'Markdown', icon: '📝' },
  { key: 'pdf', label: 'PDF', icon: '📄' },
];

interface Props {
  recordId?: string;
  compact?: boolean;
}

export default function ExportButtons({ recordId, compact }: Props) {
  function handleExport(format: string) {
    const params = new URLSearchParams({ format });
    if (recordId) params.set('id', recordId);
    window.open(`/api/export?${params.toString()}`, '_blank');
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {FORMATS.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => handleExport(key)}
          title={`Export as ${label}`}
          className={`flex items-center gap-1.5 rounded-lg font-medium bg-[var(--surface-2)] text-white transition-all hover:bg-[#333] active:scale-95 ${
            compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-2 text-xs'
          }`}
        >
          <span aria-hidden>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
