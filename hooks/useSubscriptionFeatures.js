"use client"

import { useState, useEffect } from 'react'
import { subscriptionApi } from '@/lib/api'

export function useSubscriptionFeatures() {
    const [features, setFeatures] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchFeatures = async () => {
        try {
            setLoading(true)
            const response = await subscriptionApi.getFeatures()
            if (response.success && response.data) {
                setFeatures(response.data)
            }
        } catch (err) {
            console.error('Failed to fetch subscription features:', err)
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeatures()
    }, [])

    return {
        features,
        loading,
        error,
        refetch: fetchFeatures,

        // Convenience getters
        canPostJob: features?.can_post_job ?? false,
        remainingSlots: features?.remaining_slots ?? 0,
        activeJobs: features?.active_jobs ?? 0,
        jobSlots: features?.job_slots ?? 0,
        hasAdvancedSearch: features?.has_advanced_search ?? false,
        hasFeaturedListings: features?.has_featured_listings ?? false,
        hasDirectMessaging: features?.has_direct_messaging ?? false,
        hasAnalytics: features?.has_analytics ?? false,
        planName: features?.plan_name ?? 'No Plan',
    }
}
