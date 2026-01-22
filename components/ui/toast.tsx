"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  duration?: number
  action?: ReactNode | ((close: () => void) => ReactNode)
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  success: (message: string, options?: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) }) => string
  error: (message: string, options?: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) }) => string
  info: (message: string, options?: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) }) => string
  warning: (message: string, options?: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) }) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration || 5000
    const newToast: Toast = {
      id,
      ...toast,
      duration,
    }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [removeToast])

  const success = useCallback((message: string, options: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) } = {}) => {
    return addToast({ ...options, message, type: 'success' })
  }, [addToast])

  const error = useCallback((message: string, options: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) } = {}) => {
    return addToast({ ...options, message, type: 'error' })
  }, [addToast])

  const info = useCallback((message: string, options: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) } = {}) => {
    return addToast({ ...options, message, type: 'info' })
  }, [addToast])

  const warning = useCallback((message: string, options: { title?: string; duration?: number; action?: ReactNode | ((close: () => void) => ReactNode) } = {}) => {
    return addToast({ ...options, message, type: 'warning' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const styles = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    error: {
      bg: 'bg-white',
      border: 'border-red-100',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    info: {
      bg: 'bg-white',
      border: 'border-sky-100',
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-100',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
  }

  const style = styles[toast.type] || styles.info
  const Icon = icons[toast.type] || Info

  return (
    <div
      className={`
        ${style.bg} ${style.border} border rounded-xl shadow-2xl p-4
        flex items-start gap-4 min-w-[340px] max-w-md
        transition-all duration-500 ease-out transform
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        backdrop-blur-sm bg-opacity-95
      `}
    >
      <div className={`${style.iconBg} p-2.5 rounded-full flex-shrink-0 mt-0.5 ring-1 ring-inset ring-black/5`}>
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 py-0.5">
        {toast.title && (
          <h4 className={`text-sm font-bold ${style.text} mb-1 leading-none`}>
            {toast.title}
          </h4>
        )}
        <div className={`text-sm ${style.message} leading-relaxed`}>
          {toast.message}
        </div>

        {toast.action && (
          <div className="mt-3">
            {typeof toast.action === 'function' ? toast.action(handleClose) : toast.action}
          </div>
        )}
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-md hover:bg-neutral-100"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
