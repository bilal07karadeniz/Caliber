import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1 justify-center mt-8 font-mono text-sm">
      <button disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="px-3 py-1 text-ink-500 hover:text-ink-900 disabled:opacity-30 transition-colors">&larr;</button>
      {start > 1 && <span className="px-1 text-ink-300">...</span>}
      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded-sm transition-colors ${p === currentPage ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900'}`}>
          {p}
        </button>
      ))}
      {end < totalPages && <span className="px-1 text-ink-300">...</span>}
      <button disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className="px-3 py-1 text-ink-500 hover:text-ink-900 disabled:opacity-30 transition-colors">&rarr;</button>
    </div>
  );
}
