'use client'

import { X, Copy, Download, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QrPrintablePreview } from '@/components/jobs/qr-printable-preview'

type QrShareModalProps = {
  open: boolean
  onClose: () => void
  qrUrl: string
  companyName?: string | null
  qrLinkCopied: boolean
  onDownload: () => void
  onCopyLink: () => void
}

export function QrShareModal({
  open,
  onClose,
  qrUrl,
  companyName,
  qrLinkCopied,
  onDownload,
  onCopyLink,
}: QrShareModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[340px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl ring-1 ring-slate-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact title bar */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Share jobs</p>
            <p className="text-[11px] text-slate-500">Print or share your listing QR</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 pt-4 pb-4">
          {qrUrl ? (
            <div className="space-y-4">
              <QrPrintablePreview qrUrl={qrUrl} companyName={companyName} />

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-100">
                <span
                  className="flex-1 truncate text-[11px] font-mono text-slate-600"
                  title={qrUrl}
                >
                  {qrUrl}
                </span>
                <a
                  href={qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-slate-400 hover:text-sky-600 transition-colors"
                  title="Open link"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={onDownload}
                  className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCopyLink}
                  className={`h-10 rounded-xl text-xs font-semibold ${
                    qrLinkCopied
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  {qrLinkCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy link
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <div className="h-8 w-8 border-2 border-slate-200 border-t-sky-500 rounded-full animate-spin mb-2" />
              <p className="text-xs">Preparing QR…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
