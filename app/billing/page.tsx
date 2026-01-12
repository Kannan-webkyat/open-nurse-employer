"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { CreditCard, ChevronRight, Download, ChevronDown, Building2, ChevronUp } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { paymentMethodApi, paymentApi } from "@/lib/api"
import { toast } from "sonner"
import { StripeCardForm } from "@/components/billing/StripeCardForm"
import { StripeOnlinePayment } from "@/components/billing/StripeOnlinePayment"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface PaymentMethod {
  id: number | string
  type: "visa" | "mastercard" | "bank" | string
  lastFour: string
  isDefault: boolean
  isBank?: boolean
  cardholderName?: string
  cardNumber?: string
  expiryDate?: string
  cvv?: string
}

interface Invoice {
  id: string
  paidAt: string
  amount: string
  status: "paid" | "pending"
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 1,
    type: "visa",
    lastFour: "1234",
    isDefault: true,
    cardholderName: "John Doe",
    cardNumber: "4111111111111234",
    expiryDate: "12/25",
    cvv: "123"
  },
  {
    id: 2,
    type: "mastercard",
    lastFour: "5678",
    isDefault: false,
    cardholderName: "Jane Smith",
    cardNumber: "5555555555555678",
    expiryDate: "06/26",
    cvv: "456"
  },
]

const invoices: Invoice[] = [
  { id: "INV-001", paidAt: "2025-09-03", amount: "£200", status: "paid" },
  { id: "INV-002", paidAt: "2025-10-03", amount: "£200", status: "paid" },
  { id: "INV-001", paidAt: "2025-09-03", amount: "£200", status: "paid" },
  { id: "INV-002", paidAt: "2025-10-03", amount: "£200", status: "paid" },
  { id: "INV-001", paidAt: "2025-09-03", amount: "£200", status: "pending" },
]

