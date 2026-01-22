"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import createEcho from '@/lib/echo'

interface EchoContextType {
  echo: any | null
  isConnected: boolean
}

const EchoContext = createContext<EchoContextType>({ echo: null, isConnected: false })

export function EchoProvider({ children }: { children: ReactNode }) {
  const [echo, setEcho] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    
    if (token && !echo) {
      console.log('EchoProvider: Creating single Echo instance')
      const echoInstance = createEcho(token)
      setEcho(echoInstance)
      setIsConnected(true)
    } else if (!token && echo) {
      console.log('EchoProvider: Disconnecting Echo instance')
      echo.disconnect()
      setEcho(null)
      setIsConnected(false)
    }

    // Listen for auth changes
    const handleAuthChange = () => {
      const newToken = localStorage.getItem('auth_token')
      if (newToken && !echo) {
        console.log('EchoProvider: Reconnecting Echo instance')
        const echoInstance = createEcho(newToken)
        setEcho(echoInstance)
        setIsConnected(true)
      } else if (!newToken && echo) {
        console.log('EchoProvider: Disconnecting Echo instance')
        echo.disconnect()
        setEcho(null)
        setIsConnected(false)
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
      if (echo) {
        console.log('EchoProvider: Cleanup - disconnecting Echo')
        echo.disconnect()
      }
    }
  }, [echo])

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
