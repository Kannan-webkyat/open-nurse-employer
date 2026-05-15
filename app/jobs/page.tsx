"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Modal } from "@/components/ui/modal"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Search, Filter, Eye, Pencil, Trash2, X, Copy, QrCode, Download, Check, ExternalLink } from "lucide-react"
import Link from "next/link"
import { jobPostApi, employerProfileApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useSubscriptionFeatures } from "@/hooks/useSubscriptionFeatures"
import { sanitizeHtml } from "@/lib/utils"
import QRCodeSVG from "react-qr-code"

interface Job {
  id: number
  title: string
  job_id: string
  location: string
  employment_type: string
  posted_date: string
  closed_date: string
  status: "active" | "paused" | "draft" | "closed"
  admin_status: "pending" | "approved" | "rejected" | "hidden"
}

interface JobDetails extends Job {
  specialization?: string
  years_of_experience?: number
  number_of_openings?: number
  payment_type?: string
  minimum_amount?: number
  maximum_amount?: number
  amount?: number
  rate?: string
  overview?: string
  qualifications?: string
  application_process?: string
}

const statusVariantMap = {
  active: "active",
  paused: "paused",
  draft: "draft",
  closed: "closed",
} as const

const adminStatusVariantMap = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  hidden: "hidden",
} as const

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function JobsPage() {
  const router = useRouter()
  const toast = useToast() as {
    success: (message: string, options?: { title?: string; duration?: number }) => void
    error: (message: string, options?: { title?: string; duration?: number }) => void
    info: (message: string, options?: { title?: string; duration?: number }) => void
    warning: (message: string, options?: { title?: string; duration?: number }) => void
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filters, setFilters] = useState({
    status: "" as "" | "active" | "paused" | "draft" | "closed",
    employmentType: "",
    postedDateFrom: "",
    postedDateTo: "",
  })

  // QR Code state
  const [isQrModalOpen, setIsQrModalOpen] = useState(false)
  const [employerUserId, setEmployerUserId] = useState<string | null>(null)
  const [qrLinkCopied, setQrLinkCopied] = useState(false)

  const websiteUrl = (process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3001').replace(/\/$/, '')
  const qrUrl = employerUserId ? `${websiteUrl}/employer-jobs/${employerUserId}` : ''

  // Fetch employer profile to get user ID for QR
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employerProfileApi.getProfile() as any
        if (res.success && res.data?.id) {
          setEmployerUserId(String(res.data.id))
        }
      } catch (err) {
        console.error('Failed to fetch employer profile:', err)
      }
    }
    fetchProfile()
  }, [])

  // Download QR as PNG
  const handleDownloadQr = () => {
    const container = document.getElementById('employer-qr-container')
    const svgEl = container?.querySelector('svg')
    if (!svgEl) return
    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    const size = 512
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      ctx.drawImage(img, 56, 56, size - 112, size - 112)
      const link = document.createElement('a')
      link.download = 'employer-qr-code.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleCopyQrLink = async () => {
    if (!qrUrl) return
    try {
      await navigator.clipboard.writeText(qrUrl)
      setQrLinkCopied(true)
      setTimeout(() => setQrLinkCopied(false), 2500)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const {
    canPostJob,
    activeJobs: slotJobs,
    jobSlots,
    hasSubscription,
    loading: featuresLoading,
  } = useSubscriptionFeatures()

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length

  const handlePostJobClick = () => {
    if (!featuresLoading && !canPostJob) {
      toast.info("Upgrade your plan to create more job posts.", {
        title: "Job post limit reached",
        duration: 4000,
      })
      router.push("/plans")
      return
    }
    router.push("/jobs/create")
  }

  const slotsLabel =
    jobSlots == null && hasSubscription
      ? "Unlimited"
      : String(jobSlots ?? 1)

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

  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoading(true)
      try {
        const response = await jobPostApi.getAll({
          page: currentPage,
          per_page: rowsPerPage,
          status: filters.status || undefined,
          search: searchQuery || undefined,
        })

        if (response.success && 'data' in response && response.data) {
          // Handle Laravel pagination response
          const paginatedData = response.data as any
          if (paginatedData.data) {
            // Laravel paginated response
            setJobs(paginatedData.data)
            setTotalPages(paginatedData.last_page || 1)
            setTotalItems(paginatedData.total || 0)
          } else if (Array.isArray(paginatedData)) {
            // Direct array response
            setJobs(paginatedData)
            setTotalPages(1)
            setTotalItems(paginatedData.length)
          }
        } else {
          console.error('Failed to fetch jobs:', response.message)
        }
      } catch (error) {
        console.error('Error fetching jobs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [currentPage, rowsPerPage, filters.status, searchQuery])

  // Apply client-side filters for employment type and dates
  const filteredJobs = jobs.filter(job => {
    const matchesEmploymentType = !filters.employmentType || job.employment_type === filters.employmentType

    // Date filtering
    const matchesDateFrom = !filters.postedDateFrom || job.posted_date >= filters.postedDateFrom
    const matchesDateTo = !filters.postedDateTo || job.posted_date <= filters.postedDateTo

    return matchesEmploymentType && matchesDateFrom && matchesDateTo
  })

  const paginatedJobs = filteredJobs

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1) // Reset to first page when changing rows per page
  }

  const handleViewJob = async (job: Job) => {
    try {
      const response = await jobPostApi.getById(job.id)
      if (response.success && 'data' in response && response.data) {
        setSelectedJob(response.data as JobDetails)
        setIsViewModalOpen(true)
      } else {
        console.error('Failed to fetch job details:', response.message)
      }
    } catch (error) {
      console.error('Error fetching job details:', error)
    }
  }

  const closeModal = () => {
    setIsViewModalOpen(false)
    setSelectedJob(null)
  }

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (jobToDelete) {
      try {
        const response = await jobPostApi.delete(jobToDelete.id)
        if (response.success) {
          // Refresh the jobs list
          const refreshResponse = await jobPostApi.getAll({
            page: currentPage,
            per_page: rowsPerPage,
            status: filters.status || undefined,
            search: searchQuery || undefined,
          })

          if (refreshResponse.success && 'data' in refreshResponse && refreshResponse.data) {
            const paginatedData = refreshResponse.data as any
            if (paginatedData.data) {
              setJobs(paginatedData.data)
              setTotalPages(paginatedData.last_page || 1)
              setTotalItems(paginatedData.total || 0)
            } else if (Array.isArray(paginatedData)) {
              setJobs(paginatedData)
              setTotalPages(1)
              setTotalItems(paginatedData.length)
            }
          }

          setJobToDelete(null)
          setIsDeleteDialogOpen(false)
          toast.success('Job deleted successfully!', {
            title: 'Success',
            duration: 3000,
          })
        } else {
          console.error('Failed to delete job:', response.message)
          const errorMessage = response.message || 'Failed to delete job'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error deleting job:', error)
        toast.error('An error occurred while deleting the job', {
          title: 'Error',
          duration: 5000,
        })
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
        {!featuresLoading && !canPostJob && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p>
              You are using all allowed job posts ({slotJobs} / {slotsLabel} concurrent active or paused jobs).
              Close an existing listing or{" "}
              <Link href="/plans" className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-800">
                upgrade your plan
              </Link>{" "}
              to post another job.
            </p>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <h1 className="shrink-0 text-2xl font-bold text-neutral-900">Jobs</h1>
          <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="relative w-full min-w-0 sm:max-w-xs sm:flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-full min-w-0 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex min-w-0 w-full gap-3 sm:w-auto sm:shrink-0">
              <Button
                variant="outline"
                className="min-w-0 flex-1 justify-center bg-white border-neutral-300 text-neutral-700 sm:flex-initial sm:shrink-0"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-2 shrink-0 bg-sky-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="min-w-0 flex-1 justify-center bg-white border-neutral-300 text-neutral-700 sm:flex-initial sm:shrink-0 hover:border-sky-400 hover:text-sky-600"
                title="Share QR Code"
              >
                <QrCode className="w-4 h-4 mr-2 shrink-0" />
                <span className="truncate">Share QR</span>
              </Button>
              <Button
                type="button"
                onClick={handlePostJobClick}
                className="min-w-0 flex-1 bg-sky-500 hover:bg-sky-700 text-white rounded-full whitespace-nowrap sm:flex-initial sm:shrink-0 sm:px-6"
              >
                Post Job
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Employment Type</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead>Closed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-neutral-600">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-neutral-600">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedJobs.map((job, index) => (
                    <TableRow key={job.id}>
                      <TableCell className="text-neutral-800">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        <div className="flex items-center gap-2 group">
                          <span className="font-mono text-sm">{job.job_id}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(job.job_id)
                              toast.success('Job ID copied!')
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-100 rounded transition-all text-neutral-400 hover:text-neutral-600"
                            title="Copy Job ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {job.title}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {job.location || "N/A"}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {job.employment_type}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {formatDate(job.posted_date)}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {formatDate(job.closed_date)}
                      </TableCell>
                      <TableCell>
                        {job.admin_status === 'hidden' ? (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200">
                            Hidden by Admin
                          </Badge>
                        ) : (
                          <Badge variant={statusVariantMap[job.status]}>
                            {job.status === 'active' ? 'Website Listed' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </Badge>
                        )}
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
                            <button className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-violet-600 hover:bg-violet-100 transition-colors">
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job Title</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job ID</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.job_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Specialization</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.specialization || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Employment Type</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.employment_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Years of Experience</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.years_of_experience ? `${selectedJob.years_of_experience}+ years` : "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Number of Openings</label>
                    <p className="text-sm text-neutral-900 mt-1">{selectedJob.number_of_openings || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Posted Date</label>
                    <p className="text-sm text-neutral-900 mt-1">{formatDate(selectedJob.posted_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Closed Date</label>
                    <p className="text-sm text-neutral-900 mt-1">{formatDate(selectedJob.closed_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Status</label>
                    <div className="mt-1">
                      {selectedJob.admin_status === 'hidden' ? (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border border-red-200">
                          Hidden by Admin
                        </Badge>
                      ) : (
                        <Badge variant={statusVariantMap[selectedJob.status]}>
                          {selectedJob.status === 'active' ? 'Website Listed' : selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Pay Rate Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Pay Rate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Payment Type</label>
                    <p className="text-sm text-neutral-900 mt-1">
                      {selectedJob.payment_type === 'range' ? 'Range' : selectedJob.payment_type === 'starting_amount' ? 'Starting Amount' : 'N/A'}
                    </p>
                  </div>
                  {selectedJob.payment_type === "range" ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Minimum</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedJob.minimum_amount ? `£${selectedJob.minimum_amount.toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Maximum</label>
                        <p className="text-sm text-neutral-900 mt-1">
                          {selectedJob.maximum_amount ? `£${selectedJob.maximum_amount.toLocaleString()}` : "N/A"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Starting Amount</label>
                      <p className="text-sm text-neutral-900 mt-1">
                        {selectedJob.amount ? `£${selectedJob.amount.toLocaleString()}` : "N/A"}
                      </p>
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
                    <div
                      className="text-sm text-neutral-900 mt-2 prose prose-sm max-w-none break-words [&>p]:break-words [&>p]:whitespace-normal"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml((selectedJob.overview || "N/A").replace(/&nbsp;/g, ' ')),
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Qualifications</label>
                    <div
                      className="text-sm text-neutral-900 mt-2 prose prose-sm max-w-none break-words [&>p]:break-words [&>p]:whitespace-normal"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml((selectedJob.qualifications || "N/A").replace(/&nbsp;/g, ' ')),
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Application Process</label>
                    <div
                      className="text-sm text-neutral-900 mt-2 prose prose-sm max-w-none break-words [&>p]:break-words [&>p]:whitespace-normal"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml((selectedJob.application_process || "N/A").replace(/&nbsp;/g, ' ')),
                      }}
                    />
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

        {/* QR Code Modal */}
        {isQrModalOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
              onClick={() => setIsQrModalOpen(false)}
            >
              {/* Modal card */}
              <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-sky-500 to-indigo-600 p-6 text-white relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                  <button
                    onClick={() => setIsQrModalOpen(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <QrCode className="w-5 h-5 text-sky-200" />
                      <span className="text-sky-200 text-xs font-semibold uppercase tracking-wider">QR Share</span>
                    </div>
                    <h2 className="text-xl font-black tracking-tight">Share Your Jobs</h2>
                    <p className="text-sky-100 text-sm mt-1 leading-snug">
                      Clients scan this to view all your active job listings
                    </p>
                  </div>
                </div>

                {/* QR Code area */}
                <div className="p-6">
                  {qrUrl ? (
                    <>
                      <div className="flex justify-center mb-5">
                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-neutral-100 relative">
                          {/* Corner decorators */}
                          <div className="absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 border-sky-400 rounded-tl-lg" />
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 border-sky-400 rounded-tr-lg" />
                          <div className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 border-sky-400 rounded-bl-lg" />
                          <div className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 border-sky-400 rounded-br-lg" />
                          <div id="employer-qr-container">
                            <QRCodeSVG
                              value={qrUrl}
                              size={220}
                              bgColor="#ffffff"
                              fgColor="#0f172a"
                              level="H"
                            />
                          </div>
                        </div>
                      </div>

                      {/* URL pill */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2 mb-4">
                        <span className="text-xs text-neutral-500 truncate flex-1 font-mono" title={qrUrl}>
                          {qrUrl}
                        </span>
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-neutral-400 hover:text-sky-600 transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          onClick={handleDownloadQr}
                          className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold text-sm gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCopyQrLink}
                          className={`rounded-xl font-semibold text-sm gap-2 transition-all ${
                            qrLinkCopied
                              ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                              : 'border-neutral-300 text-neutral-700'
                          }`}
                        >
                          {qrLinkCopied ? (
                            <><Check className="w-4 h-4" /> Copied!</>
                          ) : (
                            <><Copy className="w-4 h-4" /> Copy Link</>
                          )}
                        </Button>
                      </div>

                      <p className="text-center text-xs text-neutral-400 mt-4 leading-relaxed">
                        Download and share this QR code with clients. When scanned, they'll see all your active job listings.
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
                      <div className="w-10 h-10 border-2 border-neutral-200 border-t-sky-500 rounded-full animate-spin mb-3" />
                      <p className="text-sm">Generating QR code…</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

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
                        className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium ${filters.status === status
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
                        className={`px-4 py-3 rounded-lg border transition-all text-sm font-medium text-left ${filters.employmentType === type
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

