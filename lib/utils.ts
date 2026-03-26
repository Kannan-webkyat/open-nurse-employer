export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html
  }

  // Lazy-load to avoid SSR import issues.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DOMPurify = require('dompurify')(window)

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  })
}
