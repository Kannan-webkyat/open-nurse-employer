"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import {
    ArrowRight,
    Briefcase,
    Check,
    CheckCircle2,
    CreditCard,
    Info,
    Loader2,
    Shield,
    Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { subscriptionApi, paymentMethodApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { FREE_PLAN } from "@/lib/subscription/freePlan"

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
    inclusions?: readonly string[] | null
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

const fmt = (amount: number): string => {
    try {
        return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount)
    } catch {
        return `£${Number(amount).toFixed(2)}`
    }
}

const billingLabel = (plan: Plan): string => {
    if (plan.billing_period_display?.trim()) {
        return plan.billing_period_display.trim()
    }
    if (plan.billing_period_label?.trim()) {
        return plan.billing_period_label.trim()
    }
    if (plan.type === 1) {
        return "year"
    }
    if (plan.type === 2) {
        return "lifetime"
    }
    if (plan.type === 3) {
        return "6 months"
    }
    if (plan.type_name && plan.type_name !== "Unknown") {
        return plan.type_name.toLowerCase()
    }
    return "month"
}

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

function PageHeader({
    hasPaymentMethod,
    currentPlanName,
    onFreePlan,
}: {
    hasPaymentMethod: boolean
    currentPlanName: string
    onFreePlan: boolean
}) {
    return (
        <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
            <div className="px-6 py-8 sm:px-8 sm:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600 mb-3">
                    Plans &amp; pricing
                </p>
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                            Choose the right plan for your hiring needs
                        </h1>
                        <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
                            Start with the free plan to post your first healthcare vacancy, then upgrade anytime for more job slots, visibility, and recruitment tools.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 min-w-[180px]">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <Briefcase className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Current plan</p>
                                <p className="text-sm font-semibold text-neutral-900">{currentPlanName}</p>
                            </div>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-3 rounded-2xl px-4 py-3 min-w-[180px]",
                                hasPaymentMethod ? "bg-sky-50" : "bg-amber-50",
                            )}
                        >
                            <span
                                className={cn(
                                    "flex h-9 w-9 items-center justify-center rounded-full",
                                    hasPaymentMethod ? "bg-sky-100 text-sky-700" : "bg-amber-100 text-amber-700",
                                )}
                            >
                                <CreditCard className="h-4 w-4" strokeWidth={2.5} />
                            </span>
                            <div>
                                <p
                                    className={cn(
                                        "text-[11px] font-semibold uppercase tracking-wide",
                                        hasPaymentMethod ? "text-sky-700" : "text-amber-700",
                                    )}
                                >
                                    Payment method
                                </p>
                                <p className="text-sm font-semibold text-neutral-900">
                                    {hasPaymentMethod ? "Ready to upgrade" : "Required for paid plans"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-px bg-linear-to-r from-transparent via-neutral-200 to-transparent" />
            {onFreePlan && (
                <div className="px-6 py-4 sm:px-8 bg-emerald-50/40 border-t border-emerald-100">
                    <p className="text-sm text-emerald-900">
                        You are on <span className="font-semibold">{FREE_PLAN.name}</span>. Upgrade when you need more job posts or advanced hiring features.
                    </p>
                </div>
            )}
        </section>
    )
}

