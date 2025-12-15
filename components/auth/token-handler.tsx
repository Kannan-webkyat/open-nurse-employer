'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export function TokenHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', token)
      
      // Remove token from URL for security
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      router.replace(url.pathname + (url.search ? url.search : ''))
    }
  }, [searchParams, router])

  return null
}

