"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function GettingStartedPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900">Getting Started</h1>
                    <p className="text-lg text-neutral-600">Everything you need to know to get up and running with Open Nurses.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 text-sm font-bold">1</span>
                            Posting Your First Job
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                Posting a job is the first step to finding great talent. Follow these simple steps to create your first listing:
                            </p>
                            <ol className="list-decimal list-inside space-y-3 font-medium text-neutral-800 ml-4">
                                <li>Navigate to the <strong>Jobs</strong> tab in the main sidebar.</li>
                                <li>Click the <strong>"Post a Job"</strong> button in the top right corner.</li>
                                <li>Fill in the job details, including:
                                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-neutral-600 font-normal">
                                        <li>Job Title & Description</li>
                                        <li>Employment Type (Full-time, Part-time, etc.)</li>
                                        <li>Salary Range</li>
                                        <li>Required Experience</li>
                                    </ul>
                                </li>
                                <li>Review your listing preview to ensure everything looks correct.</li>
                                <li>Click <strong>Publish</strong> to make your job live immediately.</li>
                            </ol>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 text-sm font-bold">2</span>
                            Updating Company Profile
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                A complete company profile helps attract better candidates by showcasing your brand and culture.
                            </p>
                            <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-100">
                                <h4 className="font-semibold text-neutral-900 mb-2">Key Profile Elements to Update:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span><strong>Company Logo:</strong> Upload a high-quality logo for better visibility.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span><strong>About Us:</strong> Write a compelling description of your organization.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        <span><strong>Location & Website:</strong> Ensure your contact details are accurate.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 text-sky-600 text-sm font-bold">3</span>
                            Understanding the Dashboard
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                Your dashboard is the command center for your recruiting efforts. Here's a quick tour:
                            </p>
                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="p-4 bg-sky-50 rounded-xl">
                                    <h4 className="font-semibold text-sky-900 mb-2">Overview Stats</h4>
                                    <p className="text-sm">Quickly see how many active jobs you have, total applications received, and shortlisted candidates.</p>
                                </div>
                                <div className="p-4 bg-sky-50 rounded-xl">
                                    <h4 className="font-semibold text-sky-900 mb-2">Recent Activity</h4>
                                    <p className="text-sm">Track the latest applications and messages so you never miss an update.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
