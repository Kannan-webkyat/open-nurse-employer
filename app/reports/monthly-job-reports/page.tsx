"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Filter, X, Eye, Users, Loader2, ChevronDown, Calendar, FileText, CheckCircle2, XCircle, Briefcase } from "lucide-react"
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

const statusVariantMap: Record<string, "active" | "closed" | "draft" | "default"> = {
  active: "active",
  closed: "closed",
  draft: "draft",
} as const

const statusLabels: Record<string, string> = {
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
  const activeFilterCount = [statusFilter, employmentTypeFilter].filter(v => v !== "").length

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export handlers
  const handleExportCSV = () => {
    if (jobReports.length === 0) return
    const params: any = { search: searchQuery, date_from: dateFrom, date_to: dateTo, status: statusFilter, employment_type: employmentTypeFilter }
    reportsApi.exportMonthlyJobReportsCSV(params)
    setShowExportMenu(false)
  }

  const handleExportExcel = () => {
    if (jobReports.length === 0) return
    const params: any = { search: searchQuery, date_from: dateFrom, date_to: dateTo, status: statusFilter, employment_type: employmentTypeFilter }
    reportsApi.exportMonthlyJobReportsExcel(params)
    setShowExportMenu(false)
  }

  const handleExportPDF = () => {
    if (jobReports.length === 0) return
    const params: any = { search: searchQuery, date_from: dateFrom, date_to: dateTo, status: statusFilter, employment_type: employmentTypeFilter }
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

  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentTypeFilter(value)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    // Note: We don't clear Date/Search here as they are in the header now, but we'll clear the secondary filters
    setStatusFilter("")
    setEmploymentTypeFilter("")
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        
        {/* Modern Unified Header with Gradient */}
        <div className="relative z-20 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 pointer-events-none rounded-xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    Monthly Job Reports
                </h1>
                <p className="text-xs text-neutral-500 mt-1">Detailed breakdown of job listings & activity</p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
                 {/* Search Input */}
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search jobs, companies..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-4 py-1.5 border border-neutral-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-64 transition-all shadow-sm"
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <span className="text-neutral-300 text-xs">to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => handleDateToChange(e.target.value)}
                        className="bg-transparent border-none text-sm text-neutral-700 focus:ring-0 p-1 w-32 outline-none"
                        disabled={loading}
                    />
                </div>

                <div className="relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || jobReports.length === 0}
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
                        disabled={loading}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-neutral-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <select
                        value={employmentTypeFilter}
                        onChange={(e) => handleEmploymentTypeChange(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-1.5 border border-neutral-200 rounded-full bg-white text-xs font-medium text-neutral-600 focus:ring-1 focus:ring-sky-500 focus:outline-none cursor-pointer hover:border-neutral-300 transition-colors shadow-sm"
                        disabled={loading}
                    >
                         <option value="">All Types</option>
                        {employmentTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
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

            {loading ? (
                <div className="flex items-center justify-center py-6 bg-white rounded-xl border border-neutral-100 border-dashed">
                    <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {/* Total Jobs */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-indigo-700 transition-colors">Total Jobs</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.total_jobs.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Active Jobs */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-emerald-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-emerald-700 transition-colors">Active</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.active_jobs.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Closed Jobs */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-red-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-red-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/20 to-red-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-red-100 flex items-center justify-center text-red-600 shadow-sm group-hover:scale-110 group-hover:border-red-200 transition-all duration-300">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-red-700 transition-colors">Closed</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.closed_jobs.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Applications */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-sky-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-sky-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/20 to-sky-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 group-hover:border-sky-200 transition-all duration-300">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-sky-700 transition-colors">Apps</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.total_applications.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Total Views */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-amber-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-amber-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 group-hover:border-amber-200 transition-all duration-300">
                                <Eye className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-amber-700 transition-colors">Views</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.total_views.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
              <span className="ml-3 text-neutral-500 text-sm">Loading reports...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-2 text-sm">{error}</p>
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
              <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-6">Job Details</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Type</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Location</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Salary</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Posted</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Stats</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-neutral-400 text-sm">
                        No job reports found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-6 py-4">
                            <div>
                                <div className="font-semibold text-neutral-900 text-sm">{report.title}</div>
                                <div className="text-xs text-neutral-500 mt-0.5">#{report.job_id}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
                                {report.employment_type}
                            </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[report.status] || "default"} className="capitalize shadow-none">
                            {statusLabels[report.status] || report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 text-neutral-600 text-sm max-w-[150px] truncate">
                                {report.location || "Not specified"}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-neutral-600 text-sm font-medium">
                                {report.salary_range || "—"}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="text-neutral-500 text-xs">
                                {formatDate(report.posted_date)}
                            </div>
                        </TableCell>
                        <TableCell>
                             <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-neutral-600" title="Applications">
                                    <Users className="w-3.5 h-3.5 text-sky-500" />
                                    <span className="font-semibold">{report.applications_count}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-600" title="Views">
                                    <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{report.views}</span>
                                </div>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>

              {jobReports.length > 0 && (
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
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
