"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { subscriptionApi, paymentMethodApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface Plan {
    id: number
    name: string
    amount: number
    type: number
    type_name?: string
    nurse_slots?: number
    unlimited_job_postings?: boolean
    short_description?: string | null
    inclusions?: string[] | null
    billing_period_label?: string | null
    billing_period_display?: string
    updates_note?: string | null
}

interface Subscription {
    id: number
    plan: Plan
}

interface PaymentMethod {
    id: number
    stripe_payment_method_id: string
    card_brand: string
    card_last_four: string
    is_default: boolean
    is_active: boolean
    expiry_month: number
    expiry_year: number
}

/**
 * Normalize API `inclusions`: accept array, JSON string, or a single string; split each entry on newlines
 * so multiple lines saved in one field become separate bullets (fixes "6 lines but 1 bullet").
 */
function normalizeInclusionsFromApi(raw: unknown): string[] {
    const pieces: string[] = []

    const pushChunk = (chunk: string): void => {
        const lines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
        if (lines.length) {
            pieces.push(...lines)
        }
    }

    if (raw == null) {
        return []
    }

    if (Array.isArray(raw)) {
        for (const item of raw) {
            if (item == null) {
                continue
            }
            pushChunk(typeof item === "string" ? item : String(item))
        }
    } else if (typeof raw === "string") {
        const t = raw.trim()
        if (!t) {
            return []
        }
        try {
            const parsed = JSON.parse(t) as unknown
            if (Array.isArray(parsed)) {
                return normalizeInclusionsFromApi(parsed)
            }
        } catch {
            /* treat as plain text */
        }
        pushChunk(t)
    }

    const seen = new Set<string>()
    const out: string[] = []
    for (const line of pieces) {
        if (seen.has(line)) {
            continue
        }
        seen.add(line)
        out.push(line)
    }
    return out
}

