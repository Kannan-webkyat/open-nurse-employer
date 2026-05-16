'use client'

import Image from 'next/image'
import QRCodeSVG from 'react-qr-code'
import {
  NURSING_QR_QUOTES,
  QR_BRAND_NAME,
  QR_HEADER_TAGLINE,
} from '@/lib/qr-print-card'

type QrPrintablePreviewProps = {
  qrUrl: string
  companyName?: string | null
  quoteIndex?: number
}

export function QrPrintablePreview({
  qrUrl,
  companyName,
  quoteIndex = 0,
}: QrPrintablePreviewProps) {
  const quote = NURSING_QR_QUOTES[quoteIndex % NURSING_QR_QUOTES.length]
  const subtitle = companyName?.trim() || QR_HEADER_TAGLINE

  return (
    <div className="w-full select-none">
      <div className="rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Image
              src="/logo.svg"
              alt=""
              width={20}
              height={20}
              className="h-4 w-auto brightness-0 invert"
            />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[13px] font-semibold text-white leading-tight tracking-tight">
              {QR_BRAND_NAME}
            </p>
            <p className="text-[10px] text-white/85 truncate leading-tight">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col items-center bg-white px-4 pt-3 pb-2">
          <div
            id="employer-qr-container"
            className="relative flex items-center justify-center"
          >
            <QRCodeSVG
              value={qrUrl}
              size={204}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="H"
            />
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                <Image src="/logo.svg" alt="" width={22} height={22} className="h-5 w-auto" />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[10px] font-medium text-slate-400 tracking-wide">
            Scan to open jobs
          </p>
        </div>

        <div className="border-t border-slate-100 bg-slate-50/50 px-3.5 py-2.5 text-center">
          <p className="text-[10px] leading-snug text-slate-500 italic line-clamp-2">
            &ldquo;{quote.text}&rdquo;
            <span className="not-italic text-slate-400"> — {quote.author}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
