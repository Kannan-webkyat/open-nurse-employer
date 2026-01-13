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
  const [invoices, setInvoices] = useState<{
    id: string
    date: string
    amount: string | number
    status: string
    payment_method: string
    description: string
  }[]>([])
  
  const [summary, setSummary] = useState({
    total_invoices: 0,
    paid_invoices: 0,
    pending_invoices: 0,
    overdue_invoices: 0,
    total_amount: 0,
    paid_amount: 0,
  })

  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  })

  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "pending" | "overdue">("")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Fetch Data
  const fetchBillingSummary = async () => {
    setIsLoading(true)
    try {
      const params = {
        search: searchQuery,
        date_from: dateFrom,
        date_to: dateTo,
        status: statusFilter,
        payment_method: paymentMethodFilter,
        page: pagination.current_page,
        per_page: pagination.per_page,
      }
      
      const response = await reportsApi.getBillingSummary(params)
      
      if (response.success && response.data) {
        setInvoices(response.data.invoices || [])
        setSummary(response.data.summary || {
            total_invoices: 0,
            paid_invoices: 0,
            pending_invoices: 0,
            overdue_invoices: 0,
            total_amount: 0,
            paid_amount: 0,
        })
        if (response.data.pagination) {
            setPagination(prev => ({
                ...prev,
                ...response.data.pagination
            }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch billing summary:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial Fetch & Filter Effects
  useEffect(() => {
    const timer = setTimeout(() => {
        fetchBillingSummary()
    }, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [searchQuery, dateFrom, dateTo, statusFilter, paymentMethodFilter, pagination.current_page, pagination.per_page])

  // Click Outside Export Menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }
    if (showExportMenu) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showExportMenu])

  // Handlers
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }))
  }

  const handleRowsPerPageChange = (rows: number) => {
    setPagination(prev => ({ ...prev, per_page: rows, current_page: 1 }))
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleDateFromChange = (value: string) => {
    setDateFrom(value)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleDateToChange = (value: string) => {
    setDateTo(value)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as any)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethodFilter(value)
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const clearFilters = () => {
    setStatusFilter("")
    setPaymentMethodFilter("")
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  // Export handlers
  const handleExportCSV = async () => {
    try {
        const params = {
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
    try {
        const params = {
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
    try {
        const params = {
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

  // Active filter count
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter, paymentMethodFilter].filter(v => v !== "").length

  // Helper for Payment Methods options (static for now or fetched could be better, but "Card" is main one)
  const paymentMethods = ["Card", "Bank Transfer"]

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
                        disabled={invoices.length === 0}
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
                        <option value="succeeded">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Overdue/Failed</option>
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
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.total_invoices}</h3>
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
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.paid_invoices}</h3>
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
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.pending_invoices}</h3>
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
                            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-red-700 transition-colors">Failed</p>
                            <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.overdue_invoices}</h3>
                        </div>
                    </div>
                </div>

                {/* Total Amount */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-neutral-200 transition-all duration-300 group col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-neutral-100/80 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-neutral-100/40 to-neutral-200/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Total Value</p>
                        <h3 className="text-lg font-bold text-neutral-900 leading-none">£{summary.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                    </div>
                </div>

                {/* Paid Amount */}
                <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-emerald-200 transition-all duration-300 group col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/30 opacity-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                     <div className="relative z-10">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Collected</p>
                        <h3 className="text-lg font-bold text-emerald-700 leading-none">£{summary.paid_amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto min-h-[400px]">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-6">Invoice ID</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Method</TableHead>
                    <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="pl-6"><div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 w-32 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 w-16 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-6 w-20 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 w-24 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                            <TableCell><div className="h-4 w-48 bg-neutral-100 rounded animate-pulse"></div></TableCell>
                        </TableRow>
                     ))
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-neutral-400 text-sm">
                        No invoices found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-6 py-4">
                            <span className="font-mono text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded">#{invoice.id}</span>
                        </TableCell>
                         <TableCell className="text-neutral-600 text-sm">
                          {invoice.date}
                        </TableCell>
                        <TableCell className="text-neutral-900 font-semibold text-sm">
                          £{parseFloat(invoice.amount.toString()).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                                invoice.status === 'succeeded' ? 'paid' : 
                                invoice.status === 'pending' ? 'pending' : 'rejected'
                            } className="capitalize shadow-none">
                            {invoice.status === 'succeeded' ? 'Paid' : invoice.status}
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

            {invoices.length > 0 && (
              <div className="border-t border-neutral-100 bg-white p-4">
                <TablePagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.last_page}
                    rowsPerPage={pagination.per_page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                />
               </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  )
}
