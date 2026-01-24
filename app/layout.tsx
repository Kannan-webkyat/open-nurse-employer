import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/toast'
import { NotificationProvider } from '@/components/providers/notification-provider'
import { MessageProvider } from '@/components/providers/message-provider'
import { UserProvider } from '@/components/providers/user-provider'
import { EchoProvider } from '@/components/providers/echo-provider'

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
      <body className="font-satoshi">
        <ToastProvider>
          <UserProvider>
            <EchoProvider>
              <NotificationProvider>
                <MessageProvider>
                  {children}
                </MessageProvider>
              </NotificationProvider>
            </EchoProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
