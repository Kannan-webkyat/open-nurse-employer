"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, UserCheck, MessageSquare, XCircle } from "lucide-react"
import Link from "next/link"

export default function CandidatesSupportPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900">Candidates</h1>
                    <p className="text-lg text-neutral-600">Learn how to review, shortlist, and communicate with applicants.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6">Processing Applications</h2>
                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Viewing */}
                            <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-100 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <UserCheck className="w-6 h-6 text-neutral-600" />
                                </div>
                                <h3 className="font-bold text-neutral-900 mb-2">Reviewing Profiles</h3>
                                <p className="text-sm text-neutral-600">
                                    Click on a candidate's name to view their full profile, resume, and experience details.
                                </p>
                            </div>

                            {/* Shortlisting */}
                            <div className="p-6 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <UserCheck className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-bold text-green-900 mb-2">Shortlisting</h3>
                                <p className="text-sm text-green-800">
                                    Liked a candidate? Click the <strong>Shortlist</strong> button to move them to the next stage.
                                </p>
                            </div>

                            {/* Rejecting */}
                            <div className="p-6 bg-red-50 rounded-xl border border-red-100 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="font-bold text-red-900 mb-2">Rejecting</h3>
                                <p className="text-sm text-red-800">
                                    If a candidate isn't a fit, click <strong>Reject</strong>. This archives the application.
                                </p>
                            </div>

                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-sky-600" />
                            Messaging Candidates
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                Direct communication is key to hiring. You can message candidates directly through the platform.
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Go to the Candidate's profile view.</li>
                                <li>Click the <strong>Message</strong> button.</li>
                                <li>A chat window will open where you can discuss interview availability or ask follow-up questions.</li>
                                <li>All conversation history is saved for future reference.</li>
                            </ul>
                            <div className="mt-4 p-4 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-100">
                                <strong>Tip:</strong> Keep communications professional and timely to ensure a good candidate experience.
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
