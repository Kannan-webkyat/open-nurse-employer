"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/layout'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSubscriptionFeatures } from '@/hooks/useSubscriptionFeatures'
import { AlertCircle, Sparkles, Lock } from 'lucide-react'
import Link from 'next/link'

export default function JobPostingExample() {
    const router = useRouter()
    const {
        canPostJob,
        remainingSlots,
        activeJobs,
        jobSlots,
        hasAdvancedSearch,
        hasFeaturedListings,
        hasDirectMessaging,
        hasAnalytics,
        planName,
        loading
    } = useSubscriptionFeatures()

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        featured: false
    })

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header with Plan Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Post a New Job</h1>
                        <p className="text-sm text-neutral-600 mt-1">
                            Current Plan: <span className="font-semibold">{planName}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-neutral-600">Active Jobs</p>
                        <p className="text-2xl font-bold text-neutral-900">
                            {activeJobs} / {jobSlots === null ? '∞' : jobSlots}
                        </p>
                        {remainingSlots !== null && (
                            <p className="text-xs text-neutral-500">
                                {remainingSlots} slots remaining
                            </p>
                        )}
                    </div>
                </div>

                {/* Limit Warning */}
                {!canPostJob && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            You've reached your job posting limit ({jobSlots} jobs).
                            Please <Link href="/plans" className="font-semibold underline">upgrade your plan</Link> to post more jobs,
                            or close an existing job to free up a slot.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Approaching Limit Warning */}
                {canPostJob && remainingSlots !== null && remainingSlots <= 1 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            You have {remainingSlots} job slot{remainingSlots !== 1 ? 's' : ''} remaining.
                            Consider <Link href="/plans" className="font-semibold underline">upgrading</Link> for more capacity.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Job Form */}
                <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Job Title
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            placeholder="e.g., Registered Nurse - ICU"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            disabled={!canPostJob}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Job Description
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                            rows={6}
                            placeholder="Describe the role, requirements, and benefits..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            disabled={!canPostJob}
                        />
                    </div>

                    {/* Featured Listing Option */}
                    <div className="border-t border-neutral-200 pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles className={`h-5 w-5 ${hasFeaturedListings ? 'text-sky-600' : 'text-neutral-400'}`} />
                                <div>
                                    <p className="font-medium text-neutral-900">Featured Listing</p>
                                    <p className="text-sm text-neutral-600">
                                        Get 3x more visibility in search results
                                    </p>
                                </div>
                            </div>
                            {hasFeaturedListings ? (
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 text-sky-600 rounded focus:ring-sky-500"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                    disabled={!canPostJob}
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-neutral-400" />
                                    <Link href="/plans" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                        Upgrade to unlock
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center gap-4 pt-4">
                        <Button
                            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                            disabled={!canPostJob}
                        >
                            {canPostJob ? 'Post Job' : 'Upgrade to Post Jobs'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* Feature Access Summary */}
                <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4">Your Plan Features</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FeatureItem
                            label="Direct Messaging"
                            enabled={hasDirectMessaging}
                        />
                        <FeatureItem
                            label="Advanced Search Filters"
                            enabled={hasAdvancedSearch}
                        />
                        <FeatureItem
                            label="Featured Job Listings"
                            enabled={hasFeaturedListings}
                        />
                        <FeatureItem
                            label="Analytics Dashboard"
                            enabled={hasAnalytics}
                        />
                    </div>
                    {(!hasDirectMessaging || !hasAdvancedSearch || !hasFeaturedListings || !hasAnalytics) && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                            <Link href="/plans" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                Upgrade your plan to unlock all features →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

function FeatureItem({ label, enabled }) {
    return (
        <div className="flex items-center gap-2">
            {enabled ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            ) : (
                <Lock className="w-5 h-5 text-neutral-400" />
            )}
            <span className={`text-sm ${enabled ? 'text-neutral-900' : 'text-neutral-500'}`}>
                {label}
            </span>
        </div>
    )
}
