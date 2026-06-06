/** Branding for downloadable / printable employer QR cards */

export const QR_BRAND_NAME = 'Open Nurses'

export const QR_HEADER_TAGLINE = 'Scan to view our job openings'

const CARD_WIDTH = 900
const CARD_HEIGHT = 1000

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawCardFrame(ctx: CanvasRenderingContext2D) {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT)
  bgGrad.addColorStop(0, '#f0f9ff')
  bgGrad.addColorStop(1, '#f8fafc')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  const cardX = 40
  const cardY = 40
  const cardW = CARD_WIDTH - 80
  const cardH = CARD_HEIGHT - 80

  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 12
  roundRect(ctx, cardX, cardY, cardW, cardH, 36)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  companyName?: string | null,
) {
  const cardX = 40
  const y = 40
  const w = CARD_WIDTH - 80
  const h = 108

  roundRect(ctx, cardX, y, w, h, 36)
  ctx.save()
  ctx.clip()
  const grad = ctx.createLinearGradient(cardX, y, cardX + w, y)
  grad.addColorStop(0, '#0ea5e9')
  grad.addColorStop(1, '#6366f1')
  ctx.fillStyle = grad
  ctx.fillRect(cardX, y, w, h)

  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.font = 'bold 36px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.fillText(QR_BRAND_NAME, cardX + 28, y + 48)

  const subtitle = companyName?.trim() || QR_HEADER_TAGLINE
  ctx.font = '500 18px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText(subtitle, cardX + 28, y + 82)

  ctx.restore()
  ctx.textAlign = 'left'
}

function drawQrOnCard(
  ctx: CanvasRenderingContext2D,
  qrImage: HTMLImageElement,
) {
  const headerBottom = 40 + 108
  const cardBottom = CARD_HEIGHT - 40 - 40
  const zoneTop = headerBottom + 24
  const zoneBottom = cardBottom - 48
  const zoneHeight = zoneBottom - zoneTop

  const qrSize = Math.min(620, CARD_WIDTH - 100, zoneHeight - 40)
  const qrX = (CARD_WIDTH - qrSize) / 2
  const qrY = zoneTop + (zoneHeight - qrSize) / 2

  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

  const badge = Math.round(qrSize * 0.14)
  const badgeX = CARD_WIDTH / 2 - badge / 2
  const badgeY = qrY + qrSize / 2 - badge / 2
  roundRect(ctx, badgeX, badgeY, badge, badge, 8)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.fillStyle = '#0ea5e9'
  ctx.font = `bold ${Math.round(badge * 0.35)}px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('ON', CARD_WIDTH / 2, badgeY + badge / 2)
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = '#94a3b8'
  ctx.font = '500 16px system-ui, -apple-system, Segoe UI, sans-serif'
  ctx.fillText('Scan to open jobs', CARD_WIDTH / 2, qrY + qrSize + 24)
  ctx.textAlign = 'left'
}

export type DownloadPrintableQrOptions = {
  svgElement: SVGElement
  scanUrl: string
  companyName?: string | null
  fileName?: string
}

/** Renders a printable card (header + QR) and triggers PNG download. */
export function downloadPrintableQrCard({
  svgElement,
  scanUrl,
  companyName,
  fileName = 'open-nurses-job-qr.png',
}: DownloadPrintableQrOptions): void {
  const svgData = new XMLSerializer().serializeToString(svgElement)
  const qrImage = new Image()
  qrImage.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = CARD_WIDTH
    canvas.height = CARD_HEIGHT
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    drawCardFrame(ctx)
    drawHeader(ctx, companyName)
    drawQrOnCard(ctx, qrImage)

    const link = document.createElement('a')
    link.download = fileName
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  qrImage.src =
    'data:image/svg+xml;base64,' +
    btoa(unescape(encodeURIComponent(svgData)))
}
