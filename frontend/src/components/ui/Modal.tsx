import { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-raised rounded-lg shadow-overlay max-w-lg w-full mx-4 max-h-[90vh] overflow-auto border border-ink-200 animate-signal-in">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-ink-900">
          {title && <h3 className="text-lg font-heading font-semibold">{title}</h3>}
          <button onClick={onClose} className="p-1 hover:bg-ink-100 rounded transition-colors">
            <X className="w-4 h-4 text-ink-500" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-3 border-t border-ink-200 bg-surface-sunken flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
