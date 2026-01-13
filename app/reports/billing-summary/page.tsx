"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Filter, X, CreditCard, Calendar, Loader2, FileText, ChevronDown, Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react"
import { reportsApi } from "@/lib/api"

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

  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Export handlers
  const handleExportCSV = async () => {
    if (filteredInvoices.length === 0) return
    
    try {
        const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter,
            payment_method: paymentMethodFilter
        }
        await reportsApi.exportBillingSummaryCSV(params)
        setShowExportMenu(false)
    } catch (error) {
        console.error("Export failed", error)
    }
  }

  const handleExportExcel = async () => {
    if (filteredInvoices.length === 0) return

    try {
        const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter,
            payment_method: paymentMethodFilter
        }
        await reportsApi.exportBillingSummaryExcel(params)
        setShowExportMenu(false)
    } catch (error) {
         console.error("Export failed", error)
    }
  }

  const handleExportPDF = async () => {
    if (filteredInvoices.length === 0) return

    try {
        const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter,
            payment_method: paymentMethodFilter
        }
        await reportsApi.exportBillingSummaryPDF(params)
        setShowExportMenu(false)
    } catch (error) {
         console.error("Export failed", error)
    }
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

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
    setStatusFilter("")
    setPaymentMethodFilter("")
    setCurrentPage(1)
    // Note: Search and Date are now in the header, we prefer not to clear them with the 'Reset Filters' pill button unless requested
  }

  // Get unique payment methods
  const paymentMethods = Array.from(new Set(mockBillingInvoices.map(i => i.payment_method)))

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        
        {/* Modern Unified Header with Gradient */}
        <div className="relative z-20 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 pointer-events-none rounded-xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    Billing Summary
                </h1>
                <p className="text-xs text-neutral-500 mt-1">Comprehensive billing overview & history</p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
                 {/* Search Input */}
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-64 transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-neutral-200 shadow-sm">
                    <div className="px-2 border-r border-neutral-200">
                        <Calendar className="w-4 h-4 text-neutral-400" />
                    </div>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => handleDateFromChange(e.target.value)}
                        className="bg-transparent border-none text-sm text-neutral-700 focus:ring-0 p-1 w-32 outline-none"
                    />
                    <span className="text-neutral-300 text-xs">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => handleDateToChange(e.target.value)}
                        className="bg-transparent border-none text-sm text-neutral-700 focus:ring-0 p-1 w-32 outline-none"
                    />
                </div>

                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={filteredInvoices.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-neutral-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            {['CSV', 'Excel', 'PDF'].map((type) => (
                                <button
                                    key={type}
                                    onClick={type === 'CSV' ? handleExportCSV : type === 'Excel' ? handleExportExcel : handleExportPDF}
                                    className="w-full text-left px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                                >
                                    Export as {type}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Floating Gradient Metric Cards */}
        <div className="space-y-4">
             {/* Pill Filters */}
             <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 border border-neutral-200 rounded-full bg-white text-xs font-medium text-neutral-600 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer hover:border-neutral-300 transition-colors shadow-sm"
                    >
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                </div>

                 <div className="relative">
                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => handlePaymentMethodChange(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 border border-neutral-200 rounded-full bg-white text-xs font-medium text-neutral-600 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer hover:border-neutral-300 transition-colors shadow-sm"
                    >
                        <option value="">All Methods</option>
                        {paymentMethods.map(method => (
                           <option key={method} value={method}>{method}</option>
                         ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                </div>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium hover:bg-neutral-200 transition-colors"
                    >
                        <X className="w-3 h-3" />
                        Reset Filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {/* Total Invoices */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-indigo-700 transition-colors">Total</p>
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{totalInvoices}</h3>
                        </div>
                    </div>
                </div>

                {/* Paid Invoices */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-emerald-100 transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/60 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-emerald-700 transition-colors">Paid</p>
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{paidInvoices}</h3>
                        </div>
                    </div>
                </div>

                {/* Pending Invoices */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-amber-100 transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-amber-50/60 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 group-hover:border-amber-200 transition-all duration-300">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-amber-700 transition-colors">Pending</p>
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{pendingInvoices}</h3>
                        </div>
                    </div>
                </div>

                {/* Overdue Invoices */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-red-100 transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-red-50/60 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/20 to-red-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 group-hover:border-red-200 transition-all duration-300">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-red-700 transition-colors">Overdue</p>
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{overdueInvoices}</h3>
                        </div>
                    </div>
                </div>

                {/* Total Amount */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-neutral-200 transition-all duration-300 group col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-neutral-100/80 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-100/40 to-neutral-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Value</p>
                        <h3 className="text-lg font-bold text-neutral-900 leading-none">£{totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                    </div>
                </div>

                {/* Paid Amount */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-emerald-200 transition-all duration-300 group col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/30 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                     <div className="relative z-10">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Collected</p>
                        <h3 className="text-lg font-bold text-emerald-700 leading-none">£{paidAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-6">Invoice</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Paid / Due</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Method</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInvoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                        No invoices found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-6 py-4">
                            <span className="font-mono text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{invoice.id}</span>
                        </TableCell>
                         <TableCell className="text-neutral-600 text-sm">
                          {formatDate(invoice.created_at)}
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col text-xs">
                                <span className="text-neutral-600">Paid: {invoice.paid_at ? formatDate(invoice.paid_at) : '—'}</span>
                                <span className="text-neutral-400">Due: {formatDate(invoice.due_date)}</span>
                           </div>
                        </TableCell>
                        <TableCell className="text-neutral-900 font-semibold text-sm">
                          {invoice.amount}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[invoice.status]} className="capitalize shadow-none">
                            {statusLabels[invoice.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2 text-neutral-600 text-sm">
                                <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                                {invoice.payment_method}
                           </div>
                        </TableCell>
                        <TableCell className="text-neutral-600 text-sm max-w-[200px] truncate">
                          {invoice.description}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredInvoices.length > 0 && (
              <div className="border-t border-neutral-100 bg-white p-4">
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
               </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  )
}
