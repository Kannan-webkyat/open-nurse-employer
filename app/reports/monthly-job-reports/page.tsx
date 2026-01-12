"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Filter, X, Briefcase, Eye, Users } from "lucide-react"

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

// Mock data for demonstration
const mockJobReports: JobReport[] = [
  { id: 1, title: "Registered Nurse - ICU", job_id: "JOB-001", employment_type: "Full-time", status: "closed", location: "London, UK", salary_range: "£35,000 - £45,000", posted_date: "2025-01-15", closed_date: "2025-02-15", applications_count: 24, views: 156 },
  { id: 2, title: "Licensed Practical Nurse", job_id: "JOB-002", employment_type: "Part-time", status: "closed", location: "Manchester, UK", salary_range: "£28,000 - £35,000", posted_date: "2025-01-20", closed_date: "2025-02-20", applications_count: 18, views: 142 },
  { id: 3, title: "Nurse Practitioner", job_id: "JOB-003", employment_type: "Full-time", status: "active", location: "Birmingham, UK", salary_range: "£40,000 - £50,000", posted_date: "2025-02-01", closed_date: "", applications_count: 32, views: 289 },
  { id: 4, title: "Certified Nursing Assistant", job_id: "JOB-004", employment_type: "Temporary", status: "closed", location: "Leeds, UK", salary_range: "£22,000 - £28,000", posted_date: "2025-02-05", closed_date: "2025-03-05", applications_count: 15, views: 98 },
  { id: 5, title: "Emergency Room Nurse", job_id: "JOB-005", employment_type: "Full-time", status: "active", location: "Liverpool, UK", salary_range: "£38,000 - £48,000", posted_date: "2025-02-10", closed_date: "", applications_count: 28, views: 203 },
  { id: 6, title: "Pediatric Nurse", job_id: "JOB-006", employment_type: "Part-time", status: "active", location: "Sheffield, UK", salary_range: "£32,000 - £42,000", posted_date: "2025-02-15", closed_date: "", applications_count: 21, views: 178 },
  { id: 7, title: "Operating Room Nurse", job_id: "JOB-007", employment_type: "Full-time", status: "active", location: "Bristol, UK", salary_range: "£36,000 - £46,000", posted_date: "2025-02-20", closed_date: "", applications_count: 19, views: 165 },
  { id: 8, title: "Home Health Nurse", job_id: "JOB-008", employment_type: "Part-time", status: "closed", location: "Cardiff, UK", salary_range: "£30,000 - £38,000", posted_date: "2025-03-01", closed_date: "2025-04-01", applications_count: 12, views: 87 },
  { id: 9, title: "Mental Health Nurse", job_id: "JOB-009", employment_type: "Full-time", status: "active", location: "Edinburgh, UK", salary_range: "£34,000 - £44,000", posted_date: "2025-03-05", closed_date: "", applications_count: 26, views: 194 },
  { id: 10, title: "Oncology Nurse", job_id: "JOB-010", employment_type: "Full-time", status: "active", location: "Glasgow, UK", salary_range: "£37,000 - £47,000", posted_date: "2025-03-10", closed_date: "", applications_count: 23, views: 201 },
  { id: 11, title: "Cardiac Care Nurse", job_id: "JOB-011", employment_type: "Full-time", status: "active", location: "Newcastle, UK", salary_range: "£39,000 - £49,000", posted_date: "2025-03-15", closed_date: "", applications_count: 17, views: 152 },
  { id: 12, title: "Rehabilitation Nurse", job_id: "JOB-012", employment_type: "Part-time", status: "closed", location: "Nottingham, UK", salary_range: "£31,000 - £39,000", posted_date: "2025-03-20", closed_date: "2025-04-20", applications_count: 14, views: 103 },
  { id: 13, title: "Geriatric Nurse", job_id: "JOB-013", employment_type: "Full-time", status: "active", location: "Leicester, UK", salary_range: "£33,000 - £43,000", posted_date: "2025-04-01", closed_date: "", applications_count: 20, views: 167 },
  { id: 14, title: "Maternity Nurse", job_id: "JOB-014", employment_type: "Full-time", status: "active", location: "Coventry, UK", salary_range: "£35,000 - £45,000", posted_date: "2025-04-05", closed_date: "", applications_count: 29, views: 245 },
  { id: 15, title: "Travel Nurse", job_id: "JOB-015", employment_type: "Temporary", status: "active", location: "Multiple Locations", salary_range: "£30,000 - £40,000", posted_date: "2025-04-10", closed_date: "", applications_count: 35, views: 312 },
]

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
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MonthlyJobReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "closed" | "draft">("")
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter, employmentTypeFilter].filter(v => v !== "").length

  // Filter jobs based on search, date range, status, and employment type
  const filteredReports = mockJobReports.filter((report) => {
    // Search filter - matches Job Title, Job ID, or Location
    const matchesSearch = 
      !searchQuery ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.job_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter - check if posted_date falls within range
    const matchesDateFrom = !dateFrom || report.posted_date >= dateFrom
    const matchesDateTo = !dateTo || report.posted_date <= dateTo
    
    // Status filter
    const matchesStatus = !statusFilter || report.status === statusFilter
    
    // Employment type filter
    const matchesEmploymentType = !employmentTypeFilter || report.employment_type === employmentTypeFilter
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus && matchesEmploymentType
  })

  // Calculate summary statistics
  const totalJobs = filteredReports.length
  const activeJobs = filteredReports.filter(r => r.status === "active").length
  const closedJobs = filteredReports.filter(r => r.status === "closed").length
  const totalApplications = filteredReports.reduce((sum, r) => sum + r.applications_count, 0)
  const totalViews = filteredReports.reduce((sum, r) => sum + r.views, 0)

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = filteredReports.map(report => ({
      "Job Title": report.title,
      "Job ID": report.job_id,
      "Employment Type": report.employment_type,
      "Status": statusLabels[report.status],
      "Location": report.location,
      "Salary Range": report.salary_range,
      "Posted Date": formatDate(report.posted_date),
      "Closed Date": formatDate(report.closed_date),
      "Applications": report.applications_count,
      "Views": report.views,
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
    link.setAttribute("download", `monthly_job_reports_${today}.csv`)
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

  // Get unique employment types
  const employmentTypes = Array.from(new Set(mockJobReports.map(r => r.employment_type)))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Monthly Job Reports</h1>
            <p className="text-neutral-600">View and export comprehensive job reports with analytics</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
            disabled={filteredReports.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Total Jobs</div>
            <div className="text-2xl font-bold text-neutral-900">{totalJobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Active Jobs</div>
            <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="text-sm text-neutral-600 mb-1">Closed Jobs</div>
            <div className="text-2xl font-bold text-neutral-600">{closedJobs}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
              <Users className="w-4 h-4" />
              Total Applications
            </div>
            <div className="text-2xl font-bold text-neutral-900">{totalApplications}</div>
          </div>
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
              <Eye className="w-4 h-4" />
              Total Views
            </div>
            <div className="text-2xl font-bold text-neutral-900">{totalViews}</div>
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
                className="px-4 py-2 border border-neutral-300 rounded-lg bg-white text-neutral-700 text-sm focus:ring-0 focus:outline-none focus:border-sky-700 cursor-pointer"
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
              {paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-neutral-500">
                    No job reports found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((report, index) => (
                  <TableRow key={report.id}>
                    <TableCell className="text-neutral-800">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-neutral-800 font-medium">
                      {report.title}
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
                      {report.location}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.salary_range}
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

          {filteredReports.length > 0 && (
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
