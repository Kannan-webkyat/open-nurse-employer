"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PlansPage() {
    const plans = [
        {
            name: "Basic",
            target: "Small clinics or practices hiring occasionally",
            price: "Free, Pay only on hire",
            period: "",
            features: [
                "Post 1 active job",
                "Access to a curated pool of registered nurse profiles",
                "Basic applicant tracking via dashboard",
            ],
            current: true,
            popular: false,
            buttonText: "Current plan",
        },
        {
            name: "Standard",
            target: "Medium-sized facilities and agencies filling multiple roles",
            price: "£249",
            period: "/month",
            features: [
                "Post up to 5 active jobs simultaneously",
                "Access full candidate profiles with direct messaging",
                "Featured placement in search results for higher visibility",
                "Basic performance analytics (views, applications)"
            ],
            current: false,
            popular: true,
            buttonText: "Upgrade",
        },
        {
            name: "Advanced",
            target: "Large hospitals or recruiters managing multiple hires",
            price: "£499",
            period: "/month",
            features: [
                "Unlimited job postings",
                "Enhanced candidate search: filter by license, specialization, location",
                "Priority placement in search results and job alerts",
                "Advanced analytics: application sources, time-to-fill, detailed performance data",
                "Dedicated account support / onboarding assistance"
            ],
            current: false,
            popular: false,
            buttonText: "Upgrade",
        }
    ]

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
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col p-8 rounded-2xl bg-white transition-all duration-300",
                                plan.popular
                                    ? "border-[1.5px] border-sky-400 shadow-xl shadow-sky-100 ring-4 ring-sky-50"
                                    : "border border-neutral-200 hover:shadow-lg hover:-translate-y-1"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-4 right-4">
                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-600">
                                        Most popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-neutral-900 mb-2">{plan.name}</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                                    {plan.target}
                                </p>

                                <div className="mt-6 flex items-baseline">
                                    <span className="text-3xl font-bold text-neutral-900 tracking-tight">
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span className="text-neutral-500 ml-1 font-medium">
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
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
                                    plan.current
                                        ? "bg-neutral-100 text-neutral-400 hover:bg-neutral-100 cursor-not-allowed shadow-none border border-neutral-200"
                                        : "bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                                )}
                                disabled={plan.current}
                            >
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>

            </div>
        </DashboardLayout>
    )
}
