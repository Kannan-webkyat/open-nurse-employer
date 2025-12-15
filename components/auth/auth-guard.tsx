'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { employerProfileApi } from '@/lib/api/profile'

const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'http://localhost:3001/signin'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  const redirectToLogin = () => {
    // Redirect to login page with return URL
    if (typeof window !== 'undefined') {
      const returnUrl = encodeURIComponent(window.location.href)
      window.location.href = `${LOGIN_URL}?redirect=${returnUrl}&role=employer`
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // First, check if there's a token in URL (from login redirect)
      // This handles the case where TokenHandler hasn't stored it yet
      const urlParams = new URLSearchParams(window.location.search)
      const urlToken = urlParams.get('token')
      
      if (urlToken) {
        // Store token from URL immediately
        localStorage.setItem('auth_token', urlToken)
        // Remove token from URL
        const url = new URL(window.location.href)
        url.searchParams.delete('token')
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
      }
      
      // Check if token exists in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (!token) {
        // No token, redirect to login
        setIsAuthenticated(false)
        setIsLoading(false)
        redirectToLogin()
        return
      }

      try {
        // Validate token by calling API
        const response = await employerProfileApi.getProfile()
        
        if (response.success) {
          setIsAuthenticated(true)
        } else {
          // Invalid token, clear it and redirect
          localStorage.removeItem('auth_token')
          setIsAuthenticated(false)
          redirectToLogin()
        }
      } catch (error) {
        // Error validating token, clear it and redirect
        localStorage.removeItem('auth_token')
        setIsAuthenticated(false)
        redirectToLogin()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  // Show loading state while checking authentication
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, don't render children (redirect is happening)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
          <p className="mt-4 text-neutral-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Authenticated, render children
  return <>{children}</>
}

