import React from 'react';
import type { Toast } from '../hooks/useDataWorker';

interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: number) => void;
}

const VARIANT_CONFIG = {
    success: {
        bg: 'bg-emerald-950/90',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-400',
        bar: 'bg-emerald-500',
        path: 'M5 13l4 4L19 7',
    },
    error: {
        bg: 'bg-red-950/90',
        border: 'border-red-500/30',
        icon: 'text-red-400',
        bar: 'bg-red-500',
        path: 'M6 18L18 6M6 6l12 12',
    },
    warning: {
        bg: 'bg-amber-950/90',
        border: 'border-amber-500/30',
        icon: 'text-amber-400',
        bar: 'bg-amber-500',
        path: 'M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
    },
} as const;

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div
            aria-live="polite"
            aria-label="Notifications"
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        >
            {toasts.map((toast) => {
                const cfg = VARIANT_CONFIG[toast.variant];
                return (
                    <div
                        key={toast.id}
                        role="alert"
                        className={`pointer-events-auto relative overflow-hidden flex items-start
                                    gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl
                                    animate-slide-up ${cfg.bg} ${cfg.border}`}
                    >
                        <svg
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.icon}`}
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d={cfg.path} />
                        </svg>

                        <p className="text-xs text-slate-200 leading-relaxed flex-1">{toast.message}</p>

                        <button
                            type="button"
                            onClick={() => onDismiss(toast.id)}
                            aria-label="Dismiss notification"
                            className="text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div
                            aria-hidden="true"
                            className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} opacity-60`}
                            style={{ animation: 'shrink 3s linear forwards' }}
                        />
                    </div>
                );
            })}
        </div>
    );
};
