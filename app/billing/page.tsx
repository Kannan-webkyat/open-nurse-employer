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
import { CreditCard, ChevronRight, Download, ChevronDown, Building2, ChevronUp, Loader2 } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { paymentMethodApi, paymentApi, subscriptionApi } from "@/lib/api"
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
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<any[]>([])

  // Check if Stripe is configured
  const isStripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  // Initialize Stripe Setup Intent when Modal Opens
  useEffect(() => {
    if (isAddPaymentModalOpen && !paymentUrl) {
      const initializeStripe = async () => {
        try {
          // setIsLoading(true) // Optional: separate loading state for the modal
          const response = await paymentMethodApi.createSetupIntent()

          if (response.success && response.data) {
            setPaymentUrl(response.data.url)
            setPaymentClientSecret(response.data.client_secret)
          } else {
            toast.error("Failed to initialize payment method setup")
          }
        } catch (error) {
          toast.error("Failed to initialize payment method setup")
        } finally {
          setIsLoading(false)
        }
      }

      initializeStripe()
    }
    
    // Cleanup when modal closes
    if (!isAddPaymentModalOpen) {
        setPaymentUrl(null)
        setPaymentClientSecret(null)
    }
  }, [isAddPaymentModalOpen])

  // Fetch payment methods on mount
  useEffect(() => {
    if (isStripeConfigured) {
      console.log("Stripe Publishable Key:", process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      fetchPaymentMethods()
      fetchSubscription()
      fetchTransactions()
    } else {
      console.warn("Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local")
    }

    // Check for payment return status
    const params = new URLSearchParams(window.location.search)
    const status = params.get('payment_status')
    const sessionId = params.get('session_id')
    const mode = params.get('mode')

    console.log("Payment Verification Params:", { status, sessionId, mode })

    if (status === 'success' && sessionId) {
      if (mode === 'setup') {
        toast.success("Payment method added successfully!")
        fetchPaymentMethods()
        window.history.replaceState({}, '', window.location.pathname)
        return
      }

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
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await subscriptionApi.getCurrentSubscription()
      if (response.success && response.data) {
        setCurrentSubscription(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    }
  }

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
      const response = await paymentMethodApi.getAll()

      if (response.success && response.data) {
        setPaymentMethodsList(response.data.map((pm: any) => ({
          id: pm.id,
          type: pm.card_brand ? pm.card_brand.toLowerCase() : "card",
          lastFour: pm.card_last_four,
          isDefault: pm.is_default,
          isBank: false,
          cardholderName: pm.cardholderName, // Backend doesn't send this yet but safe to map
          expiryDate: pm.expiry_month && pm.expiry_year ? `${pm.expiry_month}/${pm.expiry_year}` : undefined
        })))
      } else {
        setPaymentMethodsList([])
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error)
      setPaymentMethodsList([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsDefault = async (id: any) => {
    try {
      const response = await paymentMethodApi.setDefault(id);

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

  const handleDeletePaymentMethod = async (id: any) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return
    }

    try {
      const response = await paymentMethodApi.delete(id);

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

  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownloadInvoice = async (invoiceId: string) => {
    if (downloadingId === invoiceId) return;
    
    setDownloadingId(invoiceId)
    try {
      // Optimistic check, though backend also validates
      const txn = transactions.find(t => t.id === invoiceId)
      
      const validStatuses = ['paid', 'succeeded', 'active']
      if (txn && !validStatuses.includes(txn.status.toLowerCase())) {
         toast.error("Invoice is available only for successful payments", { id: "download-invoice" })
         setDownloadingId(null)
         return
      }

      toast.loading("Downloading invoice...", { id: "download-invoice" })
      const response = await paymentApi.downloadInvoice(invoiceId)
      
      if (response.success) {
        toast.success("Invoice downloaded successfully", { id: "download-invoice" })
        // Refresh transactions to show the new Invoice ID if it was just generated
        fetchTransactions()
      } else {
        toast.error(response.error || "Failed to download invoice", { id: "download-invoice" })
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.error("An error occurred while downloading", { id: "download-invoice" })
    } finally {
        setDownloadingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "succeeded":
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "pending":
      case "incomplete":
        return "bg-amber-50 text-amber-700 border-amber-100"
      case "failed":
      case "canceled":
      case "past_due":
        return "bg-rose-50 text-rose-700 border-rose-100"
      default:
        return "bg-slate-50 text-slate-700 border-slate-100"
    }
  }

  // Helper to format currency
  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    });
    return formatter.format(amount);
  }

  const handleStripeOnlineSuccess = async (paymentIntentId: string) => {
    toast.success("Payment completed successfully!")
    setIsAddPaymentModalOpen(false)
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
            <Badge variant={currentSubscription?.status === 'active' ? 'active' : 'default'}>
              {currentSubscription?.status ? currentSubscription.status.charAt(0).toUpperCase() + currentSubscription.status.slice(1) : 'Inactive'}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-6 p-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-medium text-neutral-900">{currentSubscription?.plan?.name || 'No Plan'}</p>
                <Link href="/plans" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                  Change
                </Link>
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Nurse Slots Limit</p>
              <p className="text-base font-medium text-neutral-900">
                {currentSubscription?.plan?.nurse_slots || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-1">Billing Cycle</p>
              <p className="text-base font-medium text-neutral-900">
                {currentSubscription?.billing_cycle ? currentSubscription.billing_cycle.charAt(0).toUpperCase() + currentSubscription.billing_cycle.slice(1) : '-'}
              </p>
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
                <TableHead className="w-[180px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <TableRow key={`${txn.id}-${index}`}>
                    <TableCell className="text-neutral-800 font-medium">
                      {new Date(txn.paid_at || txn.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-neutral-900 font-medium">
                          {txn.description || (txn.type === 'subscription' ? 'Subscription' : 'Payment')}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono mt-0.5">
                          ID: {txn.invoice_number || (txn.invoice_id ? txn.invoice_id.substring(0, 14) + '...' : txn.id)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {txn.currency?.toUpperCase() === 'GBP' ? '£' : (txn.currency === 'usd' ? '$' : txn.currency?.toUpperCase() + ' ')}
                      {txn.amount}
                    </TableCell>
                    <TableCell>
                      {txn.status === "paid" || txn.status === "active" ? (
                        <Badge variant="default" className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 shadow-none font-normal">
                          Paid
                        </Badge>
                      ) : txn.status === "pending" || txn.status === "incomplete" ? (
                        <Badge variant="default" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200 shadow-none font-normal">
                          Pending
                        </Badge>
                      ) : txn.status === "failed" || txn.status === "canceled" || txn.status === "rejected" ? (
                        <Badge variant="default" className="bg-red-50 text-red-700 hover:bg-red-50 border-red-200 shadow-none font-normal">
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="font-normal text-neutral-500 bg-transparent border border-neutral-200 shadow-none hover:bg-neutral-50">
                          {txn.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`h-9 w-9 p-0 rounded-full transition-all duration-200 ${
                          ['paid', 'succeeded', 'active', 'trialing', 'canceled'].includes(txn.status.toLowerCase()) 
                            ? "bg-gradient-to-b from-white to-slate-50 border border-slate-200 text-slate-600 shadow-sm hover:from-blue-50 hover:to-white hover:text-blue-600 hover:border-blue-300 hover:shadow-md" 
                            : "text-gray-300 cursor-not-allowed bg-transparent"
                        }`}
                        onClick={() => handleDownloadInvoice(txn.id)}
                        disabled={downloadingId === txn.id || !['paid', 'succeeded', 'active', 'trialing', 'canceled'].includes(txn.status.toLowerCase())}
                        title={['paid', 'succeeded', 'active', 'trialing', 'canceled'].includes(txn.status.toLowerCase()) ? "Download Invoice" : "Invoice unavailable"}
                      >
                        {downloadingId === txn.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
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
          description="Add a payment method via Stripe to continue your subscription."
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
            {/* Stripe Online Payment Option - Now the ONLY option */}
            <div>
              <div className="p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-base font-medium text-neutral-900">Stripe Online Payment</span>
                    <div className="flex items-center gap-2 bg-white rounded px-2 py-1 border border-neutral-200">
                      <svg className="w-12 h-4" viewBox="0 0 60 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.87V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9.1h-3.13v5.85zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.53-.24 1.53-1C6.26 13.77 0 14.51 0 9.95 0 7.04 2.28 5.3 5.62 5.3c1.36 0 2.72.2 4.09.75v3.88a9.23 9.23 0 0 0-4.1-1.06c-.86 0-1.44.25-1.44.9 0 1.85 6.29.97 6.29 5.88z" fill="#635BFF" />
                      </svg>
                    </div>
                  </div>

                  {/* Always Visible Stripe Payment Form */}
                  {paymentUrl ? (
                    <StripeOnlinePayment
                      checkoutUrl={paymentUrl}
                      mode="setup"
                      onSuccess={() => handleStripeOnlineSuccess("")}
                      onCancel={() => {
                        // Do nothing or maybe show a message
                      }}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                      <p className="text-neutral-600 text-sm">Initializing secure payment...</p>
                    </div>
                  )}
              </div>
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
            <div className="py-2">
              <div className="flex items-center gap-4 p-4 border border-neutral-200 rounded-lg bg-neutral-50 mb-6">
                <div className="w-16 h-10 bg-white rounded flex items-center justify-center border border-neutral-200 shadow-sm shrink-0">
                  {selectedPaymentMethod.type === "visa" ? (
                    <Image src="/visa.svg" alt="VISA" width={48} height={30} className="object-contain" />
                  ) : (
                    <Image src="/mastercard.svg" alt="Mastercard" width={48} height={30} className="object-contain" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-lg tracking-wide">
                    •••• •••• •••• {selectedPaymentMethod.lastFour}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-0.5">
                    <span className="capitalize">{selectedPaymentMethod.type}</span>
                    <span>•</span>
                    <span>Expires {selectedPaymentMethod.expiryDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-neutral-600">Payment Status</span>
                {selectedPaymentMethod.isDefault ? (
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200 shadow-none">
                    Default Method
                  </Badge>
                ) : (
                  <Badge className="bg-neutral-100 text-neutral-600 hover:bg-neutral-100 border-neutral-200 shadow-none">
                    Active
                  </Badge>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 mt-6">
            <Button
              variant="outline"
              className="mr-auto bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
              onClick={() => {
                if (selectedPaymentMethod) {
                  handleDeletePaymentMethod(selectedPaymentMethod.id)
                }
              }}
            >
              Delete
            </Button>
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
