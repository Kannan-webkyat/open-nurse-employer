'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/auth-guard'

function HomeRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboard')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-600">Redirecting...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeRedirect />
    </AuthGuard>
  )
}

