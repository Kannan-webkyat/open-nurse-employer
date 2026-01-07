"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"

export default function JobManagementSupportPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900">Job Management</h1>
                    <p className="text-lg text-neutral-600">How to manage your job listings and track applications effectively.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            Editing & Deleting Job Postings
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-6">
                            <p>
                                Need to make changes to a job or remove a filled position? Here's how to do it:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="border border-neutral-200 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                            <Edit className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">Editing a Job</h3>
                                    </div>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700">
                                        <li>Go to your <strong>Jobs</strong> dashboard.</li>
                                        <li>Locate the job card you wish to update.</li>
                                        <li>Click the <strong>Edit/Pencil</strong> icon.</li>
                                        <li>Update the fields as needed (e.g., salary, requirements).</li>
                                        <li>Click <strong>Save Changes</strong> to update immediately.</li>
                                    </ol>
                                </div>

                                <div className="border border-neutral-200 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                                            <Trash2 className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-neutral-900">Deleting a Job</h3>
                                    </div>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-neutral-700">
                                        <li>Go to your <strong>Jobs</strong> dashboard.</li>
                                        <li>Click the <strong>Delete/Trash</strong> icon on the job card.</li>
                                        <li>A confirmation popup will appear.</li>
                                        <li>Confirm the action. <strong>Note: This cannot be undone.</strong></li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            Application Tracking
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <p>
                                Keeping track of who has applied to which job is crucial for an organized hiring process.
                            </p>
                            <div className="flex items-start gap-4 bg-sky-50 p-6 rounded-xl border border-sky-100">
                                <Eye className="w-6 h-6 text-sky-600 shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-bold text-sky-900 mb-2">Viewing Applications</h4>
                                    <p className="text-sm text-sky-800">
                                        Click on any Job Card to view a detailed breakdown of all applicants for that specific role.
                                        You'll see a list of candidates along with their application status (New, Shortlisted, Rejected, etc.).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
