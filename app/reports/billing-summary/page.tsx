"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Calendar, Filter, X } from "lucide-react"

interface BillingInvoice {
  id: string
  paid_at: string
  amount: string
  status: "paid" | "pending"
}

// Mock data for demonstration
const mockBillingInvoices: BillingInvoice[] = [
  { id: "INV-001", paid_at: "2025-01-15", amount: "£200.00", status: "paid" },
  { id: "INV-002", paid_at: "2025-01-20", amount: "£350.00", status: "paid" },
  { id: "INV-003", paid_at: "2025-02-01", amount: "£200.00", status: "paid" },
  { id: "INV-004", paid_at: "2025-02-05", amount: "£450.00", status: "pending" },
  { id: "INV-005", paid_at: "2025-02-10", amount: "£200.00", status: "paid" },
  { id: "INV-006", paid_at: "2025-02-15", amount: "£300.00", status: "paid" },
  { id: "INV-007", paid_at: "2025-02-20", amount: "£200.00", status: "pending" },
  { id: "INV-008", paid_at: "2025-03-01", amount: "£500.00", status: "paid" },
  { id: "INV-009", paid_at: "2025-03-05", amount: "£200.00", status: "paid" },
  { id: "INV-010", paid_at: "2025-03-10", amount: "£250.00", status: "paid" },
  { id: "INV-011", paid_at: "2025-03-15", amount: "£200.00", status: "pending" },
  { id: "INV-012", paid_at: "2025-03-20", amount: "£400.00", status: "paid" },
  { id: "INV-013", paid_at: "2025-04-01", amount: "£200.00", status: "paid" },
  { id: "INV-014", paid_at: "2025-04-05", amount: "£350.00", status: "paid" },
  { id: "INV-015", paid_at: "2025-04-10", amount: "£200.00", status: "pending" },
  { id: "INV-016", paid_at: "2025-04-15", amount: "£600.00", status: "paid" },
  { id: "INV-017", paid_at: "2025-04-20", amount: "£200.00", status: "paid" },
  { id: "INV-018", paid_at: "2025-05-01", amount: "£300.00", status: "pending" },
  { id: "INV-019", paid_at: "2025-05-05", amount: "£200.00", status: "paid" },
  { id: "INV-020", paid_at: "2025-05-10", amount: "£450.00", status: "paid" },
]

const statusVariantMap = {
  paid: "paid",
  pending: "pending",
} as const

const statusLabels = {
  paid: "Paid",
  pending: "Pending",
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BillingSummaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "paid" | "pending">("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter].filter(v => v !== "").length

  // Filter invoices based on search, date range and status
  const filteredInvoices = mockBillingInvoices.filter((invoice) => {
    // Search filter - matches Invoice ID
    const matchesSearch = 
      !searchQuery ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter - check if paid_at falls within range
    const matchesDateFrom = !dateFrom || invoice.paid_at >= dateFrom
    const matchesDateTo = !dateTo || invoice.paid_at <= dateTo
    
    // Status filter
    const matchesStatus = !statusFilter || invoice.status === statusFilter
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus
  })

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
      "Paid at": formatDate(invoice.paid_at),
      "Amount": invoice.amount,
      "Status": statusLabels[invoice.status],
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setStatusFilter("")
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Billing Summary</h1>
            <p className="text-neutral-600">View and export billing summary report</p>
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

        {/* Filters */}
        <div className="">
          <div className="flex  gap-4 flex-wrap">
            {/* Search Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by Invoice ID..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Paid at Date Range */}
            <div className="flex items-center gap-2">
                {/* <span className="text-neutral-400 text-sm pl-2">Paid at</span> */}
              <Input
                ref={dateFromRef}
                type="date"
                placeholder="Paid at (From)"
                value={dateFrom}
                onChange={(e) => handleDateFromChange(e.target.value)}
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
                <TableHead>Paid at</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
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
                      {formatDate(invoice.paid_at)}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {invoice.amount}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[invoice.status]}>
                        {statusLabels[invoice.status]}
                      </Badge>
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
