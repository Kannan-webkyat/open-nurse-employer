"use client"

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import createEcho from '@/lib/echo'

interface EchoContextType {
  echo: any | null
  isConnected: boolean
}

const EchoContext = createContext<EchoContextType>({ echo: null, isConnected: false })

export function EchoProvider({ children }: { children: ReactNode }) {
  const [echo, setEcho] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const echoRef = useRef<any>(null)

  useEffect(() => {
    const connect = (token: string) => {
      if (echoRef.current) {
        echoRef.current.disconnect()
      }

      const echoInstance = createEcho(token)
      echoRef.current = echoInstance
      setEcho(echoInstance)
      setIsConnected(true)
    }

    const disconnect = () => {
      if (echoRef.current) {
        echoRef.current.disconnect()
        echoRef.current = null
      }

      setEcho(null)
      setIsConnected(false)
    }

    const token = localStorage.getItem('auth_token')
    if (token) {
      connect(token)
    } else {
      disconnect()
    }

    const handleAuthChange = () => {
      const newToken = localStorage.getItem('auth_token')
      if (newToken) {
        connect(newToken)
      } else {
        disconnect()
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        handleAuthChange()
      }
    }

    window.addEventListener('authChanged', handleAuthChange)
    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('authChanged', handleAuthChange)
      window.removeEventListener('storage', handleStorageChange)
      disconnect()
    }
  }, [])

  return (
    <EchoContext.Provider value={{ echo, isConnected }}>
      {children}
    </EchoContext.Provider>
  )
}

export function useEcho() {
  const context = useContext(EchoContext)
  if (context === undefined) {
    throw new Error('useEcho must be used within an EchoProvider')
  }
  return context
}
