"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Download, Calendar, Filter, X } from "lucide-react"

interface JobReport {
  id: number
  title: string
  job_id: string
  employment_type: string
  posted_date: string
  closed_date: string
}

// Mock data for demonstration
const mockJobReports: JobReport[] = [
  { id: 1, title: "Registered Nurse - ICU", job_id: "JOB-001", employment_type: "Full-time", posted_date: "2025-01-15", closed_date: "2025-02-15" },
  { id: 2, title: "Licensed Practical Nurse", job_id: "JOB-002", employment_type: "Part-time", posted_date: "2025-01-20", closed_date: "2025-02-20" },
  { id: 3, title: "Nurse Practitioner", job_id: "JOB-003", employment_type: "Full-time", posted_date: "2025-02-01", closed_date: "2025-03-01" },
  { id: 4, title: "Certified Nursing Assistant", job_id: "JOB-004", employment_type: "Temporary", posted_date: "2025-02-05", closed_date: "2025-03-05" },
  { id: 5, title: "Emergency Room Nurse", job_id: "JOB-005", employment_type: "Full-time", posted_date: "2025-02-10", closed_date: "2025-03-10" },
  { id: 6, title: "Pediatric Nurse", job_id: "JOB-006", employment_type: "Part-time", posted_date: "2025-02-15", closed_date: "2025-03-15" },
  { id: 7, title: "Operating Room Nurse", job_id: "JOB-007", employment_type: "Full-time", posted_date: "2025-02-20", closed_date: "2025-03-20" },
  { id: 8, title: "Home Health Nurse", job_id: "JOB-008", employment_type: "Part-time", posted_date: "2025-03-01", closed_date: "2025-04-01" },
  { id: 9, title: "Mental Health Nurse", job_id: "JOB-009", employment_type: "Full-time", posted_date: "2025-03-05", closed_date: "2025-04-05" },
  { id: 10, title: "Oncology Nurse", job_id: "JOB-010", employment_type: "Full-time", posted_date: "2025-03-10", closed_date: "2025-04-10" },
  { id: 11, title: "Cardiac Care Nurse", job_id: "JOB-011", employment_type: "Full-time", posted_date: "2025-03-15", closed_date: "2025-04-15" },
  { id: 12, title: "Rehabilitation Nurse", job_id: "JOB-012", employment_type: "Part-time", posted_date: "2025-03-20", closed_date: "2025-04-20" },
  { id: 13, title: "Geriatric Nurse", job_id: "JOB-013", employment_type: "Full-time", posted_date: "2025-04-01", closed_date: "2025-05-01" },
  { id: 14, title: "Maternity Nurse", job_id: "JOB-014", employment_type: "Full-time", posted_date: "2025-04-05", closed_date: "2025-05-05" },
  { id: 15, title: "Travel Nurse", job_id: "JOB-015", employment_type: "Temporary", posted_date: "2025-04-10", closed_date: "2025-05-10" },
]

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function MonthlyJobReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo].filter(v => v !== "").length

  // Filter jobs based on search and date range
  const filteredReports = mockJobReports.filter((report) => {
    // Search filter - matches Job Title or Job ID
    const matchesSearch = 
      !searchQuery ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.job_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter - check if posted_date falls within range
    const matchesDateFrom = !dateFrom || report.posted_date >= dateFrom
    const matchesDateTo = !dateTo || report.posted_date <= dateTo
    
    return matchesSearch && matchesDateFrom && matchesDateTo
  })

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
      "Posted Date": formatDate(report.posted_date),
      "Closed Date": formatDate(report.closed_date),
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

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Monthly Job Reports</h1>
            <p className="text-neutral-600">View and export monthly job reports</p>
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

        {/* Filters */}
        <div className="">
          <div className="flex  gap-4">
            {/* Search Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by Job Title or Job ID..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Date Range with Single Calendar Icon */}
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
                <TableHead>Posted Date</TableHead>
                <TableHead>Closed Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                    No job reports found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="text-neutral-800">
                      {report.id}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.title}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.job_id}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.employment_type}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {formatDate(report.posted_date)}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {formatDate(report.closed_date)}
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
