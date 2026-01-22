'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { employerProfileApi } from '@/lib/api/profile'
import { useUser } from '@/components/providers/user-provider'

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || '/login'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, refreshUser } = useUser()
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const handleAuth = async () => {
      // First, check if there's a token in URL (from login redirect)
      const urlParams = new URLSearchParams(window.location.search)
      const urlToken = urlParams.get('token')

      if (urlToken) {
        // Store token from URL immediately
        localStorage.setItem('auth_token', urlToken)
        // Remove token from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))

        // Refresh user context immediately
        await refreshUser()
      }
    }

    handleAuth()
  }, [])

  useEffect(() => {
    // Wait for loading to finish before checking authentication
    if (!isLoading && !isAuthenticated) {
      // Don't redirect if already on login page or registration page
      if (pathname === '/login' || pathname === '/register') {
        return
      }

      setIsRedirecting(true)
      if (typeof window !== 'undefined') {
        const returnUrl = encodeURIComponent(window.location.href)
        window.location.href = `${LOGIN_URL}?redirect=${returnUrl}&role=employer`
      }
    }
  }, [isLoading, isAuthenticated, pathname])

  // Show loading state while checking authentication
  if (isLoading || isRedirecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">{isRedirecting ? 'Redirecting to login...' : 'Checking authentication...'}</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (redirect is happening)
  if (!isAuthenticated) {
    return null // Or loading spinner again if you prefer
  }

  // Authenticated, render children
  return <>{children}</>
}

