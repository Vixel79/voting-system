import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangleIcon, XIcon } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onClose
}: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open &&
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}>
        
          <div
          className="absolute inset-0 bg-black/80"
          onClick={onClose}
          aria-hidden />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-lg border border-line-strong bg-ink-900 shadow-panel">
          
            <div className="hatch h-1.5 w-full" aria-hidden />
            <div className="flex items-start gap-4 px-6 pb-2 pt-5">
              <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-sm border ${
              destructive ?
              'border-danger/40 bg-danger/10 text-danger' :
              'border-brand/40 bg-brand/10 text-brand'}`
              }>
              
                <AlertTriangleIcon className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-extrabold text-fg">{title}</h3>
                <p className="mt-1 text-sm font-medium leading-relaxed text-fg-muted">
                  {body}
                </p>
              </div>
              <button
              onClick={onClose}
              aria-label="Close"
              className="text-fg-dim transition-colors duration-150 hover:text-fg">
              
                <XIcon className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="mt-4 flex gap-3 border-t border-line bg-ink-850 px-6 py-4">
              <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
                {cancelLabel}
              </Button>
              <Button
              variant={destructive ? 'danger' : 'primary'}
              size="md"
              className="flex-1"
              onClick={() => {
                onConfirm();
                onClose();
              }}>
              
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}