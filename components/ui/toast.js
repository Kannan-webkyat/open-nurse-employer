"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = {
      id,
      ...toast,
      duration: toast.duration || 5000,
    }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }, [removeToast])

  const success = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'success' })
  }, [addToast])

  const error = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'error' })
  }, [addToast])

  const info = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'info' })
  }, [addToast])

  const warning = useCallback((message, options = {}) => {
    return addToast({ ...options, message, type: 'warning' })
  }, [addToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, info, warning }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 w-full max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ toast, onClose }) {
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
      border: 'border-green-200',
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    error: {
      bg: 'bg-white',
      border: 'border-red-200',
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      text: 'text-neutral-900',
      message: 'text-neutral-600',
    },
  }

  const style = styles[toast.type] || styles.info
  const Icon = icons[toast.type] || Info

  return (
    <div
      className={`
        ${style.bg} ${style.border} border rounded-lg shadow-lg p-4
        flex items-start gap-3 min-w-[320px] max-w-sm
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className={`${style.iconBg} p-2 rounded-lg flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={`text-sm font-semibold ${style.text} mb-1`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-sm ${style.message}`}>
          {toast.message}
        </p>
      </div>

      <button
        onClick={handleClose}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

