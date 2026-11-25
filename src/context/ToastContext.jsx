import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

// Escape hatch so non-React modules (api.js) can fire toasts
let _emit = null;
export const emitToast = (type, message) => _emit?.(type, message);

const CONFIGS = {
  success: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  error:   { icon: XCircle,     color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'   },
  info:    { icon: Info,        color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'   },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  }, []);

  useEffect(() => {
    _emit = add;
    return () => { _emit = null; };
  }, [add]);

  const remove = id => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{
      success: m => add('success', m),
      error:   m => add('error',   m),
      info:    m => add('info',    m),
    }}>
      {children}

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => {
            const cfg  = CONFIGS[t.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: 12,  scale: 0.95 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 ${cfg.border} min-w-[280px] max-w-[380px]`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon size={16} className={cfg.color} />
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex-1 leading-snug">
                  {t.message}
                </p>
                <button
                  onClick={() => remove(t.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors shrink-0 p-0.5"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
