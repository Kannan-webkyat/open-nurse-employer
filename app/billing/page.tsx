"use client"

import { useState } from "react"
import Image from "next/image"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { CreditCard, ChevronRight, Download, ChevronDown, Building2, ChevronUp } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"

interface PaymentMethod {
  id: number
  type: "visa" | "mastercard"
  lastFour: string
  isDefault: boolean
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
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethod[]>(paymentMethods)
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false)
  const [isViewPaymentModalOpen, setIsViewPaymentModalOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [isCreditCardExpanded, setIsCreditCardExpanded] = useState(false)
  const [isPayPalExpanded, setIsPayPalExpanded] = useState(false)
  const [isBankTransferExpanded, setIsBankTransferExpanded] = useState(false)
  const [cardFormData, setCardFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    setAsDefault: true,
  })
  const [paypalFormData, setPaypalFormData] = useState({
    setAsDefault: false,
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

  const handleMarkAsDefault = (id: number) => {
    setPaymentMethodsList(prev =>
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const handleViewPaymentMethod = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    setIsViewPaymentModalOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing & Subscriptions</h1>
          <p className="text-neutral-600">Manage your subscription, payments, and invoices</p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between border-b border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Current Subscription</h2>
            <Badge variant="active">Active</Badge>
          </div>
          <div className="grid grid-cols-3 gap-6 p-6">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Plan</p>
              <p className="text-base font-medium text-neutral-900">Premium</p>
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
                  {method.type === "visa" ? (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <Image src="/visa.svg" alt="VISA" width={40} height={24} className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center">
                      <Image src="/mastercard.svg" alt="Mastercard" width={40} height={24} className="object-contain" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      *** *** *** {method.lastFour}
                    </p>
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
              {invoices.map((invoice, index) => (
                <TableRow key={`${invoice.id}-${index}`}>
                  <TableCell className="text-neutral-800">{invoice.id}</TableCell>
                  <TableCell className="text-neutral-800">{invoice.paidAt}</TableCell>
                  <TableCell className="text-neutral-800">{invoice.amount}</TableCell>
                  <TableCell>
                    {invoice.status === "paid" ? (
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
              ))}
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
                onClick={() => {
                  setIsCreditCardExpanded(!isCreditCardExpanded)
                  setIsPayPalExpanded(false)
                  setIsBankTransferExpanded(false)
                }}
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
                  <div className="space-y-6">


                    {/* Two Column Layout */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Cardholder Name */}
                      <div>
                        <label className="text-sm font-medium text-neutral-900 mb-2 block">Cardholder Name</label>
                        <Input
                          type="text"
                          placeholder="Your name"
                          value={cardFormData.cardholderName}
                          onChange={(e) => setCardFormData({ ...cardFormData, cardholderName: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      {/* Card Number */}
                      <div>
                        <label className="text-sm font-medium text-neutral-900 mb-2 block">Card Number</label>
                        <Input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          value={cardFormData.cardNumber}
                          onChange={(e) => setCardFormData({ ...cardFormData, cardNumber: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      {/* Expiry Date */}
                      <div>
                        <label className="text-sm font-medium text-neutral-900 mb-2 block">Expiry Date</label>
                        <Input
                          type="text"
                          placeholder="MM / YY"
                          value={cardFormData.expiryDate}
                          onChange={(e) => setCardFormData({ ...cardFormData, expiryDate: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      {/* CVV / CVC */}
                      <div>
                        <label className="text-sm font-medium text-neutral-900 mb-2 block">CVV / CVC</label>
                        <Input
                          type="text"
                          placeholder="CVV / CVC"
                          value={cardFormData.cvv}
                          onChange={(e) => setCardFormData({ ...cardFormData, cvv: e.target.value })}
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Set as Default Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="setAsDefault"
                        checked={cardFormData.setAsDefault}
                        onChange={(e) => setCardFormData({ ...cardFormData, setAsDefault: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-sky-600 focus:ring-sky-500 accent-yellow-400"
                      />
                      <label htmlFor="setAsDefault" className="text-sm text-neutral-900 cursor-pointer">
                        Set as Default Payment Method
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-2">
                      <Button
                        onClick={() => {
                          const cardNumber = cardFormData.cardNumber.replace(/\s/g, "")
                          const lastFour = cardNumber.length >= 4 ? cardNumber.slice(-4) : ""
                          const cardType = cardNumber.startsWith("4") ? "visa" : "mastercard"
                          const newMethod: PaymentMethod = {
                            id: Date.now(),
                            type: cardType,
                            lastFour: lastFour,
                            isDefault: cardFormData.setAsDefault,
                            cardholderName: cardFormData.cardholderName,
                            cardNumber: cardNumber,
                            expiryDate: cardFormData.expiryDate,
                            cvv: cardFormData.cvv,
                          }
                          setPaymentMethodsList(prev => [...prev, newMethod])
                          setCardFormData({
                            cardholderName: "",
                            cardNumber: "",
                            expiryDate: "",
                            cvv: "",
                            setAsDefault: true,
                          })
                          setIsAddPaymentModalOpen(false)
                          setIsCreditCardExpanded(false)
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

            {/* PayPal Option */}
            <div>
              <button
                className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
                onClick={() => {
                  setIsPayPalExpanded(!isPayPalExpanded)
                  setIsCreditCardExpanded(false)
                  setIsBankTransferExpanded(false)
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-neutral-900">PayPal</span>
                  <div className="w-16 h-6 bg-white rounded flex items-center justify-center border border-neutral-200 px-2">
                    <Image src="/paypal.svg" alt="PayPal" width={48} height={20} className="object-contain" />
                  </div>
                </div>
                {isPayPalExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* PayPal Form */}
              {isPayPalExpanded && (
                <div className="mt-4 p-6 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div className="space-y-6">
                    {/* Pay with PayPal Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={() => {
                          // TODO: Handle PayPal payment redirect
                          console.log("Redirecting to PayPal")
                          setIsAddPaymentModalOpen(false)
                          setIsPayPalExpanded(false)
                        }}
                        className="w-full !text-neutral-900 bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center gap-2"
                      >
                        <span>Pay with</span>
                        <Image src="/paypal.svg" alt="PayPal" width={60} height={24} className="object-contain" />
                      </Button>
                    </div>

                    {/* Set as Default Checkbox */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="setPayPalAsDefault"
                        checked={paypalFormData.setAsDefault}
                        onChange={(e) => setPaypalFormData({ ...paypalFormData, setAsDefault: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500 accent-yellow-400 focus:accent-yellow-400"
                      />
                      <label htmlFor="setPayPalAsDefault" className="text-sm text-neutral-900 cursor-pointer">
                        Set as Default Payment Method
                      </label>
                    </div>

                    {/* Redirect Message */}
                    <p className="text-sm text-neutral-600 text-left">
                      You&apos;ll be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
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
                  setIsPayPalExpanded(false)
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
                        onClick={() => {
                          // TODO: Handle bank transfer submission
                          console.log("Submitting bank transfer:", bankTransferFormData)
                          setIsAddPaymentModalOpen(false)
                          setIsBankTransferExpanded(false)
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
