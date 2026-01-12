"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Download, Filter, X, Search, Users, Calendar, Loader2 } from "lucide-react"
import { reportsApi } from "@/lib/api"

interface CandidateApplication {
  id: number
  name: string
  role: string
  job_id: string
  status: "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "accepted"
  apply_date: string
  email: string
  phone: string
}

interface SummaryStats {
  total_applications: number
  new_applications: number
  shortlisted_applications: number
  interviewing_applications: number
  hired_applications: number
  rejected_applications: number
}

const statusVariantMap = {
  new: "default",
  reviewed: "secondary",
  shortlisted: "default",
  contacting: "default",
  interviewing: "default",
  rejected: "destructive",
  accepted: "paid",
} as const

const statusLabels: Record<string, string> = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  contacting: "Contacting",
  interviewing: "Interviewing",
  rejected: "Rejected",
  accepted: "Hired",
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CandidatesApplicationsPage() {
  // Set default dates to current month
  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0],
    }
  }

  const currentMonth = getCurrentMonthDates()
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState(currentMonth.from)
  const [dateTo, setDateTo] = useState(currentMonth.to)
  const [statusFilter, setStatusFilter] = useState<"" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "accepted">("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<CandidateApplication[]>([])
  const [summary, setSummary] = useState<SummaryStats>({
    total_applications: 0,
    new_applications: 0,
    shortlisted_applications: 0,
    interviewing_applications: 0,
    hired_applications: 0,
    rejected_applications: 0,
  })
  const [totalPages, setTotalPages] = useState(1)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter].filter(v => v !== "").length

  // Fetch data from API
  const fetchApplications = async () => {
    // Only fetch if date filters are applied
    if (!dateFrom || !dateTo) {
      setLoading(false)
      setApplications([])
      setSummary({
        total_applications: 0,
        new_applications: 0,
        shortlisted_applications: 0,
        interviewing_applications: 0,
        hired_applications: 0,
        rejected_applications: 0,
      })
      setTotalPages(1)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params: any = {
        page: currentPage,
        per_page: rowsPerPage,
        date_from: dateFrom,
        date_to: dateTo,
      }

      if (searchQuery) params.search = searchQuery
      if (statusFilter) params.status = statusFilter

      const response = await reportsApi.getCandidatesApplications(params)

      if (response.success && response.data) {
        setApplications(response.data.applications || [])
        setSummary(response.data.summary || {
          total_applications: 0,
          new_applications: 0,
          shortlisted_applications: 0,
          interviewing_applications: 0,
          hired_applications: 0,
          rejected_applications: 0,
        })
        setTotalPages(response.data.pagination?.last_page || 1)
      } else {
        setError(response.message || "Failed to load applications")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading applications")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchApplications()
  }, [currentPage, rowsPerPage, searchQuery, dateFrom, dateTo, statusFilter])

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExport = () => {
    if (applications.length === 0) return

    const exportData = applications.map(application => ({
      "#": application.id,
      "Name": application.name,
      "Email": application.email,
      "Phone": application.phone,
      "Role": application.role,
      "Job ID": application.job_id,
      "Status": statusLabels[application.status] || application.status,
      "Apply Date": formatDate(application.apply_date),
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
    link.setAttribute("download", `candidates_applications_${today}.csv`)
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
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Candidates Applications</h1>
            <p className="text-neutral-600">View and export comprehensive candidate applications report</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
            disabled={applications.length === 0 || loading}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
              <Users className="w-4 h-4" />
              Total Applications
            </div>
            <div className="text-2xl font-bold text-neutral-900">{summary.total_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">New</div>
            <div className="text-2xl font-bold text-blue-600">{summary.new_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Shortlisted</div>
            <div className="text-2xl font-bold text-sky-600">{summary.shortlisted_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Interviewing</div>
            <div className="text-2xl font-bold text-yellow-600">{summary.interviewing_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Hired</div>
            <div className="text-2xl font-bold text-green-600">{summary.hired_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{summary.rejected_applications}</div>
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
                placeholder="Search by Name, Role, Job ID, Email, or Phone..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm focus:ring-0 focus:outline-none focus:border-sky-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="contacting">Contacting</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Hired</option>
              </select>
            </div>

            {/* Filter and Clear buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline" 
                className="bg-white border-neutral-300 text-neutral-700 relative"
                disabled={loading}
              >
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
                  className="bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <span className="ml-3 text-neutral-600">Loading applications...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchApplications}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Apply Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                        No candidate applications found
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application, index) => (
                      <TableRow key={application.id}>
                        <TableCell className="text-neutral-800">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="text-neutral-800 font-medium">
                          {application.name}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {application.email}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {application.phone}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {application.role}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {application.job_id}
                        </TableCell>
                        <TableCell>
                          <Badge variant={(statusVariantMap[application.status as keyof typeof statusVariantMap] || "default") as "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "default" | "paid" | "hidden" | "active" | "paused" | "draft" | "closed" | "interviewed" | "hired" | "pending" | "approved"}>
                            {statusLabels[application.status] || application.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-neutral-400" />
                            {formatDate(application.apply_date)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {applications.length > 0 && (
                <div className="border-t border-neutral-200">
                  <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setCurrentPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
