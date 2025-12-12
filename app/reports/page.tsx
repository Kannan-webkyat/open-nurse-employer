"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Filter, X, Download, Calendar } from "lucide-react"

interface Report {
  id: number
  reportName: string
  reportType: "jobs" | "candidates" | "billing" | "analytics"
  generatedDate: string
  period: string
  status: "completed" | "pending" | "failed"
  records: number
  fileSize: string
}

const reportsData: Report[] = [
  { id: 1, reportName: "Monthly Jobs Report", reportType: "jobs", generatedDate: "Oct 1, 2025", period: "September 2025", status: "completed", records: 245, fileSize: "2.4 MB" },
  { id: 2, reportName: "Candidate Applications", reportType: "candidates", generatedDate: "Sep 28, 2025", period: "September 2025", status: "completed", records: 189, fileSize: "1.8 MB" },
  { id: 3, reportName: "Billing Summary", reportType: "billing", generatedDate: "Sep 30, 2025", period: "Q3 2025", status: "completed", records: 45, fileSize: "856 KB" },
  { id: 4, reportName: "Performance Analytics", reportType: "analytics", generatedDate: "Oct 2, 2025", period: "September 2025", status: "pending", records: 0, fileSize: "-" },
  { id: 5, reportName: "Weekly Jobs Report", reportType: "jobs", generatedDate: "Sep 25, 2025", period: "Week 38", status: "completed", records: 67, fileSize: "1.2 MB" },
  { id: 6, reportName: "Candidate Status Report", reportType: "candidates", generatedDate: "Sep 27, 2025", period: "September 2025", status: "completed", records: 312, fileSize: "3.1 MB" },
  { id: 7, reportName: "Revenue Report", reportType: "billing", generatedDate: "Sep 29, 2025", period: "September 2025", status: "completed", records: 28, fileSize: "624 KB" },
  { id: 8, reportName: "User Engagement Analytics", reportType: "analytics", generatedDate: "Oct 1, 2025", period: "September 2025", status: "failed", records: 0, fileSize: "-" },
  { id: 9, reportName: "Daily Jobs Report", reportType: "jobs", generatedDate: "Sep 24, 2025", period: "Sep 24, 2025", status: "completed", records: 12, fileSize: "456 KB" },
  { id: 10, reportName: "Hired Candidates Report", reportType: "candidates", generatedDate: "Sep 26, 2025", period: "September 2025", status: "completed", records: 45, fileSize: "892 KB" },
  { id: 11, reportName: "Payment History", reportType: "billing", generatedDate: "Sep 28, 2025", period: "September 2025", status: "completed", records: 156, fileSize: "1.5 MB" },
  { id: 12, reportName: "Conversion Analytics", reportType: "analytics", generatedDate: "Sep 30, 2025", period: "Q3 2025", status: "completed", records: 89, fileSize: "1.1 MB" },
]

const reportTypeLabels = {
  jobs: "Jobs",
  candidates: "Candidates",
  billing: "Billing",
  analytics: "Analytics",
}

const statusVariantMap = {
  completed: "active",
  pending: "contacting",
  failed: "rejected",
} as const

const statusLabels = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(reportsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    reportType: "" as "" | "jobs" | "candidates" | "billing" | "analytics",
    status: "" as "" | "completed" | "pending" | "failed",
    dateFrom: "",
    dateTo: "",
  })
  const filterRef = useRef<HTMLDivElement>(null)

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reportName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.period.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = !filters.reportType || report.reportType === filters.reportType
    const matchesStatus = !filters.status || report.status === filters.status
    
    // Date filtering
    const matchesDateFrom = !filters.dateFrom || report.generatedDate >= filters.dateFrom
    const matchesDateTo = !filters.dateTo || report.generatedDate <= filters.dateTo
    
    return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo
  })

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      reportType: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    })
    setCurrentPage(1)
  }

  const handleExport = () => {
    // Export filtered reports
    const exportData = filteredReports.map(report => ({
      "Report Name": report.reportName,
      "Type": reportTypeLabels[report.reportType],
      "Generated Date": report.generatedDate,
      "Period": report.period,
      "Status": statusLabels[report.status],
      "Records": report.records,
      "File Size": report.fileSize,
    }))

    // Convert to CSV
    const headers = Object.keys(exportData[0])
    const csvContent = [
      headers.join(","),
      ...exportData.map(row => headers.map(header => row[header as keyof typeof row]).join(","))
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `reports_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isFilterOpen])

  const totalPages = Math.ceil(filteredReports.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedReports = filteredReports.slice(startIndex, endIndex)

  const handleRowsPerPageChange = (rows: number) => {
    setRowsPerPage(rows)
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reports & Insights</h1>
            <p className="text-neutral-600">View and export your reports</p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-neutral-950 text-white hover:bg-neutral-900 flex items-center gap-2"
            disabled={filteredReports.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Reports
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 border-neutral-300"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-sky-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
            <div
              ref={filterRef}
              className="bg-white h-full w-full max-w-md shadow-xl overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between z-10">
                <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Report Type Filter */}
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">Report Type</label>
                  <div className="space-y-2">
                    {(["jobs", "candidates", "billing", "analytics"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange("reportType", filters.reportType === type ? "" : type)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          filters.reportType === type
                            ? "bg-sky-50 border-sky-500 text-sky-700"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {reportTypeLabels[type]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">Status</label>
                  <div className="space-y-2">
                    {(["completed", "pending", "failed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", filters.status === status ? "" : status)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          filters.status === status
                            ? "bg-sky-50 border-sky-500 text-sky-700"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        {statusLabels[status]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-3 block">Date Range</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-600 mb-1 block">From</label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-600 mb-1 block">To</label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full border-neutral-300"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reports Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Generated Date</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="text-neutral-800 font-medium">
                      {report.reportName}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {reportTypeLabels[report.reportType]}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.generatedDate}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.period}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariantMap[report.status]}>
                        {statusLabels[report.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.records.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-neutral-800">
                      {report.fileSize}
                    </TableCell>
                    <TableCell>
                      {report.status === "completed" ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Handle download
                            console.log("Downloading report:", report.id)
                          }}
                          className="text-sky-600 hover:text-sky-700 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      ) : (
                        <span className="text-neutral-400 text-sm">-</span>
                      )}
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
