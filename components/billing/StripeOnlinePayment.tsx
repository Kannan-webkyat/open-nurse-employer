"use client"

import { Button } from "@/components/ui/button"

interface StripeOnlinePaymentProps {
    checkoutUrl: string | null
    amount: number
    currency: string
    onSuccess: (paymentIntentId: string) => void
    onCancel: () => void
}

export function StripeOnlinePayment({
    checkoutUrl,
    amount,
    currency,
    onSuccess,
    onCancel
}: StripeOnlinePaymentProps) {

    const handleProceed = () => {
        if (checkoutUrl) {
            window.location.href = checkoutUrl
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">Amount to pay:</span>
                    <span className="text-lg font-bold text-neutral-900">
                        {currency.toUpperCase()} {amount.toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto border border-neutral-200 shadow-sm">
                    <svg className="w-8 h-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-base font-semibold text-neutral-900">Secure Online Payment</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                        You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleProceed}
                    disabled={!checkoutUrl}
                    className="!text-neutral-900 bg-yellow-500 hover:bg-yellow-400"
                >
                    Proceed to Payment
                </Button>
            </div>
        </div>
    )
}
