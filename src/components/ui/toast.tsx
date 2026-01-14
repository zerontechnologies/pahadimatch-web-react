import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { removeToast, selectToasts, type ToastType } from '@/store/slices/uiSlice';

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-error" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
  info: <Info className="h-5 w-5 text-primary" />,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-success/20 bg-success/5',
  error: 'border-error/20 bg-error/5',
  warning: 'border-warning/20 bg-warning/5',
  info: 'border-primary/20 bg-primary/5',
};

export function ToastContainer() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    toasts.forEach((toast) => {
      const duration = toast.duration || 5000;
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, duration);
      
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto rounded-xl border p-4 shadow-lg backdrop-blur-sm bg-surface',
              toastStyles[toast.type]
            )}
          >
            <div className="flex items-start gap-3">
              {toastIcons[toast.type]}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text">{toast.title}</p>
                {toast.message && (
                  <p className="mt-1 text-sm text-text-secondary">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => dispatch(removeToast(toast.id))}
                className="text-text-muted hover:text-text transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

