"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertCircle, X } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};

const toastStyles = {
  success: "bg-green-500/10 border-green-500/20 text-green-700",
  error: "bg-red-500/10 border-red-500/20 text-red-700",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-700",
  warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-700",
};

export function ToastComponent({ toast, onClose }: ToastProps) {
  const Icon = toastIcons[toast.type];
  const style = toastStyles[toast.type];
  const duration = toast.duration || 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm
        shadow-lg min-w-[280px] max-w-[400px] ${style}
      `}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="text-sm font-light flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-current opacity-20 rounded-b-lg origin-left"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
      />
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
