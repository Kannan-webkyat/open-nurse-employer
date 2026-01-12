"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Filter, X, CreditCard, Calendar } from "lucide-react"

interface BillingInvoice {
  id: string
  created_at: string
  paid_at: string
  due_date: string
  amount: string
  status: "paid" | "pending" | "overdue"
  payment_method: string
  description: string
}

// Mock data for demonstration
const mockBillingInvoices: BillingInvoice[] = [
  { id: "INV-001", created_at: "2025-01-10", paid_at: "2025-01-15", due_date: "2025-01-20", amount: "£200.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-002", created_at: "2025-01-15", paid_at: "2025-01-20", due_date: "2025-01-25", amount: "£350.00", status: "paid", payment_method: "Bank Transfer", description: "Premium Plan - Monthly" },
  { id: "INV-003", created_at: "2025-02-01", paid_at: "2025-02-01", due_date: "2025-02-10", amount: "£200.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-004", created_at: "2025-02-05", paid_at: "", due_date: "2025-02-15", amount: "£450.00", status: "pending", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-005", created_at: "2025-02-10", paid_at: "2025-02-10", due_date: "2025-02-20", amount: "£200.00", status: "paid", payment_method: "PayPal", description: "Premium Plan - Monthly" },
  { id: "INV-006", created_at: "2025-02-15", paid_at: "2025-02-15", due_date: "2025-02-25", amount: "£300.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-007", created_at: "2025-02-20", paid_at: "", due_date: "2025-03-01", amount: "£200.00", status: "overdue", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-008", created_at: "2025-03-01", paid_at: "2025-03-01", due_date: "2025-03-10", amount: "£500.00", status: "paid", payment_method: "Bank Transfer", description: "Premium Plan - Monthly" },
  { id: "INV-009", created_at: "2025-03-05", paid_at: "2025-03-05", due_date: "2025-03-15", amount: "£200.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-010", created_at: "2025-03-10", paid_at: "2025-03-10", due_date: "2025-03-20", amount: "£250.00", status: "paid", payment_method: "PayPal", description: "Premium Plan - Monthly" },
  { id: "INV-011", created_at: "2025-03-15", paid_at: "", due_date: "2025-03-25", amount: "£200.00", status: "pending", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-012", created_at: "2025-03-20", paid_at: "2025-03-20", due_date: "2025-03-30", amount: "£400.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-013", created_at: "2025-04-01", paid_at: "2025-04-01", due_date: "2025-04-10", amount: "£200.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-014", created_at: "2025-04-05", paid_at: "2025-04-05", due_date: "2025-04-15", amount: "£350.00", status: "paid", payment_method: "Bank Transfer", description: "Premium Plan - Monthly" },
  { id: "INV-015", created_at: "2025-04-10", paid_at: "", due_date: "2025-04-20", amount: "£200.00", status: "pending", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-016", created_at: "2025-04-15", paid_at: "2025-04-15", due_date: "2025-04-25", amount: "£600.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-017", created_at: "2025-04-20", paid_at: "2025-04-20", due_date: "2025-04-30", amount: "£200.00", status: "paid", payment_method: "PayPal", description: "Premium Plan - Monthly" },
  { id: "INV-018", created_at: "2025-05-01", paid_at: "", due_date: "2025-05-10", amount: "£300.00", status: "pending", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-019", created_at: "2025-05-05", paid_at: "2025-05-05", due_date: "2025-05-15", amount: "£200.00", status: "paid", payment_method: "Credit Card", description: "Premium Plan - Monthly" },
  { id: "INV-020", created_at: "2025-05-10", paid_at: "2025-05-10", due_date: "2025-05-20", amount: "£450.00", status: "paid", payment_method: "Bank Transfer", description: "Premium Plan - Monthly" },
]

const statusVariantMap = {
  paid: "paid",
  pending: "pending",
  overdue: "rejected",
} as const

const statusLabels = {
  paid: "Paid",
  pending: "Pending",
  overdue: "Overdue",
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Parse amount to number for calculations
const parseAmount = (amount: string): number => {
  return parseFloat(amount.replace(/[£,]/g, '')) || 0
}

export default function BillingSummaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "pending" | "overdue">("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter, paymentMethodFilter].filter(v => v !== "").length

  // Filter invoices based on search, date range, status, and payment method
  const filteredInvoices = mockBillingInvoices.filter((invoice) => {
    // Search filter - matches Invoice ID or Description
    const matchesSearch = 
      !searchQuery ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter - check if paid_at or created_at falls within range
    const dateToCheck = invoice.paid_at || invoice.created_at
    const matchesDateFrom = !dateFrom || dateToCheck >= dateFrom
    const matchesDateTo = !dateTo || dateToCheck <= dateTo
    
    // Status filter
    const matchesStatus = !statusFilter || invoice.status === statusFilter
    
    // Payment method filter
    const matchesPaymentMethod = !paymentMethodFilter || invoice.payment_method === paymentMethodFilter
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus && matchesPaymentMethod
  })

  // Calculate summary statistics
  const totalInvoices = filteredInvoices.length
  const paidInvoices = filteredInvoices.filter(i => i.status === "paid").length
  const pendingInvoices = filteredInvoices.filter(i => i.status === "pending").length
  const overdueInvoices = filteredInvoices.filter(i => i.status === "overdue").length
  const totalAmount = filteredInvoices.reduce((sum, i) => sum + parseAmount(i.amount), 0)
  const paidAmount = filteredInvoices
    .filter(i => i.status === "paid")
    .reduce((sum, i) => sum + parseAmount(i.amount), 0)
  const pendingAmount = filteredInvoices
    .filter(i => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + parseAmount(i.amount), 0)

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = filteredInvoices.map(invoice => ({
      "Invoice ID": invoice.id,
      "Created At": formatDate(invoice.created_at),
      "Paid At": formatDate(invoice.paid_at),
      "Due Date": formatDate(invoice.due_date),
      "Amount": invoice.amount,
      "Status": statusLabels[invoice.status],
      "Payment Method": invoice.payment_method,
      "Description": invoice.description,
    }))

    // Convert to CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(","),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row]
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(",")
      )
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    const today = new Date().toISOString().split("T")[0]
    link.setAttribute("href", url)
    link.setAttribute("download", `billing_summary_${today}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Reset to first page when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setCurrentPage(1)
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as typeof statusFilter)
    setCurrentPage(1)
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodFilter(value)
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setStatusFilter("")
    setPaymentMethodFilter("")
    setCurrentPage(1)
  }

  // Get unique payment methods
  const paymentMethods = Array.from(new Set(mockBillingInvoices.map(i => i.payment_method)))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing Summary</h1>
            <p className="text-neutral-600">View and export comprehensive billing summary report</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
            disabled={filteredInvoices.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-neutral-900">{totalInvoices}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Paid</div>
            <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Overdue</div>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-neutral-900">£{totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">£{paidAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-neutral-200 p-4">
          <div className="flex gap-4 flex-wrap">
            {/* Search Field */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by Invoice ID or Description..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2">
              <Input
                ref={dateFromRef}
                type="date"
                placeholder="From Date"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
                onClick={(e) => {
                  e.currentTarget.showPicker?.()
                }}
                className="cursor-pointer"
              />
              <span className="text-neutral-400">to</span>
              <Input
                ref={dateToRef}
                type="date"
                placeholder="To Date"
                value={dateTo}
                onChange={(e) => handleDateToChange(e.target.value)}
                onClick={(e) => {
                  e.currentTarget.showPicker?.()
                }}
                className="cursor-pointer"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm focus:ring-0 focus:outline-none focus:border-sky-700 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-2">
              <select
                value={paymentMethodFilter}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm focus:ring-0 focus:outline-none focus:border-sky-700 cursor-pointer"
              >
                <option value="">All Methods</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Filter and Clear buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline" 
                className="bg-white border-neutral-300 text-neutral-700 relative">
                <Filter className="w-4 h-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-2 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Paid At</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="text-neutral-800 font-medium">
                      {invoice.id}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {formatDate(invoice.created_at)}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {formatDate(invoice.paid_at)}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {formatDate(invoice.due_date)}
                    </TableCell>
                    <TableCell className="text-neutral-800 font-medium">
                      {invoice.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-neutral-400" />
                        {invoice.payment_method}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {invoice.description}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredInvoices.length > 0 && (
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