export default function PlansPage() {
    const { success, error, info, warning } = useToast()
    const router = useRouter()
    const [plans, setPlans] = useState<Plan[]>([])
    const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [loading, setLoading] = useState(true)
    const [upgrading, setUpgrading] = useState<number | null>(null)

    const hasPaymentMethod = paymentMethods.length > 0

    useEffect(() => {
        // Handle Stripe Checkout return
        const params = new URLSearchParams(window.location.search)
        const status = params.get('status')
        const sessionId = params.get('session_id')

        if (status === 'success' && sessionId) {
            info("Verifying subscription...")

            // Verify session and create subscription if needed
            subscriptionApi.verifyCheckoutSession(sessionId)
                .then(response => {
                    if (response.success) {
                        success("Subscription upgraded successfully!")
                        fetchData()
                    } else {
                        warning("Subscription verification pending. Please refresh in a moment.")
                        fetchData()
                    }
                })
                .catch(err => {
                    console.error("Verification error:", err)
                    error("Failed to verify subscription")
                    fetchData()
                })
                .finally(() => {
                    // Clean up URL
                    window.history.replaceState({}, '', window.location.pathname)
                })
        } else if (status === 'cancelled') {
            info("Checkout cancelled")
            window.history.replaceState({}, '', window.location.pathname)
            fetchData()
        } else {
            fetchData()
        }
        // Intentionally run once on mount (Stripe return query + initial load).
        // eslint-disable-next-line react-hooks/exhaustive-deps -- toast helpers are stable from context
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
        } catch (err) {
            console.error("Failed to fetch data:", err)
            error("Failed to load plans")
        } finally {
            setLoading(false)
        }
    }

    const isCurrentPlan = (plan: Plan) => {
        return currentSubscription?.plan?.id === plan.id
    }

    const handleUpgrade = async (plan: Plan) => {
        if (isCurrentPlan(plan)) {
            return
        }

        // Paid plans require a saved card in Billing before Stripe Checkout
        if (plan.amount > 0 && !hasPaymentMethod) {
            warning("Add a payment method in Billing before you can subscribe to a paid plan.", {
                title: "Payment method required",
                duration: 7000,
            })
            router.push("/billing?redirect=/plans")
            return
        }

        setUpgrading(plan.id)

        try {
            const defaultMethod = paymentMethods.find((pm) => pm.is_default) ?? paymentMethods[0]
            if (!defaultMethod) {
                warning("Please add a payment method in Billing first.")
                router.push("/billing?redirect=/plans")
                return
            }

            const billing_cycle =
                plan.type === 1 ? "yearly" : plan.type === 2 ? "lifetime" : "monthly"

            const response = await subscriptionApi.upgradeSubscription({
                plan_id: plan.id,
                payment_method_id: defaultMethod.id,
                billing_cycle,
            })

            if (!response.success) {
                error(response.message || "Failed to upgrade subscription")
                setUpgrading(null)
                return
            }

            const clientSecret = (response.data as any)?.client_secret as string | undefined
            if (clientSecret) {
                const stripe = await stripePromise
                if (!stripe) {
                    error("Stripe is not configured correctly")
                    setUpgrading(null)
                    return
                }

                const { error: stripeError } = await stripe.confirmCardPayment(clientSecret)
                if (stripeError) {
                    error(stripeError.message || "Payment requires additional action")
                    setUpgrading(null)
                    return
                }
            }

            success("Subscription upgraded successfully!")
            await fetchData()
            setUpgrading(null)
        } catch (err: unknown) {
            console.error("Checkout error:", err)
            const message =
                err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
                    ? (err as { message: string }).message
                    : "An error occurred"
            error(message)
            setUpgrading(null)
        }
    }

    const getButtonText = (plan: Plan) => {
        if (isCurrentPlan(plan)) {
            return "Current plan"
        }
        if (upgrading === plan.id) {
            return "Upgrading..."
        }
        if (plan.amount > 0 && !hasPaymentMethod) {
            return "Add payment method"
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
                    {!hasPaymentMethod && (
                        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
                            <p className="font-medium text-amber-900">Payment method required for paid plans</p>
                            <p className="mt-1 text-amber-900/90">
                                Add a card in{" "}
                                <Link href="/billing" className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-800">
                                    Billing &amp; Subscriptions
                                </Link>{" "}
                                before subscribing. Free plans do not require a card.
                            </p>
                        </div>
                    )}
                </div>

                {/* Plans Grid */}
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => {
                        const features = normalizeInclusionsFromApi(plan.inclusions)
                        const isCurrent = isCurrentPlan(plan)
                        const isPopular = index === 1 // Middle plan is popular

                        const shortDescription = plan.short_description?.trim() || null

                        const periodLabel =
                            plan.billing_period_display?.trim() ||
                            plan.billing_period_label?.trim() ||
                            (plan.type_name && plan.type_name !== "Unknown"
                                ? plan.type_name.toLowerCase()
                                : "month")

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
                                    {shortDescription ? (
                                        <p className="text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                                            {shortDescription}
                                        </p>
                                    ) : (
                                        <div className="min-h-[40px]" aria-hidden />
                                    )}

                                    {plan.updates_note?.trim() && (
                                        <p className="text-xs text-sky-900 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 mt-3 leading-snug">
                                            {plan.updates_note.trim()}
                                        </p>
                                    )}

                                    <div className="mt-6 flex items-baseline">
                                        <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                                            {plan.amount === 0 ? "Free" : `£${plan.amount}`}
                                        </span>
                                        {plan.amount > 0 && (
                                            <span className="text-neutral-500 ml-1 font-medium">
                                                /{periodLabel}
                                            </span>
                                        )}
                                        {plan.amount === 0 && (
                                            <span className="text-neutral-500 ml-1 font-medium text-sm">
                                                Pay only on hire
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {features.length > 0 ? (
                                    <ul className="space-y-4 mb-8 flex-1">
                                        {features.map((feature, idx) => (
                                            <li key={`${plan.id}-inclusion-${idx}`} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center mt-0.5">
                                                    <Check className="w-3 h-3 text-sky-600 stroke-[3]" />
                                                </div>
                                                <span className="text-sm text-neutral-600 leading-snug whitespace-pre-wrap">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="mb-8 flex-1 min-h-[1rem]" />
                                )}

                                <Button
                                    type="button"
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
                                        {plan.amount > 0 && !hasPaymentMethod
                                            ? "Add a payment method in Billing to subscribe"
                                            : "You'll be redirected to Stripe Checkout"}
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
