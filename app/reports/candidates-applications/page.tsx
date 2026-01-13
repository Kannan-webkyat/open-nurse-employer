"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Download, Filter, X, Search, Users, Calendar, Loader2, Sparkles, BookmarkCheck, MessageSquare, CheckCircle2, FileText, ChevronDown } from "lucide-react"
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

const statusVariantMap: Record<string, "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired" | "default"> = {
  new: "new",
  reviewed: "reviewed",
  shortlisted: "shortlisted",
  contacting: "contacting",
  interviewing: "interviewing",
  rejected: "rejected",
  accepted: "hired",
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

  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Export handlers
  const handleExportCSV = async () => {
    if (applications.length === 0) return

    try {
        const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter
        }
        await reportsApi.exportCandidatesApplicationsCSV(params)
        setShowExportMenu(false)
    } catch (error) {
         console.error("Export failed", error)
    }
  }

  const handleExportExcel = async () => {
    if (applications.length === 0) return

    try {
        const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter
        }
        await reportsApi.exportCandidatesApplicationsExcel(params)
        setShowExportMenu(false)
    } catch (error) {
         console.error("Export failed", error)
    }
  }

  const handleExportPDF = async () => {
    if (applications.length === 0) return

    try {
         const params: any = {
            search: searchQuery,
            date_from: dateFrom,
            date_to: dateTo,
            status: statusFilter
        }
        await reportsApi.exportCandidatesApplicationsPDF(params)
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

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("")
    setCurrentPage(1)
    // Note: Search and Date are now in the header, we prefer not to clear them with the 'Reset Filters' pill button unless requested
  }

  const activeFilterCount = [statusFilter].filter(v => v !== "").length

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-[1600px] mx-auto">
        
        {/* Modern Unified Header with Gradient */}
        <div className="relative z-20 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 pointer-events-none rounded-xl"></div>
            
            <div className="relative z-10">
                <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    Candidates Applications
                </h1>
                <p className="text-xs text-neutral-500 mt-1">Detailed breakdown of candidate applications & status</p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
                 {/* Search Input */}
                 <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by candidate, role..."
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
                        disabled={loading || applications.length === 0}
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
                        <option value="new">New</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="contacting">Contacting</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="rejected">Rejected</option>
                        <option value="accepted">Hired</option>
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
                    {/* Total Applications */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-indigo-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/20 to-indigo-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:border-indigo-200 transition-all duration-300">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-indigo-700 transition-colors">Total Apps</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.total_applications.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* New Applications */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/20 to-blue-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 group-hover:border-blue-200 transition-all duration-300">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-blue-700 transition-colors">New</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.new_applications.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Shortlisted */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-sky-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-sky-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/20 to-sky-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-sky-100 flex items-center justify-center text-sky-600 shadow-sm group-hover:scale-110 group-hover:border-sky-200 transition-all duration-300">
                                <BookmarkCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-sky-700 transition-colors">Shortlisted</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.shortlisted_applications.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Interviewing */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-amber-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-amber-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/20 to-amber-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-amber-100 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 group-hover:border-amber-200 transition-all duration-300">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-amber-700 transition-colors">Interviewing</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.interviewing_applications.toLocaleString()}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Hired */}
                    <div className="relative overflow-hidden p-4 rounded-xl border border-neutral-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-emerald-100 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/60 opacity-100"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-100/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 group-hover:border-emerald-200 transition-all duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5 group-hover:text-emerald-700 transition-colors">Hired</p>
                                <h3 className="text-xl font-bold text-neutral-900 leading-none">{summary.hired_applications.toLocaleString()}</h3>
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
              <span className="ml-3 text-neutral-500 text-sm">Loading applications...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-500 mb-2 text-sm">{error}</p>
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
              <div className="overflow-x-auto">
                <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider pl-6">Candidate</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contact</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Role / Job ID</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</TableHead>
                     <TableHead className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Applied Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-neutral-400 text-sm">
                        No applications found for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <TableRow key={application.id} className="hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="pl-6 py-4">
                            <div className="font-semibold text-neutral-900 text-sm">{application.name}</div>
                        </TableCell>
                        <TableCell>
                            <div className="text-xs text-neutral-600">
                                <div>{application.email}</div>
                                <div className="text-neutral-400 mt-0.5">{application.phone}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>
                                <div className="font-medium text-neutral-800 text-sm">{application.role}</div>
                                <div className="text-xs text-neutral-500 mt-0.5">#{application.job_id}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariantMap[application.status] || "default"} className="capitalize shadow-none">
                            {statusLabels[application.status] || application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(application.apply_date)}
                            </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>

              {applications.length > 0 && (
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
