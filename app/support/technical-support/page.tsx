"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, MonitorX, WifiOff, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function TechnicalSupportPage() {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/support"
                        className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Help Center
                    </Link>
                    <h1 className="text-3xl font-bold text-neutral-900">Technical Support</h1>
                    <p className="text-lg text-neutral-600">Solutions for common technical issues and platform errors.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <MonitorX className="w-6 h-6 text-red-500" />
                            Common Issues & Fixes
                        </h2>
                        <div className="space-y-6">

                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <h3 className="font-bold text-neutral-900 mb-2">Login Issues</h3>
                                <p className="text-sm text-neutral-600 mb-2">
                                    If you're unable to log in, try the following:
                                </p>
                                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                                    <li>Check your internet connection.</li>
                                    <li>Ensure caps lock is off.</li>
                                    <li>Clear your browser cache and cookies.</li>
                                    <li>Try resetting your password.</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <h3 className="font-bold text-neutral-900 mb-2">Dashboard Not Loading</h3>
                                <p className="text-sm text-neutral-600 mb-2">
                                    Seeing a blank screen or spinning loader?
                                </p>
                                <ul className="list-disc list-inside text-sm text-neutral-600 space-y-1">
                                    <li>Refresh the page (Cmd/Ctrl + R).</li>
                                    <li>Disable ad-blockers or extensions temporarily.</li>
                                    <li>Try accessing the site from an Incognito/Private window.</li>
                                </ul>
                            </div>

                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <WifiOff className="w-6 h-6 text-neutral-600" />
                            Browser Compatibility
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Open Nurses is optimized for modern web browsers. For the best experience, we recommend using the latest versions of:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center text-sm font-medium">
                                <div className="p-3 bg-neutral-50 rounded-lg">Google Chrome</div>
                                <div className="p-3 bg-neutral-50 rounded-lg">Mozilla Firefox</div>
                                <div className="p-3 bg-neutral-50 rounded-lg">Safari</div>
                                <div className="p-3 bg-neutral-50 rounded-lg">Microsoft Edge</div>
                            </div>
                            <p className="mt-4 text-sm bg-amber-50 p-3 rounded text-amber-800 border border-amber-100">
                                <strong>Note:</strong> We do not support Internet Explorer. Please upgrade to Microsoft Edge or another modern browser.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <HelpCircle className="w-6 h-6 text-sky-600" />
                            Still need help?
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                If the solutions above didn't resolve your issue, please contact our support team.
                                Include the following details to help us assist you faster:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>Your browser and operating system version.</li>
                                <li>Screenshots of the error message.</li>
                                <li>Steps to reproduce the issue.</li>
                            </ul>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
