"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { ArrowLeft, CreditCard, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function BillingSupportPage() {
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
                    <h1 className="text-3xl font-bold text-neutral-900">Billing & Subscriptions</h1>
                    <p className="text-lg text-neutral-600">Manage your payments, view invoices, and understand our refund policies.</p>
                </div>

                {/* Content */}
                <div className="space-y-12">

                    {/* Section 1 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="p-2 bg-sky-100 rounded-lg text-sky-600">
                                <FileText className="w-6 h-6" />
                            </span>
                            Invoices & Receipts
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                You can download invoices for all your transactions directly from the portal.
                            </p>
                            <ol className="list-decimal list-inside space-y-2 font-medium text-neutral-800 ml-2 mt-4">
                                <li>Go to <strong>Settings</strong> and select the <span className="text-sky-600">Billing</span> tab.</li>
                                <li>Scroll down to the <strong>Payment History</strong> section.</li>
                                <li>Click the <strong>Download PDF</strong> icon next to the transaction you need.</li>
                            </ol>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="p-2 bg-green-100 rounded-lg text-green-600">
                                <CreditCard className="w-6 h-6" />
                            </span>
                            Payment Methods
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                We accept major credit cards including Visa, Mastercard, and American Express.
                                Your payment details are securely processed by Stripe.
                            </p>
                            <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                                <h4 className="font-bold text-neutral-900 mb-2">Updating your card</h4>
                                <p className="text-sm">
                                    To update your payment method, go to <strong>Billing Settings</strong> and click "Update Payment Method".
                                    The new card will be used for all future renewals.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="bg-white rounded-2xl border border-neutral-200 p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                            <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <RefreshCw className="w-6 h-6" />
                            </span>
                            Refund Policy
                        </h2>
                        <div className="prose prose-neutral max-w-none text-neutral-600">
                            <p>
                                Our refund policy is designed to be fair and transparent:
                            </p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li><strong>Subscription Cancellations:</strong> You can cancel anytime. You will retain access until the end of the current billing period. No partial refunds are issued for mid-cycle cancellations.</li>
                                <li><strong>Duplicate Charges:</strong> If you were charged incorrectly, please contact support within 7 days for a full refund.</li>
                                <li><strong>Satisfaction Guarantee:</strong> If you are unsatisfied with our service in your first 14 days, contact us to discuss a potential refund.</li>
                            </ul>
                        </div>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    )
}
