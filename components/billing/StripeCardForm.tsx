"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface StripeCardFormProps {
    clientSecret: string
    onSuccess: (paymentMethodId: string, cardBrand: string, lastFour: string) => void
    onCancel: () => void
    setAsDefault?: boolean
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: "#171717",
            fontFamily: '"Inter", sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#a3a3a3",
            },
        },
        invalid: {
            color: "#ef4444",
            iconColor: "#ef4444",
        },
    },
}

export function StripeCardForm({ clientSecret, onSuccess, onCancel, setAsDefault = true }: StripeCardFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [isProcessing, setIsProcessing] = useState(false)
    const [cardholderName, setCardholderName] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!stripe || !elements || !clientSecret) {
            return
        }

        if (!cardholderName.trim()) {
            toast.error("Please enter cardholder name")
            return
        }

        setIsProcessing(true)

        try {
            const cardElement = elements.getElement(CardElement)

            if (!cardElement) {
                throw new Error("Card element not found")
            }

            // Confirm the setup intent
            const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardholderName,
                    },
                },
            })

            if (error) {
                toast.error(error.message || "Failed to add payment method")
                setIsProcessing(false)
                return
            }

            if (setupIntent && setupIntent.payment_method) {
                // The payment_method in setupIntent can be either a string ID or an expanded object
                // We need to handle both cases
                let paymentMethodId: string
                let cardBrand: string
                let lastFour: string

                if (typeof setupIntent.payment_method === 'string') {
                    // If it's just an ID, we'll need to make an assumption or fetch it
                    // For now, we'll pass the ID and let the backend handle it
                    paymentMethodId = setupIntent.payment_method
                    cardBrand = "card" // Default, backend will update
                    lastFour = "****" // Default, backend will update
                } else {
                    // If it's an expanded object, extract the details
                    paymentMethodId = setupIntent.payment_method.id
                    cardBrand = setupIntent.payment_method.card?.brand || "card"
                    lastFour = setupIntent.payment_method.card?.last4 || "****"
                }

                onSuccess(paymentMethodId, cardBrand, lastFour)
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                    Cardholder Name
                </label>
                <input
                    type="text"
                    placeholder="John Doe"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    required
                />
            </div>

            <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                    Card Details
                </label>
                <div className="p-3 border border-neutral-300 rounded-md">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isProcessing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={!stripe || isProcessing}
                    className="!text-neutral-900 bg-yellow-500 hover:bg-yellow-400"
                >
                    {isProcessing ? "Processing..." : "Add Payment Method"}
                </Button>
            </div>
        </form>
    )
}
