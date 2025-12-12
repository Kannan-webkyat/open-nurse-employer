import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Open Nurses - Dashboard',
  description: 'Open Nurses Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,600,700,800,900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-satoshi">{children}</body>
    </html>
  )
}

