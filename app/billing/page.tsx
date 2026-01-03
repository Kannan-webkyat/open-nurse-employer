"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { subscriptionApi, paymentMethodApi } from "@/lib/api"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import toast from "react-hot-toast"

// Initialize Stripe with a fallback test key for debugging if env var fails
// This key is Stripe's public documentation test key
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx"
const stripePromise = loadStripe(STRIPE_KEY)

interface SubscriptionPlan {
  id: number
  name: string
  type: number
  price: number
  nurse_slots: number
}

interface CurrentSubscription {
  id: number
  plan: SubscriptionPlan
  status: string
  current_period_start: string
  current_period_end: string
}

// Stripe Card Form Component
interface StripeCardFormProps {
  onSuccess: () => void
  onCancel: () => void
  selectedPlan: SubscriptionPlan
}

function StripeCardForm({ onSuccess, onCancel, selectedPlan }: StripeCardFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [isReady, setIsReady] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Debug check for Stripe usage
  useEffect(() => {
    if (!stripe) {
      console.log("Stripe object is null - waiting for initialization...")
      // Set a timeout to warn if it takes too long
      const timer = setTimeout(() => {
        if (!stripe) setStripeError("Stripe failed to initialize. Check your internet connection or ad blockers.")
      }, 5000)
      return () => clearTimeout(timer)
    } else {
      console.log("Stripe object is ready")
    }
  }, [stripe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      toast.error("Stripe is not loaded yet. Please wait a moment.")
      return
    }

    if (!cardholderName.trim()) {
      toast.error("Please enter cardholder name")
      return
    }

    setLoading(true)

    try {
      const cardElement = elements.getElement(CardElement)

      if (!cardElement) {
        toast.error("Card element not found")
        setLoading(false)
        return
      }

      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      })

      if (error) {
        toast.error(error.message || "Payment method creation failed")
        setLoading(false)
        return
      }

      if (!paymentMethod) {
        toast.error("Failed to create payment method")
        setLoading(false)
        return
      }

      // First, save payment method to database
      const pmResponse = (await paymentMethodApi.add({
        stripe_payment_method_id: paymentMethod.id,
        card_brand: paymentMethod.card?.brand || "unknown",
        card_last_four: paymentMethod.card?.last4 || "0000",
        is_default: true,
      })) as any

      if (!pmResponse.success || !pmResponse.data) {
        toast.error(pmResponse.message || "Failed to save payment method")
        setLoading(false)
        return
      }

      // Then create subscription with the database payment method ID
      const response = (await subscriptionApi.upgradeSubscription({
        plan_id: selectedPlan.id,
        payment_method_id: pmResponse.data.id, // Use database ID
      })) as any

      if (response.success) {
        const { client_secret, subscription } = response.data

        // Check if additional action (3D Secure) is required
        if (client_secret) {
          const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret)

          if (confirmError) {
            toast.error(confirmError.message || "Payment confirmation failed")
            // Here we might want to cancel the subscription or let it expire
          } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            toast.success("Subscription activated successfully!")
            onSuccess()
          } else {
            toast.success("Subscription created but pending approval.")
            onSuccess()
          }
        } else {
          // No SCA required, subscription is active
          toast.success("Subscription created successfully!")
          onSuccess()
        }
      } else {
        toast.error(response.message || "Failed to create subscription")
      }
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "An error occurred during payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-sm font-medium text-neutral-900 mb-2 block">Cardholder Name</label>
        <Input
          type="text"
          placeholder="Your name"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-neutral-900 mb-2 block">Card Details</label>
        {stripeError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {stripeError}
          </div>
        )}
        <div className="p-3 border border-neutral-300 rounded-lg bg-white min-h-[50px]">
          <CardElement
            onReady={(element) => {
              console.log("CardElement is ready", element)
              setIsReady(true)
            }}
            onChange={(event) => {
              console.log("CardElement change:", event)
            }}
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  fontFamily: 'system-ui, sans-serif',
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
          {!isReady && <p className="text-xs text-neutral-400 mt-1">Loading card input...</p>}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Test card: 4242 4242 4242 4242 | Any future date | Any CVC
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="bg-yellow-500 hover:bg-yellow-400 text-neutral-900"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe to ${selectedPlan?.name}`
          )}
        </Button>
      </div>
    </form>
  )
}

export default function BillingPage() {
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  // Fetch subscription data
  useEffect(() => {
    fetchSubscriptionData()
  }, [])

  const fetchSubscriptionData = async () => {
    setLoading(true)
    try {
      // Fetch current subscription
      const currentSubResponse = (await subscriptionApi.getCurrentSubscription()) as any
      if (currentSubResponse.success && currentSubResponse.data) {
        setCurrentSubscription(currentSubResponse.data)
      }

      // Fetch available plans
      const plansResponse = (await subscriptionApi.getPlans()) as any
      if (plansResponse.success && plansResponse.data) {
        setSubscriptionPlans(plansResponse.data)
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
      toast.error("Failed to load subscription data")
    } finally {
      setLoading(false)
    }
  }

  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setIsUpgradeModalOpen(true)
  }

  const handleSubscriptionSuccess = () => {
    setIsUpgradeModalOpen(false)
    setSelectedPlan(null)
    fetchSubscriptionData()
  }

  const getBillingCycle = (type: number) => {
    switch (type) {
      case 0:
        return "Monthly"
      case 1:
        return "Yearly"
      case 2:
        return "Lifetime"
      default:
        return "Monthly"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing & Subscriptions</h1>
          <p className="text-neutral-600">Manage your subscription, payments, and invoices</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <>
            {/* Current Subscription */}
            {currentSubscription ? (
              <div className="bg-white rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between border-b border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900">Current Subscription</h2>
                  <Badge variant={currentSubscription.status === "active" ? "active" : "pending"}>
                    {currentSubscription.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-6 p-6">
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Plan</p>
                    <p className="text-base font-medium text-neutral-900">{currentSubscription.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Nurse Slots</p>
                    <p className="text-base font-medium text-neutral-900">
                      {currentSubscription.plan.nurse_slots} slots
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 mb-1">Billing Cycle</p>
                    <p className="text-base font-medium text-neutral-900">
                      {getBillingCycle(currentSubscription.plan.type)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <p className="text-neutral-600 text-center">No active subscription. Choose a plan below to get started.</p>
              </div>
            )}

            {/* Available Plans */}
            {subscriptionPlans.length > 0 && (
              <div className="bg-white rounded-lg border border-neutral-200">
                <div className="border-b border-neutral-200 p-6">
                  <h2 className="text-lg font-semibold text-neutral-900">Available Plans</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {subscriptionPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="border border-neutral-200 rounded-lg p-6 hover:border-sky-500 transition-colors"
                      >
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold text-neutral-900 mb-4">
                          £{plan.price}
                          <span className="text-sm font-normal text-neutral-600">
                            /{getBillingCycle(plan.type).toLowerCase()}
                          </span>
                        </p>
                        <p className="text-sm text-neutral-600 mb-4">{plan.nurse_slots} Nurse Slots</p>
                        <Button
                          onClick={() => handleUpgradePlan(plan)}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-neutral-900"
                          disabled={currentSubscription?.plan.id === plan.id}
                        >
                          {currentSubscription?.plan.id === plan.id ? "Current Plan" : "Select Plan"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Upgrade/Subscribe Modal */}
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => {
            setIsUpgradeModalOpen(false)
            setSelectedPlan(null)
          }}
          title={`Subscribe to ${selectedPlan?.name}`}
          description={`Complete your payment to activate your ${selectedPlan?.name} subscription.`}
        >
          {selectedPlan && (
            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600">Plan</span>
                  <span className="text-sm font-medium text-neutral-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600">Nurse Slots</span>
                  <span className="text-sm font-medium text-neutral-900">{selectedPlan.nurse_slots}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-neutral-600">Billing Cycle</span>
                  <span className="text-sm font-medium text-neutral-900">{getBillingCycle(selectedPlan.type)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-neutral-300 mt-2">
                  <span className="text-base font-semibold text-neutral-900">Total</span>
                  <span className="text-xl font-bold text-neutral-900">£{selectedPlan.price}</span>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <StripeCardForm
                  onSuccess={handleSubscriptionSuccess}
                  onCancel={() => {
                    setIsUpgradeModalOpen(false)
                    setSelectedPlan(null)
                  }}
                  selectedPlan={selectedPlan}
                />
              </Elements>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}
