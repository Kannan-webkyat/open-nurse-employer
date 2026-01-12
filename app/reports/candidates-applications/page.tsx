"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Download, Calendar, Filter, X, Search } from "lucide-react"

interface CandidateApplication {
  id: number
  name: string
  role: string
  job_id: string
  status: "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired"
  apply_date: string
}

// Mock data for demonstration
const mockCandidateApplications: CandidateApplication[] = [
  { id: 1, name: "Emma Johnson", role: "ICU Nurse", job_id: "JOB-8X2KLM", status: "rejected", apply_date: "2025-01-15" },
  { id: 2, name: "Olivia Smith", role: "Pediatric Nurse", job_id: "JOB-Q9Z4HT", status: "shortlisted", apply_date: "2025-01-20" },
  { id: 3, name: "Ava Brown", role: "ER Nurse", job_id: "JOB-K7M3LD", status: "reviewed", apply_date: "2025-02-01" },
  { id: 4, name: "Sophia Davis", role: "Surgical Nurse", job_id: "JOB-V4TUP", status: "shortlisted", apply_date: "2025-02-05" },
  { id: 5, name: "Isabella Wilson", role: "Community Health Nurse", job_id: "JOB-A2R6BN", status: "rejected", apply_date: "2025-02-10" },
  { id: 6, name: "Mia Martinez", role: "Oncology Nurse", job_id: "JOB-P3X8WR", status: "reviewed", apply_date: "2025-02-15" },
  { id: 7, name: "Charlotte Anderson", role: "Psychiatric Nurse", job_id: "JOB-N6D7QK", status: "shortlisted", apply_date: "2025-02-20" },
  { id: 8, name: "Amelia Taylor", role: "Dialysis Nurse", job_id: "JOB-H5Y9LM", status: "rejected", apply_date: "2025-03-01" },
  { id: 9, name: "Harper Thomas", role: "Geriatric Nurse", job_id: "JOB-J2F8XZ", status: "shortlisted", apply_date: "2025-03-05" },
  { id: 10, name: "Evelyn Jackson", role: "Operating Room Nurse", job_id: "JOB-W9L6TR", status: "rejected", apply_date: "2025-03-10" },
  { id: 11, name: "Abigail White", role: "ICU Nurse", job_id: "JOB-7K9M2B", status: "reviewed", apply_date: "2025-03-15" },
  { id: 12, name: "Emily Harris", role: "Pediatric Nurse", job_id: "JOB-Q9Z4HT", status: "shortlisted", apply_date: "2025-03-20" },
  { id: 13, name: "Elizabeth Martin", role: "ER Nurse", job_id: "JOB-K7M3LD", status: "rejected", apply_date: "2025-04-01" },
  { id: 14, name: "Sofia Garcia", role: "Surgical Nurse", job_id: "JOB-V4TUP", status: "reviewed", apply_date: "2025-04-05" },
  { id: 15, name: "Avery Rodriguez", role: "Community Health Nurse", job_id: "JOB-A2R6BN", status: "shortlisted", apply_date: "2025-04-10" },
  { id: 16, name: "Scarlett Lee", role: "Oncology Nurse", job_id: "JOB-P3X8WR", status: "new", apply_date: "2025-04-15" },
  { id: 17, name: "Victoria Walker", role: "Psychiatric Nurse", job_id: "JOB-N6D7QK", status: "contacting", apply_date: "2025-04-20" },
  { id: 18, name: "Madison Hall", role: "Dialysis Nurse", job_id: "JOB-H5Y9LM", status: "interviewing", apply_date: "2025-05-01" },
  { id: 19, name: "Luna Young", role: "Geriatric Nurse", job_id: "JOB-J2F8XZ", status: "hired", apply_date: "2025-05-05" },
  { id: 20, name: "Grace King", role: "Operating Room Nurse", job_id: "JOB-W9L6TR", status: "hired", apply_date: "2025-05-10" },
]

const statusLabels = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  contacting: "Contacting",
  interviewing: "Interviewing",
  rejected: "Rejected",
  hired: "Hired",
}

export default function CandidatesApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired">("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const dateFromRef = useRef<HTMLInputElement>(null)
  const dateToRef = useRef<HTMLInputElement>(null)

  // Count active filters
  const activeFilterCount = [searchQuery, dateFrom, dateTo, statusFilter].filter(v => v !== "").length

  // Filter applications based on search, date range and status
  const filteredApplications = mockCandidateApplications.filter((application) => {
    // Search filter - matches Name, Role, or Job ID
    const matchesSearch = 
      !searchQuery ||
      application.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      application.job_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Date range filter - check if apply_date falls within range
    const matchesDateFrom = !dateFrom || application.apply_date >= dateFrom
    const matchesDateTo = !dateTo || application.apply_date <= dateTo
    
    // Status filter
    const matchesStatus = !statusFilter || application.status === statusFilter
    
    return matchesSearch && matchesDateFrom && matchesDateTo && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredApplications.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedApplications = filteredApplications.slice(startIndex, endIndex)

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  // Export to CSV
  const handleExport = () => {
    const exportData = filteredApplications.map(application => ({
      "#": application.id,
      "Name": application.name,
      "Role": application.role,
      "Job ID": application.job_id,
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
            <p className="text-neutral-600">View and export candidate applications report</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
            disabled={filteredApplications.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <div className="">
          <div className="flex gap-4 flex-wrap">
            {/* Search Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by Name, Role or Job ID..."
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
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="contacting">Contacting</option>
                <option value="interviewing">Interviewing</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
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
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Job ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                    No candidate applications found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedApplications.map((application, index) => (
                  <TableRow key={application.id}>
                    <TableCell className="text-neutral-800">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="text-neutral-800 font-medium">
                      {application.name}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {application.role}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {application.job_id}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {filteredApplications.length > 0 && (
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
