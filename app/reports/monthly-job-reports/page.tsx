"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Filter, X, Eye, Users, Loader2, ChevronDown } from "lucide-react"
import { reportsApi } from "@/lib/api"

interface JobReport {
  id: number
  title: string
  job_id: string
  employment_type: string
  status: "active" | "closed" | "draft"
  location: string
  salary_range: string
  posted_date: string
  closed_date: string
  applications_count: number
  views: number
}

interface SummaryStats {
  total_jobs: number
  active_jobs: number
  closed_jobs: number
  total_applications: number
  total_views: number
}

const statusVariantMap = {
  active: "default",
  closed: "secondary",
  draft: "outline",
} as const

const statusLabels = {
  active: "Active",
  closed: "Closed",
  draft: "Draft",
}

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString || dateString === "—") return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MonthlyJobReportsPage() {
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
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "closed" | "draft">("")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [jobReports, setJobReports] = useState<JobReport[]>([])
  const [summary, setSummary] = useState<SummaryStats>({
    total_jobs: 0,
    active_jobs: 0,
    closed_jobs: 0,
    total_applications: 0,
    total_views: 0,
  })
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([])
  const [showExportMenu, setShowExportMenu] = useState(false)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Fetch data from API
  const fetchReports = async () => {
    // Only fetch if date filters are applied
    if (!dateFrom || !dateTo) {
      setLoading(false)
      setJobReports([])
      setSummary({
        total_jobs: 0,
        active_jobs: 0,
        closed_jobs: 0,
        total_applications: 0,
        total_views: 0,
      })
      setTotalPages(1)
      setTotalItems(0)
      setEmploymentTypes([])
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
      if (employmentTypeFilter) params.employment_type = employmentTypeFilter

      const response = await reportsApi.getMonthlyJobReports(params)

      if (response.success && response.data) {
        setJobReports(response.data.jobs || [])
        setSummary(response.data.summary || {
          total_jobs: 0,
          active_jobs: 0,
          closed_jobs: 0,
          total_applications: 0,
          total_views: 0,
        })
        setTotalPages(response.data.pagination?.last_page || 1)
        setTotalItems(response.data.pagination?.total || 0)

        // Extract unique employment types from jobs
        const types = Array.from(new Set((response.data.jobs || []).map((job: JobReport) => job.employment_type)))
        setEmploymentTypes(types as string[])
      } else {
        setError(response.message || "Failed to load job reports")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading reports")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when filters or pagination changes
  useEffect(() => {
    fetchReports()
  }, [currentPage, rowsPerPage, searchQuery, dateFrom, dateTo, statusFilter, employmentTypeFilter])

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter, employmentTypeFilter].filter(v => v !== "").length

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (jobReports.length === 0) return

    const params: any = {}
    if (searchQuery) params.search = searchQuery
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (statusFilter) params.status = statusFilter
    if (employmentTypeFilter) params.employment_type = employmentTypeFilter

    reportsApi.exportMonthlyJobReportsCSV(params)
    setShowExportMenu(false)
  }

  // Export to Excel
  const handleExportExcel = () => {
    if (jobReports.length === 0) return

    const params: any = {}
    if (searchQuery) params.search = searchQuery
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (statusFilter) params.status = statusFilter
    if (employmentTypeFilter) params.employment_type = employmentTypeFilter

    reportsApi.exportMonthlyJobReportsExcel(params)
    setShowExportMenu(false)
  }

  // Export to PDF
  const handleExportPDF = () => {
    if (jobReports.length === 0) return

    const params: any = {}
    if (searchQuery) params.search = searchQuery
    if (dateFrom) params.date_from = dateFrom
    if (dateTo) params.date_to = dateTo
    if (statusFilter) params.status = statusFilter
    if (employmentTypeFilter) params.employment_type = employmentTypeFilter

    reportsApi.exportMonthlyJobReportsPDF(params)
    setShowExportMenu(false)
  }

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
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

  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentTypeFilter(value)
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setStatusFilter("")
    setEmploymentTypeFilter("")
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Monthly Job Reports</h1>
            <p className="text-neutral-600">View and export comprehensive job reports with analytics</p>
          </div>
          <div className="relative" ref={exportMenuRef}>
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
              disabled={jobReports.length === 0 || loading}
            >
              <Download className="w-4 h-4" />
              Export Report
              <ChevronDown className="w-4 h-4" />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50">
                <button
                  onClick={handleExportCSV}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  Export as CSV
                </button>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  Export as Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
              <Users className="w-4 h-4" />
              Total Jobs
            </div>
            <div className="text-2xl font-bold text-neutral-900">{summary.total_jobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Active Jobs</div>
            <div className="text-2xl font-bold text-green-600">{summary.active_jobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Closed Jobs</div>
            <div className="text-2xl font-bold text-neutral-600">{summary.closed_jobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Applications</div>
            <div className="text-2xl font-bold text-neutral-900">{summary.total_applications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Total Views</div>
            <div className="text-2xl font-bold text-neutral-900">{summary.total_views}</div>
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
                placeholder="Search by Job Title, Job ID, or Location..."
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
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Employment Type Filter */}
            <div className="flex items-center gap-2">
              <select
                value={employmentTypeFilter}
                onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm focus:ring-0 focus:outline-none focus:border-sky-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <option value="">All Types</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
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
              <span className="ml-3 text-neutral-600">Loading reports...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchReports}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto w-full">
                <Table className="w-full min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Employment Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Salary Range</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead>Closed Date</TableHead>
                    <TableHead className="text-center">Applications</TableHead>
                    <TableHead className="text-center">Views</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-neutral-500">
                        No job reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobReports.map((report, index) => (
                      <TableRow key={report.id}>
                        <TableCell className="text-neutral-800">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </TableCell>
                        <TableCell className="text-neutral-800 font-medium max-w-[250px]">
                          <div className="truncate" title={report.title}>
                            {report.title}
                          </div>
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {report.job_id}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {report.employment_type}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[report.status]}>
                            {statusLabels[report.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {report.location || "Not specified"}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {report.salary_range || "Not specified"}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {formatDate(report.posted_date)}
                        </TableCell>
                        <TableCell className="text-neutral-800">
                          {formatDate(report.closed_date)}
                        </TableCell>
                        <TableCell className="text-center text-neutral-800">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="w-4 h-4 text-neutral-400" />
                            {report.applications_count}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-neutral-800">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="w-4 h-4 text-neutral-400" />
                            {report.views}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>

              {jobReports.length > 0 && (
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
