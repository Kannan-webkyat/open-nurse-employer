import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./button"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  description?: string
}

export function Modal({ isOpen, onClose, title, children, footer, description }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-50 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">{title}</h2>
            {description && (
              <p className="text-sm text-neutral-600 mt-2">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-neutral-200 p-6 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

