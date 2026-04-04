import Button from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    <div className="flex items-center gap-1 justify-center mt-6">
      <Button variant="ghost" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {start > 1 && <span className="px-2 text-gray-400">...</span>}
      {pages.map((p) => (
        <Button key={p} variant={p === currentPage ? 'primary' : 'ghost'} size="sm" onClick={() => onPageChange(p)}>
          {p}
        </Button>
      ))}
      {end < totalPages && <span className="px-2 text-gray-400">...</span>}
      <Button variant="ghost" size="sm" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
