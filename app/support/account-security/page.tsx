"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, ShieldCheck, Lock, UserCog } from "lucide-react"
import Link from "next/link"

export default function AccountSecuritySupportPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900">Account & Security</h1>
                    <p className="text-lg text-neutral-600">Keep your account secure and manage your team settings.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-neutral-600" />
                            Password Management
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600 space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-900">Changing Your Password</h3>
                            <p>
                                Regularly updating your password is good practice. To change it:
                            </p>
                            <ol className="list-decimal list-inside space-y-1 ml-2">
                                <li>Go to <strong>Settings</strong> {'>'} <strong>Security</strong>.</li>
                                <li>Enter your current password.</li>
                                <li>Enter your new password (must be at least 8 characters).</li>
                                <li>Confirm the new password and save.</li>
                            </ol>

                            <h3 className="text-lg font-semibold text-neutral-900 mt-6">Forgot Password?</h3>
                            <p>
                                If you cannot sign in, click the "Forgot Password?" link on the login page.
                                We will email you a secure link to reset your credentials.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                            Two-Factor Authentication (2FA)
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Two-factor authentication adds an extra layer of security to your account.
                                When enabled, you'll be asked for a verification code sent to your email or phone when logging in from a new device.
                            </p>
                            <div className="mt-4 p-4 bg-green-50 rounded-lg text-sm text-green-800 border border-green-100">
                                <strong>Status:</strong> You can check if 2FA is active in your Security settings. We highly recommend enabling this for all employer accounts.
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <UserCog className="w-6 h-6 text-sky-600" />
                            Account Settings
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Under the <strong>General Settings</strong> tab, you can update:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li><strong>Display Name:</strong> How your name appears to candidates.</li>
                                <li><strong>Email Preferences:</strong> Manage which notifications you receive.</li>
                                <li><strong>Time Zone:</strong> Ensure interview times are displayed correctly.</li>
                            </ul>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
