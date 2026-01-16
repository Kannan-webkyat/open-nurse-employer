"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { employerProfileApi } from '@/lib/api/profile'
import { useRouter, usePathname } from 'next/navigation'

interface User {
    id: number
    name: string
    email: string
    role: string
    employer?: {
        id: number
        company_name: string
        hiring_person_name: string
        company_logo: string | null
        [key: string]: any
    }
}

interface UserContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    refreshUser: () => Promise<void>
    logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem('auth_token')
            if (!token) {
                setUser(null)
                setIsAuthenticated(false)
                setIsLoading(false)
                return
            }

            const response = await employerProfileApi.getProfile()

            if (response.success && response.data) {
                setUser(response.data as User)
                setIsAuthenticated(true)
            } else {
                // Invalid token or session expired
                setUser(null)
                setIsAuthenticated(false)
                localStorage.removeItem('auth_token')
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
            setUser(null)
            setIsAuthenticated(false)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('auth_token')
        setUser(null)
        setIsAuthenticated(false)
        const loginUrl = process.env.NEXT_PUBLIC_LOGIN_URL || '/login'
        window.location.href = `${loginUrl}`
    }, [])

    // Initial fetch
    useEffect(() => {
        refreshUser()
    }, [refreshUser])

    // Listen for focus to re-validate session
    useEffect(() => {
        const handleFocus = () => {
            // detailed refresh? maybe not necessary for every focus to do full API call
            // keeping it simple for now, relying on refreshUser
            refreshUser()
        }
        window.addEventListener('focus', handleFocus)
        return () => window.removeEventListener('focus', handleFocus)
    }, [refreshUser])

    // Watch for token changes (login/logout from other tabs/components)
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'auth_token') {
                refreshUser()
            }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [refreshUser])

    return (
        <UserContext.Provider value={{ user, isLoading, isAuthenticated, refreshUser, logout }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