function PaymentMethodNotice() {
    return (
        <section className="overflow-hidden rounded-2xl bg-amber-50 border border-amber-200 shadow-sm">
            <div className="flex">
                <div className="w-1 shrink-0 bg-amber-400" aria-hidden="true" />
                <div className="flex-1 px-5 py-5 sm:px-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                            <CreditCard className="h-4 w-4" />
                        </span>
                        <div>
                            <h2 className="text-sm font-semibold text-neutral-900">Add a payment method to upgrade</h2>
                            <p className="mt-1 text-sm text-neutral-700 leading-relaxed">
                                Paid plans require a saved card in{" "}
                                <Link
                                    href="/billing?redirect=/plans"
                                    className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-800"
                                >
                                    Billing &amp; Subscriptions
                                </Link>
                                . The free plan does not require a card.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ImportantNotice() {
    return (
        <section className="overflow-hidden rounded-2xl bg-neutral-50 border border-neutral-200 shadow-sm">
            <div className="flex">
                <div className="w-1 shrink-0 bg-sky-400" aria-hidden="true" />
                <div className="flex-1 px-5 py-5 sm:px-6">
                    <div className="flex items-center gap-2.5 mb-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                            <Info className="h-4 w-4" />
                        </span>
                        <h2 className="text-sm font-semibold text-neutral-900">Before you choose a plan</h2>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                        Open Nurses®️ helps healthcare employers advertise vacancies and manage applications online.
                        Subscription plans provide platform access and recruitment tools — they do not guarantee hires,
                        interviews, or candidate availability.
                    </p>
                </div>
            </div>
        </section>
    )
}

function PlanCard({
    plan,
    features,
    isCurrent,
    isStaticFreePlan,
    isPopular,
    upgrading,
    hasPaymentMethod,
    buttonText,
    onUpgrade,
}: {
    plan: Plan
    features: string[]
    isCurrent: boolean
    isStaticFreePlan: boolean
    isPopular: boolean
    upgrading: boolean
    hasPaymentMethod: boolean
    buttonText: string
    onUpgrade: () => void
}) {
    const shortDescription = plan.short_description?.trim() || (isStaticFreePlan ? FREE_PLAN.short_description : null)
    const accentBar = isStaticFreePlan ? "bg-emerald-500" : isPopular ? "bg-sky-600" : "bg-sky-400"
    const headerBg = isStaticFreePlan ? "bg-emerald-50/60" : isPopular ? "bg-sky-50/80" : "bg-neutral-50/80"
    const needsPaymentMethod = !isStaticFreePlan && plan.amount > 0 && !hasPaymentMethod && !isCurrent

    return (
        <article
            className={cn(
                "group flex flex-col h-full rounded-2xl bg-white overflow-hidden shadow-sm transition-all duration-200 hover:shadow-md",
                isCurrent && "ring-2 ring-emerald-200 shadow-md",
                isPopular && !isCurrent && "ring-2 ring-sky-100 shadow-md",
            )}
        >
            <div className={cn("h-1.5", accentBar)} />

            <div className={cn("px-5 pt-5 pb-4", headerBg)}>
                <div className="flex items-start justify-between gap-2 mb-4 min-h-[24px]">
                    <span
                        className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                            isStaticFreePlan ? "bg-emerald-100 text-emerald-800" : "bg-sky-100 text-sky-800",
                        )}
                    >
                        {isStaticFreePlan ? "Starter" : isPopular ? "Recommended" : "Paid plan"}
                    </span>
                    {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                        </span>
                    )}
                    {isPopular && !isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            <Sparkles className="w-3 h-3" />
                            Popular
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 leading-snug">{plan.name}</h3>

                <div className="mt-3 flex items-baseline gap-1">
                    {plan.amount === 0 ? (
                        <>
                            <span className="text-3xl font-bold tracking-tight text-neutral-900">Free</span>
                            <span className="text-sm font-medium text-neutral-500">to start</span>
                        </>
                    ) : (
                        <>
                            <span className="text-3xl font-bold tracking-tight text-neutral-900">{fmt(plan.amount)}</span>
                            <span className="text-sm font-medium text-neutral-500">/ {billingLabel(plan)}</span>
                        </>
                    )}
                </div>

                {shortDescription && (
                    <p className="mt-3 text-sm text-neutral-600 leading-relaxed">{shortDescription}</p>
                )}

                {plan.updates_note?.trim() && (
                    <p className="mt-3 text-xs text-sky-900 bg-white/70 border border-sky-100 rounded-lg px-3 py-2 leading-snug">
                        {plan.updates_note.trim()}
                    </p>
                )}

                {!isStaticFreePlan && plan.nurse_slots != null && plan.nurse_slots > 0 && (
                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 bg-white/80 rounded-full px-3 py-1 border border-neutral-200">
                        <Shield className="w-3.5 h-3.5 text-sky-600" />
                        {plan.unlimited_job_postings ? "Unlimited job posts" : `${plan.nurse_slots} concurrent job post${plan.nurse_slots === 1 ? "" : "s"}`}
                    </p>
                )}
            </div>

            <div className="flex flex-col flex-1 px-5 pb-5">
                {features.length > 0 ? (
                    <ul className="space-y-3 py-4 flex-1 border-t border-neutral-100">
                        {features.map((feature, idx) => (
                            <li key={`${plan.id}-inclusion-${idx}`} className="flex items-start gap-2.5">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                                <span className="text-sm text-neutral-600 leading-snug">{feature}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex-1 py-4 border-t border-neutral-100" />
                )}

                {needsPaymentMethod ? (
                    <button
                        type="button"
                        onClick={onUpgrade}
                        className="inline-flex w-full h-11 items-center justify-center gap-0 rounded-full bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
                    >
                        <CreditCard className="mr-2 h-4 w-4 shrink-0" />
                        Add payment method
                    </button>
                ) : (
                    <Button
                        type="button"
                        variant={isCurrent || isStaticFreePlan ? "outline" : "default"}
                        className={cn(
                            "w-full h-11 text-sm font-semibold shadow-sm",
                            (isCurrent || isStaticFreePlan) &&
                                "bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-600 cursor-default",
                        )}
                        disabled={isCurrent || upgrading || isStaticFreePlan}
                        onClick={onUpgrade}
                    >
                        {upgrading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {!upgrading && !isCurrent && !isStaticFreePlan && (
                            <ArrowRight className="w-4 h-4 mr-2" />
                        )}
                        {buttonText}
                    </Button>
                )}

                {!isCurrent && !isStaticFreePlan && (
                    <p className="mt-3 text-[11px] text-center text-neutral-500 leading-relaxed">
                        {needsPaymentMethod
                            ? "Add a card in Billing before subscribing"
                            : "Secure payment · Cancel or change plan anytime"}
                    </p>
                )}
            </div>
        </article>
    )
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
        const params = new URLSearchParams(window.location.search)
        const status = params.get("status")
        const sessionId = params.get("session_id")

        if (status === "success" && sessionId) {
            info("Verifying subscription...")

            subscriptionApi.verifyCheckoutSession(sessionId)
                .then((response) => {
                    if (response.success) {
                        success("Subscription upgraded successfully!")
                        fetchData()
                    } else {
                        warning("Subscription verification pending. Please refresh in a moment.")
                        fetchData()
                    }
                })
                .catch((err) => {
                    console.error("Verification error:", err)
                    error("Failed to verify subscription")
                    fetchData()
                })
                .finally(() => {
                    window.history.replaceState({}, "", window.location.pathname)
                })
        } else if (status === "cancelled") {
            info("Checkout cancelled")
            window.history.replaceState({}, "", window.location.pathname)
            fetchData()
        } else {
            fetchData()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [plansRes, subscriptionRes, paymentMethodsRes] = await Promise.all([
                subscriptionApi.getPlans(),
                subscriptionApi.getCurrentSubscription(),
                paymentMethodApi.getAll(),
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
        if (plan.id === FREE_PLAN.id) {
            return !currentSubscription?.plan?.id
        }

        return currentSubscription?.plan?.id === plan.id
    }

    const displayPlans: Plan[] = [FREE_PLAN, ...plans]
    const onFreePlan = !currentSubscription?.plan?.id
    const currentPlanName = currentSubscription?.plan?.name ?? FREE_PLAN.name
    const popularPaidPlanId = plans.length > 0
        ? [...plans].sort((a, b) => b.amount - a.amount)[0]?.id
        : null

    const handleUpgrade = async (plan: Plan) => {
        if (plan.id === FREE_PLAN.id || isCurrentPlan(plan)) {
            return
        }

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

            const upgradeData = response.data as {
                client_secret?: string
                subscription_status?: string
                is_active?: boolean
                requires_payment_action?: boolean
            } | undefined

            if (upgradeData?.client_secret) {
                const stripe = await stripePromise
                if (!stripe) {
                    error("Stripe is not configured correctly")
                    setUpgrading(null)
                    return
                }

                const { error: stripeError } = await stripe.confirmCardPayment(upgradeData.client_secret)
                if (stripeError) {
                    error(stripeError.message || "Payment requires additional action")
                    setUpgrading(null)
                    return
                }
            }

            const current = await subscriptionApi.getCurrentSubscription()
            const status = (current.data?.status || upgradeData?.subscription_status || "").toLowerCase()

            if (!["active", "trialing"].includes(status)) {
                warning(
                    "Payment was not completed. Your subscription is still incomplete. Open Billing to remove it or try upgrading again.",
                    { title: "Subscription not activated", duration: 9000 }
                )
                await fetchData()
                setUpgrading(null)
                return
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
        if (plan.id === FREE_PLAN.id) {
            return isCurrentPlan(plan) ? "Current plan" : "Included"
        }

        if (isCurrentPlan(plan)) {
            return "Current plan"
        }
        if (upgrading === plan.id) {
            return "Processing..."
        }
        if (plan.amount > 0 && !hasPaymentMethod) {
            return "Add payment method"
        }
        return "Upgrade plan"
    }

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex min-h-[420px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-neutral-500">
                        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                        <p className="text-sm font-medium">Loading plans...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-6 pb-8">
                <PageHeader
                    hasPaymentMethod={hasPaymentMethod}
                    currentPlanName={currentPlanName}
                    onFreePlan={onFreePlan}
                />

                {!hasPaymentMethod && <PaymentMethodNotice />}

                <ImportantNotice />

                <section>
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-900">Available plans</h2>
                            <p className="text-sm text-neutral-500 mt-1">
                                Compare features and upgrade when your recruitment needs grow.
                            </p>
                        </div>
                        <Link
                            href="/billing"
                            className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800"
                        >
                            Manage billing
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div
                        className={cn(
                            "grid gap-5",
                            displayPlans.length <= 2
                                ? "grid-cols-1 md:grid-cols-2"
                                : displayPlans.length === 3
                                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                                    : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
                        )}
                    >
                        {displayPlans.map((plan) => {
                            const features = normalizeInclusionsFromApi(plan.inclusions)
                            const isCurrent = isCurrentPlan(plan)
                            const isStaticFreePlan = plan.id === FREE_PLAN.id
                            const isPopular = !isStaticFreePlan && plan.id === popularPaidPlanId

                            return (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    features={features}
                                    isCurrent={isCurrent}
                                    isStaticFreePlan={isStaticFreePlan}
                                    isPopular={isPopular}
                                    upgrading={upgrading === plan.id}
                                    hasPaymentMethod={hasPaymentMethod}
                                    buttonText={getButtonText(plan)}
                                    onUpgrade={() => handleUpgrade(plan)}
                                />
                            )
                        })}
                    </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white px-5 py-5 sm:px-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-neutral-900">Need help choosing a plan?</h3>
                            <p className="mt-1 text-sm text-neutral-600">
                                View invoices, update your card, or manage your subscription from Billing.
                            </p>
                        </div>
                        <Link
                            href="/billing"
                            className="inline-flex h-10 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-800 hover:bg-neutral-100 shrink-0"
                        >
                            Go to Billing
                        </Link>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    )
}
