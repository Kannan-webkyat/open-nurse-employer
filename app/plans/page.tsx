"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Check, Loader2, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscriptionApi, paymentMethodApi } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PlansPage() {
    const router = useRouter()
    const [plans, setPlans] = useState([])
    const [currentSubscription, setCurrentSubscription] = useState(null)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState(null)

    useEffect(() => {
        // Handle Stripe Checkout return
        const params = new URLSearchParams(window.location.search)
        const status = params.get('status')
        const sessionId = params.get('session_id')

        console.log("Plans Page Mounted. Status:", status, "Session ID:", sessionId)

        if (status === 'success' && sessionId) {
            console.log("Starting verification for session:", sessionId)
            const toastId = toast.loading("Verifying subscription...")

            // Verify session and create subscription if needed
            subscriptionApi.verifyCheckoutSession(sessionId)
                .then(response => {
                    console.log("Verification response:", response)
                    if (response.success) {
                        toast.success("Subscription upgraded successfully!", { id: toastId })
                        fetchData()
                    } else {
                        toast.warning("Subscription verification pending. Please refresh in a moment.", { id: toastId })
                        fetchData()
                    }
                })
                .catch(err => {
                    console.error("Verification error:", err)
                    toast.error("Failed to verify subscription", { id: toastId })
                    fetchData()
                })
                .finally(() => {
                    // Clean up URL
                    window.history.replaceState({}, '', window.location.pathname)
                })
        } else if (status === 'cancelled') {
            toast.info("Checkout cancelled")
            window.history.replaceState({}, '', window.location.pathname)
            fetchData()
        } else {
            fetchData()
        }
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [plansRes, subscriptionRes, paymentMethodsRes] = await Promise.all([
                subscriptionApi.getPlans(),
                subscriptionApi.getCurrentSubscription(),
                paymentMethodApi.getAll()
            ])

            if (plansRes.success && plansRes.data) {
                setPlans(plansRes.data)
            }

            if (subscriptionRes.success && subscriptionRes.data) {
                setCurrentSubscription(subscriptionRes.data)
            }

            if (paymentMethodsRes.success && paymentMethodsRes.data) {
                setPaymentMethods(paymentMethodsRes.data)
            }
        } catch (error) {
            console.error("Failed to fetch data:", error)
            toast.error("Failed to load plans")
        } finally {
            setLoading(false)
        }
    }

    const handleUpgrade = async (plan) => {
        setUpgrading(plan.id)
        const toastId = toast.loading(`Preparing checkout for ${plan.name}...`)

        try {
            const response = await subscriptionApi.createCheckoutSession(plan.id)

            if (response.success && response.data?.url) {
                toast.success("Redirecting to Stripe Checkout...", { id: toastId })
                // Redirect to Stripe Checkout
                window.location.href = response.data.url
            } else {
                toast.error(response.message || "Failed to create checkout session", { id: toastId })
                setUpgrading(null)
            }
        } catch (error) {
            console.error("Checkout error:", error)
            toast.error(error.message || "An error occurred", { id: toastId })
            setUpgrading(null)
        }
    }

    const getPlanFeatures = (plan) => {
        const features = []

        if (plan.nurse_slots) {
            if (plan.nurse_slots === 1) {
                features.push("Post 1 active job")
            } else if (plan.nurse_slots < 100) {
                features.push(`Post up to ${plan.nurse_slots} active jobs simultaneously`)
            } else {
                features.push("Unlimited job postings")
            }
        }

        features.push("Access to a curated pool of registered nurse profiles")
        features.push("Basic applicant tracking via dashboard")

        if (plan.nurse_slots && plan.nurse_slots > 1) {
            features.push("Access full candidate profiles with direct messaging")
            features.push("Featured placement in search results for higher visibility")
        }

        if (plan.nurse_slots && plan.nurse_slots > 5) {
            features.push("Enhanced candidate search: filter by license, specialization, location")
            features.push("Priority placement in search results and job alerts")
            features.push("Advanced analytics: application sources, time-to-fill, detailed performance data")
            features.push("Dedicated account support / onboarding assistance")
        }

        return features
    }

    const isCurrentPlan = (plan) => {
        return currentSubscription?.plan?.id === plan.id
    }

    const getButtonText = (plan) => {
        if (isCurrentPlan(plan)) {
            return "Current plan"
        }
        if (upgrading === plan.id) {
            return "Upgrading..."
        }
        return "Upgrade"
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="min-h-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">

                {/* Header content */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-2">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-lg text-neutral-600">
                        Choose the plan that fits your recruitment needs. Upgrade or cancel anytime.
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => {
                        const features = getPlanFeatures(plan)
                        const isCurrent = isCurrentPlan(plan)
                        const isPopular = index === 1 // Middle plan is popular

                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col p-8 rounded-2xl bg-white transition-all duration-300",
                                    isPopular
                                        ? "border-[1.5px] border-sky-400 shadow-xl shadow-sky-100 ring-4 ring-sky-50"
                                        : "border border-neutral-200 hover:shadow-lg hover:-translate-y-1"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                                            Most popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-neutral-900 mb-2">{plan.name}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                                        {plan.nurse_slots === 1 && "Small clinics or practices hiring occasionally"}
                                        {plan.nurse_slots > 1 && plan.nurse_slots <= 5 && "Medium-sized facilities and agencies filling multiple roles"}
                                        {plan.nurse_slots > 5 && "Large hospitals or recruiters managing multiple hires"}
                                    </p>

                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                                            {plan.amount === 0 ? "Free" : `£${plan.amount}`}
                                        </span>
                                        {plan.amount > 0 && (
                                            <span className="text-neutral-500 ml-1 font-medium">
                                                /{plan.type_name?.toLowerCase() || 'month'}
                                            </span>
                                        )}
                                        {plan.amount === 0 && (
                                            <span className="text-neutral-500 ml-1 font-medium text-sm">
                                                Pay only on hire
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center mt-0.5">
                                                <Check className="w-3 h-3 text-sky-600 stroke-[3]" />
                                            </div>
                                            <span className="text-sm text-neutral-600 leading-snug">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={cn(
                                        "w-full rounded-full py-6 text-base font-semibold transition-all duration-200",
                                        isCurrent
                                            ? "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 cursor-not-allowed shadow-none border border-neutral-200"
                                            : "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                                    )}
                                    disabled={isCurrent || upgrading === plan.id}
                                    onClick={() => handleUpgrade(plan)}
                                >
                                    {upgrading === plan.id && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    )}
                                    {getButtonText(plan)}
                                </Button>

                                {/* Payment method indicator */}
                                {!isCurrent && (
                                    <p className="mt-3 text-xs text-center text-neutral-500">
                                        You'll be redirected to Stripe Checkout
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>

            </div>
        </DashboardLayout>
    )
}
