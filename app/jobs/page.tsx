"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Modal } from "@/components/ui/modal"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Search, Filter, Eye, Pencil, Trash2, X } from "lucide-react"
import Link from "next/link"

interface Job {
  id: number
  title: string
  jobId: string
  employmentType: string
  postedDate: string
  closedDate: string
  status: "active" | "paused" | "draft" | "closed"
}

interface JobDetails extends Job {
  specialization?: string
  yearsOfExperience?: string
  numberOfOpenings?: string
  paymentType?: string
  minimum?: string
  maximum?: string
  startingAmount?: string
  rate?: string
  overview?: string
  qualifications?: string
  applicationProcess?: string
}

const jobsData: Job[] = [
  { id: 1, title: "ICU Nurse", jobId: "JOB-8X2KLM", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "active" },
  { id: 2, title: "Pediatric Nurse", jobId: "JOB-Q9Z4HT", employmentType: "Part-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "active" },
  { id: 3, title: "ER Nurse", jobId: "JOB-K7M3LD", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "paused" },
  { id: 4, title: "Surgical Nurse", jobId: "JOB-V4TUP", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "draft" },
  { id: 5, title: "Community Health Nurse", jobId: "JOB-A2R6BN", employmentType: "Part-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "closed" },
  { id: 6, title: "Oncology Nurse", jobId: "JOB-P3X8WR", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "active" },
  { id: 7, title: "Psychiatric Nurse", jobId: "JOB-N6D7QK", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "active" },
  { id: 8, title: "Dialysis Nurse", jobId: "JOB-H5Y9LM", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "paused" },
  { id: 9, title: "Geriatric Nurse", jobId: "JOB-J2F8XZ", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "draft" },
  { id: 10, title: "Operating Room Nurse", jobId: "JOB-W9L6TR", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "closed" },
  { id: 11, title: "ICU Nurse", jobId: "ICU-7K9M2B", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "closed" },
  { id: 12, title: "ICU Nurse", jobId: "ICU-7K9M2B", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "active" },
  { id: 13, title: "Dialysis Nurse", jobId: "JOB-H5Y9LM", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "paused" },
  { id: 14, title: "Geriatric Nurse", jobId: "JOB-J2F8XZ", employmentType: "Temporary", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "draft" },
  { id: 15, title: "Operating Room Nurse", jobId: "JOB-W9L6TR", employmentType: "Full-time", postedDate: "Sep 25, 2025", closedDate: "Sep 30, 2025", status: "closed" },
]

const statusVariantMap = {
  active: "active",
  paused: "paused",
  draft: "draft",
  closed: "closed",
} as const


export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>(jobsData)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "" as "" | "active" | "paused" | "draft" | "closed",
    employmentType: "",
    postedDateFrom: "",
    postedDateTo: "",
  })

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.jobId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !filters.status || job.status === filters.status
    const matchesEmploymentType = !filters.employmentType || job.employmentType === filters.employmentType
    
    // Date filtering (simple string comparison for demo)
    const matchesDateFrom = !filters.postedDateFrom || job.postedDate >= filters.postedDateFrom
    const matchesDateTo = !filters.postedDateTo || job.postedDate <= filters.postedDateTo
    
    return matchesSearch && matchesStatus && matchesEmploymentType && matchesDateFrom && matchesDateTo
  })

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      employmentType: "",
      postedDateFrom: "",
      postedDateTo: "",
    })
    setCurrentPage(1)
  }

  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFilterOpen])

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredJobs.length / rowsPerPage)

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  const getJobDetails = (jobId: number): JobDetails => {
    const baseJob = jobs.find((j: Job) => j.id === jobId)
    if (!baseJob) return {} as JobDetails
  
    return {
      ...baseJob,
      specialization: "Intensive Care",
      yearsOfExperience: "3+ years",
      numberOfOpenings: "2",
      paymentType: "Range",
      minimum: "£3,000",
      maximum: "£4,000",
      rate: "per month",
      overview: "We are looking for an experienced ICU Nurse to join our team. The ideal candidate will have extensive experience in critical care settings and be able to work in a fast-paced environment.",
      qualifications: "• Registered Nurse (RN) license\n• BSN degree preferred\n• ICU certification\n• Minimum 3 years of ICU experience\n• BLS and ACLS certification\n• Strong communication skills",
      applicationProcess: "1. Submit your application through our portal\n2. Complete the online assessment\n3. Attend the initial interview\n4. Complete skills assessment\n5. Final interview with the hiring manager\n6. Background check and onboarding"
    }
  }

  const handleViewJob = (job: Job) => {
    const jobDetails = getJobDetails(job.id)
    setSelectedJob(jobDetails)
    setIsViewModalOpen(true)
  }

  const closeModal = () => {
    setIsViewModalOpen(false)
    setSelectedJob(null)
  }

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (jobToDelete) {
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobToDelete.id))
      setJobToDelete(null)
      // Reset to first page if current page becomes empty
      const remainingJobs = jobs.filter(job => job.id !== jobToDelete.id)
      const newTotalPages = Math.ceil(remainingJobs.length / rowsPerPage)
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages)
      }
    }
  }

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setJobToDelete(null)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Jobs</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="bg-white border-neutral-300 text-neutral-700 relative"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Link href="/jobs/create">
              <Button className="bg-sky-500 hover:bg-sky-700 text-white rounded-full">
                Post Job
              </Button>
            </Link>
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedJobs.map((job, index) => (
                <TableRow key={job.id}>
                  <TableCell className="text-neutral-800">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-neutral-800">
                    {job.title}
                  </TableCell>
                  <TableCell className="text-neutral-800">
                    {job.jobId}
                  </TableCell>
                  <TableCell className="text-neutral-800">
                    {job.employmentType}
                  </TableCell>
                  <TableCell className="text-neutral-800">
                    {job.postedDate}
                  </TableCell>
                  <TableCell className="text-neutral-800">
                    {job.closedDate}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[job.status]}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleViewJob(job)}
                        className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link href={`/jobs/edit/${job.id}`}>
                        <button className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-blue-600 hover:bg-blue-100 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(job)}
                        className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </div>

        {/* View Job Modal */}
        {selectedJob && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={closeModal}
            title={`Job Details - ${selectedJob.title}`}
            footer={
              <div className="flex items-center justify-end gap-4">
                <Button variant="outline" onClick={closeModal}>
                  Close
                </Button>
                <Link href={`/jobs/edit/${selectedJob.id}`}>
                  <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-full">
                    Edit Job
                  </Button>
                </Link>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Job Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Job Details</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job Title</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job ID</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.jobId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Specialization</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.specialization || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Employment Type</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.employmentType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Years of Experience</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.yearsOfExperience || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Number of Openings</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.numberOfOpenings || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Posted Date</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.postedDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Closed Date</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.closedDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Status</label>
                    <div className="mt-1">
                      <Badge variant={statusVariantMap[selectedJob.status]}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pay Rate Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pay Rate</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Payment Type</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.paymentType || "N/A"}</p>
                  </div>
                  {selectedJob.paymentType === "Range" ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Minimum</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedJob.minimum || "N/A"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Maximum</label>
                        <p className="text-sm text-neutral-900 mt-1">{selectedJob.maximum || "N/A"}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Starting Amount</label>
                      <p className="text-sm text-neutral-900 mt-1">{selectedJob.startingAmount || "N/A"}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Rate</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.rate || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Job Description Sections */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Job Description</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">About the Role</label>
                    <p className="text-sm text-neutral-900 mt-2 whitespace-pre-line">{selectedJob.overview || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Qualifications</label>
                    <p className="text-sm text-neutral-900 mt-2 whitespace-pre-line">{selectedJob.qualifications || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Application Process</label>
                    <p className="text-sm text-neutral-900 mt-2 whitespace-pre-line">{selectedJob.applicationProcess || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleDeleteConfirm}
          title="Delete Job"
          description={`Are you sure you want to delete "${jobToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Filter Panel */}
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity"
              onClick={() => setIsFilterOpen(false)}
            />
            
            {/* Slide-in Panel */}
            <div 
              ref={filterRef}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Filters</h2>
                    {activeFilterCount > 0 && (
                      <p className="text-sm text-neutral-600 mt-1">
                        {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-600" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-3 block">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["active", "paused", "draft", "closed"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleFilterChange("status", filters.status === status ? "" : status)}
                        className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                          filters.status === status
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employment Type Filter */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-3 block">Employment Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {(["Full-time", "Part-time", "Temporary"] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange("employmentType", filters.employmentType === type ? "" : type)}
                        className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium text-left ${
                          filters.employmentType === type
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posted Date Range */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-3 block">Posted Date Range</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 mb-2 block">From Date</label>
                      <input
                        type="date"
                        value={filters.postedDateFrom}
                        onChange={(e) => handleFilterChange("postedDateFrom", e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 mb-2 block">To Date</label>
                      <input
                        type="date"
                        value={filters.postedDateTo}
                        onChange={(e) => handleFilterChange("postedDateTo", e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-6">
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="flex-1 rounded-full"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsFilterOpen(false)}
                    className={`${activeFilterCount > 0 ? 'flex-1' : 'w-full'} bg-sky-500 hover:bg-sky-600 text-white rounded-full`}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

