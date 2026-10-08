import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';

type ToastTone = 'ok' | 'info' | 'warn';
interface Toast {
  id: number;
  title: string;
  tone: ToastTone;
}

const ToastContext = createContext<(title: string, tone?: ToastTone) => void>(
  () => undefined
);

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((title: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, tone }]);
    window.setTimeout(
      () => setToasts((t) => t.filter((x) => x.id !== id)),
      3200
    );
  }, []);

  const icon = {
    ok: <CheckIcon className="h-4 w-4" strokeWidth={3} />,
    info: <InfoIcon className="h-4 w-4" strokeWidth={2.5} />,
    warn: <TriangleAlertIcon className="h-4 w-4" strokeWidth={2.5} />
  };

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-[min(92vw,400px)] -translate-x-1/2 flex-col gap-3">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              role="status"
              className="pointer-events-auto flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-xl"
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full shadow-sm ${
                  t.tone === 'ok' ?
                  'bg-brand text-black' :
                  t.tone === 'warn' ?
                  'bg-red-500 text-white' :
                  'bg-white/10 text-white'
                }`}
              >
                {icon[t.tone]}
              </span>
              <p className="text-sm font-semibold text-white tracking-tight">{t.title}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);