export default function BillingPage() {
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>([])
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isCreditCardExpanded, setIsCreditCardExpanded] = useState(false)
  const [isStripeOnlineExpanded, setIsStripeOnlineExpanded] = useState(false)
  const [isBankTransferExpanded, setIsBankTransferExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [paymentAmount, setPaymentAmount] = useState<number>(200) // Default amount
  const [cardFormData, setCardFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    setAsDefault: true,
  })
  const [bankTransferFormData, setBankTransferFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    branchName: "",
    swiftBicCode: "",
    bankAddress: "",
    billingAddress: "",
    reference: "",
    setAsDefault: true,
  })

  // Check if Stripe is configured
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  // Fetch payment methods on mount
  useEffect(() => {
    if (isStripeConfigured) {
      console.log("Stripe Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      fetchPaymentMethods()
      fetchTransactions()
    } else {
      console.warn("Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local")
    }

    // Check for payment return status
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment_status')
    const sessionId = params.get('session_id')

    console.log("Payment Verification Params:", { status, sessionId })

    if (status === 'success' && sessionId) {
      const toastId = toast.loading("Verifying payment...")
      paymentApi.verify(sessionId)
        .then((response) => {
          if (response.success) {
            toast.success("Payment verified and completed!", { id: toastId })
            fetchTransactions()
          } else {
            toast.warning("Payment successful but verification returned unexpected status.", { id: toastId })
          }
        })
        .catch((err) => {
          console.error(err)
          toast.error("Failed to verify payment status.", { id: toastId })
        })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname)
        })
    } else if (status === 'cancelled') {
      // toast.error("Payment cancelled") 
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await paymentApi.getAll()
      if (response.success && response.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    }
  }

  const fetchPaymentMethods = async () => {
    setIsLoading(true)
    try {
      const [methodsRes, banksRes] = await Promise.all([
        paymentMethodApi.getAll(),
        paymentMethodApi.getBankAccounts()
      ])

      let combined: PaymentMethod[] = []

      if (methodsRes.success && methodsRes.data) {
        const cards = Array.isArray(methodsRes.data) ? methodsRes.data.map((pm: any) => ({
          id: pm.id,
          type: pm.card_brand ? pm.card_brand.toLowerCase() : "card",
          lastFour: pm.card_last_four,
          isDefault: pm.is_default,
          isBank: false
        })) : []
        combined = [...combined, ...cards]
      }

      if (banksRes.success && banksRes.data) {
        const banks = Array.isArray(banksRes.data) ? banksRes.data.map((acc: any) => ({
          id: `bank_${acc.id}`, // specific ID format
          originalId: acc.id,
          type: "bank",
          lastFour: acc.account_number.slice(-4),
          isDefault: acc.is_default,
          isBank: true
        })) : []
        combined = [...combined, ...banks]
      }

      setPaymentMethodsList(combined)
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
      // Don't show error toast on initial load, just log it
      setPaymentMethodsList([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsDefault = async (id: any) => {
    try {
      let response;
      if (id.toString().startsWith('bank_')) {
        const originalId = id.split('_')[1];
        response = await paymentMethodApi.setDefaultBankAccount(originalId);
      } else {
        response = await paymentMethodApi.setDefault(id);
      }

      if (response.success) {
        toast.success("Payment method set as default")
        fetchPaymentMethods()
      } else {
        toast.error(response.message || "Failed to set default payment method")
      }
    } catch (error) {
      toast.error("Failed to set default payment method")
    }
  }

  const handleViewPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    setIsViewPaymentModalOpen(true)
  }

  const handleCreditCardExpand = async () => {
    setIsCreditCardExpanded(!isCreditCardExpanded)
    setIsStripeOnlineExpanded(false)
    setIsBankTransferExpanded(false)

    // Create setup intent when expanding credit card form
    if (!isCreditCardExpanded && !clientSecret) {
      try {
        const response = await paymentMethodApi.createSetupIntent()
        if (response.success && response.data) {
          setClientSecret(response.data.client_secret)
        } else {
          toast.error("Failed to initialize payment form")
        }
      } catch (error: any) {
        console.error("Payment setup error:", error);
        toast.error(error.response?.data?.message || "Failed to initialize payment form")
      }
    }
  }

  const handleStripeSuccess = async (paymentMethodId: string, cardBrand: string, lastFour: string) => {
    try {
      const response = await paymentMethodApi.add({
        stripe_payment_method_id: paymentMethodId,
        card_brand: cardBrand,
        card_last_four: lastFour,
        is_default: cardFormData.setAsDefault,
      })

      if (response.success) {
        toast.success("Payment method added successfully")
        setIsAddPaymentModalOpen(false)
        setIsCreditCardExpanded(false)
        setClientSecret(null)
        fetchPaymentMethods()
      } else {
        toast.error(response.message || "Failed to add payment method")
      }
    } catch (error) {
      toast.error("Failed to add payment method")
    }
  }

  const handleDeletePaymentMethod = async (id: any) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return
    }

    try {
      let response;
      if (id.toString().startsWith('bank_')) {
        const originalId = id.split('_')[1];
        response = await paymentMethodApi.deleteBankAccount(originalId);
      } else {
        response = await paymentMethodApi.delete(id);
      }

      if (response.success) {
        toast.success("Payment method deleted successfully")
        setIsViewPaymentModalOpen(false)
        setSelectedPaymentMethod(null)
        fetchPaymentMethods()
      } else {
        toast.error(response.message || "Failed to delete payment method")
      }
    } catch (error) {
      toast.error("Failed to delete payment method")
    }
  }

  const handleStripeOnlineExpand = async () => {
    setIsStripeOnlineExpanded(!isStripeOnlineExpanded)
    setIsCreditCardExpanded(false)
    setIsBankTransferExpanded(false)

    // Create payment intent when expanding Stripe online payment
    if (!isStripeOnlineExpanded && !paymentClientSecret) {
      try {
        setIsLoading(true)
        const response = await paymentApi.createIntent({
          amount: paymentAmount,
          currency: 'gbp',
          description: 'Subscription payment',
        })

        if (response.success && response.data) {
          setPaymentUrl(response.data.url)
        } else {
          toast.error("Failed to initialize payment")
        }
      } catch (error) {
        toast.error("Failed to initialize payment")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleStripeOnlineSuccess = async (paymentIntentId: string) => {
    toast.success("Payment completed successfully!")
    setIsAddPaymentModalOpen(false)
    setIsStripeOnlineExpanded(false)
    setPaymentClientSecret(null)
    setPaymentUrl(null)
  }
  // Optionally refresh payment history or subscription status

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing & Subscriptions</h1>
          <p className="text-neutral-600">Manage your subscription, payments, and invoices</p>
        </div>

        {/* Stripe Configuration Warning */}
        {!isStripeConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-yellow-800">Stripe Not Configured</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Payment methods require Stripe configuration. Please add <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file and restart the server.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  See <code className="bg-yellow-100 px-1 rounded">STRIPE_SETUP.md</code> for setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Current Subscription</h2>
            <Badge variant="active">Active</Badge>
          </div>
          <div className="grid grid-cols-3 gap-6 p-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-medium text-neutral-900">Premium</p>
                <Link href="/plans" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Change
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Active Nurse Slots</p>
              <p className="text-base font-medium text-neutral-900">15 / 20</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Billing Cycle</p>
              <p className="text-base font-medium text-neutral-900">Monthly</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Payment Method</h2>
            <Button
              className="text-white bg-neutral-950 hover:bg-neutral-900"
              onClick={() => setIsAddPaymentModalOpen(true)}
            >
              Add Payment Method
            </Button>
          </div>
          <div className="space-y-4 p-6">
            {paymentMethodsList.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer border border-neutral-100"
                onClick={() => handleViewPaymentMethod(method)}
              >
                <div className="flex items-center gap-4">
                  {method.type === "bank" ? (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-neutral-100">
                      <Image src="/bank-transfer.svg" alt="Bank" width={24} height={24} className="object-contain" />
                    </div>
                  ) : method.type === "visa" ? (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-neutral-100">
                      <Image src="/visa.svg" alt="VISA" width={40} height={24} className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-neutral-100">
                      <Image src="/mastercard.svg" alt="Mastercard" width={40} height={24} className="object-contain" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {method.type === "bank" ? "Bank Account" : `*** *** *** ${method.lastFour}`}
                    </p>
                    {method.type === "bank" && (
                      <p className="text-xs text-neutral-500">
                        Ending in {method.lastFour}
                      </p>
                    )}
                  </div>
                  {method.isDefault ? (
                    <Badge className="bg-yellow-100 text-yellow-600">
                      Default Method
                    </Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsDefault(method.id)
                      }}
                      className="border-none text-neutral-400 bg-neutral-100 !rounded-full text-sm"
                    >
                      Mark As Default
                    </Button>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-500 px-6 pb-6">
            All payments are secure and encrypted.
          </p>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-6">Billing History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Paid at</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <TableRow key={`${txn.id}-${index}`}>
                    <TableCell className="text-neutral-800">#{txn.id}</TableCell>
                    <TableCell className="text-neutral-800">
                      {new Date(txn.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-neutral-800">£{txn.amount}</TableCell>
                    <TableCell>
                      {txn.status === "paid" ? (
                        <Badge variant="paid">
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="pending">
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <button className="text-sky-600 hover:text-sky-700 flex items-center gap-1 text-sm font-medium">
                        <Download className="w-4 h-4" />
                        Download PDF
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-neutral-500">
                    No billing history found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Payment Method Modal */}
        <Modal
          isOpen={isAddPaymentModalOpen}
          onClose={() => setIsAddPaymentModalOpen(false)}
          title="Add Payment Method"
          description="Choose a payment method to continue your subscription."
          footer={
            <div className="flex justify-end">
              <Button
                onClick={() => setIsAddPaymentModalOpen(false)}
                className="text-white bg-neutral-950 hover:bg-neutral-900"
              >
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-3">

            {/* Credit Card Option */}
            <div>
              <button
                className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={handleCreditCardExpand}
              >
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-neutral-900">Credit Card</span>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-neutral-200">
                      <Image src="/visa.svg" alt="VISA" width={32} height={20} className="object-contain" />
                    </div>
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center border border-neutral-200">
                      <Image src="/mastercard.svg" alt="Mastercard" width={32} height={20} className="object-contain" />
                    </div>
                  </div>
                </div>
                {isCreditCardExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* Credit Card Form */}
              {isCreditCardExpanded && (
                <div className="mt-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  {clientSecret ? (
                    <Elements stripe={stripePromise}>
                      <StripeCardForm
                        clientSecret={clientSecret}
                        onSuccess={handleStripeSuccess}
                        onCancel={() => {
                          setIsCreditCardExpanded(false)
                          setClientSecret(null)
                        }}
                        setAsDefault={cardFormData.setAsDefault}
                      />
                    </Elements>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-600">Loading payment form...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stripe Online Payment Option */}
            <div>
              <button
                className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={handleStripeOnlineExpand}
              >
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-neutral-900">Stripe Online Payment</span>
                  <div className="flex items-center gap-2 bg-white rounded px-2 py-1 border border-neutral-200">
                    <svg className="w-12 h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
                    </svg>
                  </div>
                </div>
                {isStripeOnlineExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* Stripe Online Payment Form */}
              {isStripeOnlineExpanded && (
                <div className="mt-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  {paymentUrl ? (
                    <StripeOnlinePayment
                      checkoutUrl={paymentUrl}
                      amount={paymentAmount}
                      currency="gbp"
                      onSuccess={() => handleStripeOnlineSuccess("")}
                      onCancel={() => {
                        setIsStripeOnlineExpanded(false)
                        setPaymentUrl(null)
                      }}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-neutral-600">Loading payment form...</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Direct Bank Transfer Option */}
            <div>
              <button
                className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => {
                  setIsBankTransferExpanded(!isBankTransferExpanded)
                  setIsCreditCardExpanded(false)

                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-neutral-900">Direct Bank Transfer</span>
                  <Image src="/bank-transfer.svg" alt="Bank Transfer" width={20} height={20} className="object-contain" />
                </div>
                {isBankTransferExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* Bank Transfer Form */}
              {isBankTransferExpanded && (
                <div className="mt-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="space-y-6">
                    {/* Two Column Layout */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Account Holder Name</label>
                          <Input
                            type="text"
                            placeholder="Your full legal name"
                            value={bankTransferFormData.accountHolderName}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, accountHolderName: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Branch Name / Branch Code (optional)</label>
                          <Input
                            type="text"
                            placeholder="Branch name or code"
                            value={bankTransferFormData.branchName}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, branchName: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">SWIFT/BIC Code</label>
                          <Input
                            type="text"
                            placeholder="SWIFT/BIC code"
                            value={bankTransferFormData.swiftBicCode}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, swiftBicCode: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Billing Address</label>
                          <Input
                            type="text"
                            placeholder="Billing address"
                            value={bankTransferFormData.billingAddress}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, billingAddress: e.target.value })}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Bank Name</label>
                          <Input
                            type="text"
                            placeholder="Bank name"
                            value={bankTransferFormData.bankName}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, bankName: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Account Number / IBAN</label>
                          <Input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            value={bankTransferFormData.accountNumber}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, accountNumber: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Bank Address (optional)</label>
                          <Input
                            type="text"
                            placeholder="Bank's address"
                            value={bankTransferFormData.bankAddress}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, bankAddress: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-900 mb-2 block">Reference / Payment ID</label>
                          <Input
                            type="text"
                            placeholder="Reference / Payment ID"
                            value={bankTransferFormData.reference}
                            onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, reference: e.target.value })}
                            className="w-full"
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Set as Default Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="setBankTransferAsDefault"
                        checked={bankTransferFormData.setAsDefault}
                        onChange={(e) => setBankTransferFormData({ ...bankTransferFormData, setAsDefault: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-sky-600 focus:ring-sky-500 accent-yellow-400"
                      />
                      <label htmlFor="setBankTransferAsDefault" className="text-sm text-neutral-900 cursor-pointer">
                        Set as Default Payment Method
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={async () => {
                          const toastId = toast.loading("Saving bank account...")
                          try {
                            const payload = {
                              account_holder_name: bankTransferFormData.accountHolderName,
                              bank_name: bankTransferFormData.bankName,
                              account_number: bankTransferFormData.accountNumber,
                              branch_name: bankTransferFormData.branchName,
                              swift_bic_code: bankTransferFormData.swiftBicCode,
                              bank_address: bankTransferFormData.bankAddress,
                              billing_address: bankTransferFormData.billingAddress,
                              reference: bankTransferFormData.reference,
                              is_default: bankTransferFormData.setAsDefault
                            }

                            const response = await paymentMethodApi.addBankAccount(payload)
                            if (response.success) {
                              toast.success("Bank account added successfully!", { id: toastId })
                              setBankTransferFormData({
                                accountHolderName: "",
                                bankName: "",
                                accountNumber: "",
                                branchName: "",
                                swiftBicCode: "",
                                bankAddress: "",
                                billingAddress: "",
                                reference: "",
                                setAsDefault: true,
                              })
                              setIsAddPaymentModalOpen(false)
                              setIsBankTransferExpanded(false)
                              fetchPaymentMethods()
                            } else {
                              toast.error(response.message || "Failed to add bank account", { id: toastId })
                            }
                          } catch (error: any) {
                            toast.error(error.message || "An error occurred", { id: toastId })
                          }
                        }}
                        className="w-full !text-neutral-900 bg-yellow-500 hover:bg-yellow-400"
                      >
                        Submit Payment
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* View Payment Method Modal */}
        <Modal
          isOpen={isViewPaymentModalOpen}
          onClose={() => {
            setIsViewPaymentModalOpen(false)
            setSelectedPaymentMethod(null)
          }}
          title="Payment Method Details"
        >
          {selectedPaymentMethod && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-4">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">Card Type</label>
                  <div className="flex items-center gap-3">
                    {selectedPaymentMethod.type === "visa" ? (
                      <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-neutral-200">
                        <Image src="/visa.svg" alt="VISA" width={48} height={30} className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-neutral-200">
                        <Image src="/mastercard.svg" alt="Mastercard" width={48} height={30} className="object-contain" />
                      </div>
                    )}
                    <span className="text-base font-medium text-neutral-900 capitalize">
                      {selectedPaymentMethod.type}
                    </span>
                  </div>
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">Cardholder Name</label>
                  <p className="text-base font-medium text-neutral-900">
                    {selectedPaymentMethod.cardholderName || "N/A"}
                  </p>
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">Card Number</label>
                  <p className="text-base font-medium text-neutral-900">
                    *** *** *** {selectedPaymentMethod.lastFour}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">Expiry Date</label>
                  <p className="text-base font-medium text-neutral-900">
                    {selectedPaymentMethod.expiryDate || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">CVV / CVC</label>
                  <p className="text-base font-medium text-neutral-900">
                    {selectedPaymentMethod.cvv ? "***" : "N/A"}
                  </p>
                </div>
                <div className="col-span-4">
                  <label className="text-sm font-medium text-neutral-600 mb-2 block">Status</label>
                  {selectedPaymentMethod.isDefault ? (
                    <Badge className="bg-yellow-100 text-yellow-600">
                      Default Method
                    </Badge>
                  ) : (
                    <Badge className="bg-neutral-100 text-neutral-600">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewPaymentModalOpen(false)
                setSelectedPaymentMethod(null)
              }}
            >
              Close
            </Button>
            {selectedPaymentMethod && !selectedPaymentMethod.isDefault && (
              <Button
                onClick={() => {
                  handleMarkAsDefault(selectedPaymentMethod.id)
                  setIsViewPaymentModalOpen(false)
                  setSelectedPaymentMethod(null)
                }}
                className="bg-neutral-950 text-white hover:bg-neutral-900"
              >
                Set as Default
              </Button>
            )}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
