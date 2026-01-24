"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Filter, Eye, Check, MoreVertical, X, MessageSquare, Maximize2, Paperclip, Send, MapPin, Phone, Calendar, UserCheck, Trash2, XCircle, ClipboardCheck, AlertCircle, Pencil } from "lucide-react"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Modal } from "@/components/ui/modal"
import apiMiddleware, { jobApplicationApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface Candidate {
  id: number
  nurseId?: number
  candidateName: string
  jobAppliedFor: string
  jobId: string
  jobPostId?: number
  status: "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "interviewed" | "rejected" | "hired"
  applyDate: string
  location: string
  interviewAt?: string
  meetingLink?: string
  // Additional application details
  email?: string
  contactNumber?: string
  willingToRelocate?: boolean
  inUK?: boolean
  jobRole?: string
  contractType?: string
  registrationStatus?: string
  notes?: string
  resumeUrl?: string
  certificatesUrl?: string
  nhsBand?: string
  justStartingOut?: boolean
  keySkills?: string
  workRole?: string
  employer?: string
  countryOfWork?: string
  jobLocationArea?: string
  isCurrentJob?: boolean
  fromMonth?: string
  fromYear?: string
  toMonth?: string
  toYear?: string
  workNotes?: string
}

// Format date helper
const formatDate = (dateString: string | null) => {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Map backend status to frontend status
const mapStatus = (backendStatus: string): Candidate['status'] => {
  const statusMap: Record<string, Candidate['status']> = {
    'new': 'new',
    'reviewed': 'reviewed',
    'shortlisted': 'shortlisted',
    'contacting': 'contacting',
    'interviewing': 'interviewing',
    'interviewed': 'interviewed',
    'rejected': 'rejected',
    'accepted': 'hired', // Backend uses 'accepted', frontend uses 'hired'
  }
  return statusMap[backendStatus] || 'new'
}

// Map frontend status to backend status
const mapStatusToBackend = (frontendStatus: Candidate['status']): string => {
  const statusMap: Record<Candidate['status'], string> = {
    'new': 'new',
    'reviewed': 'reviewed',
    'shortlisted': 'shortlisted',
    'contacting': 'contacting',
    'interviewing': 'interviewing',
    'interviewed': 'interviewed',
    'rejected': 'rejected',
    'hired': 'accepted', // Frontend uses 'hired', backend uses 'accepted'
  }
  return statusMap[frontendStatus] || 'new'
}

const statusVariantMap = {
  new: "new",
  reviewed: "reviewed",
  shortlisted: "shortlisted",
  contacting: "contacting",
  interviewing: "interviewing",
  interviewed: "interviewed",
  rejected: "rejected",
  hired: "hired",
} as const

const statusLabels = {
  new: "New",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  contacting: "Contacting",
  interviewing: "Interviewing",
  interviewed: "Interviewed",
  rejected: "Rejected",
  hired: "Hired",
}

export default function CandidatesPage() {
  const router = useRouter()
  const toast = useToast() as {
    success: (message: string, options?: { title?: string; duration?: number }) => void
    error: (message: string, options?: { title?: string; duration?: number }) => void
    info: (message: string, options?: { title?: string; duration?: number }) => void
    warning: (message: string, options?: { title?: string; duration?: number }) => void
  }
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [activeTab, setActiveTab] = useState<"all" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "interviewed" | "rejected" | "hired">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    location: "",
    applyDateFrom: "",
    applyDateTo: "",
  })
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [messageText, setMessageText] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false)
  const [isHiredDialogOpen, setIsHiredDialogOpen] = useState(false)
  const [isInterviewedDialogOpen, setIsInterviewedDialogOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null)
  const [candidateToAction, setCandidateToAction] = useState<Candidate | null>(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [interviewFormData, setInterviewFormData] = useState({
    date: "",
    time: "",
    meetingUrl: "",
  })
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    new: 0,
    reviewed: 0,
    shortlisted: 0,
    contacting: 0,
    interviewing: 0,
    interviewed: 0,
    rejected: 0,
    hired: 0,
  })
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([])

  const filterRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  const messageTemplates = [
    "Thank you for applying. We have received your application.",
    "We will get back to you with the next steps soon.",
    "We would like to schedule an interview. Please share your availability."
  ]

  // Reusable function to fetch candidates
  const fetchCandidates = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      // Map activeTab to backend status
      const statusParam = activeTab === "all" ? undefined : activeTab === "hired" ? "accepted" : activeTab

      const response = await jobApplicationApi.getAll({
        page: currentPage,
        per_page: rowsPerPage,
        status: statusParam,
        search: searchQuery || undefined,
        location: filters.location || undefined,
      })

      if (response.success && 'data' in response && response.data) {
        const data = response.data as any

        // Handle paginated response
        if (data.applications) {
          const paginatedData = data.applications
          const applications = paginatedData.data || paginatedData

          // Transform backend data to frontend format
          const transformedCandidates: Candidate[] = applications.map((app: any) => ({
            id: app.id,
            nurseId: app.user?.nurse?.id,
            candidateName: app.full_name || `${app.first_name} ${app.last_name}`,
            jobAppliedFor: app.job_title || app.jobPost?.title || "",
            jobId: app.job_id || app.jobPost?.job_id || "",
            jobPostId: app.job_post_id || app.jobPost?.id,
            status: mapStatus(app.status),
            applyDate: formatDate(app.submitted_at || app.created_at),
            location: app.location || app.jobPost?.location || "",
            interviewAt: app.interview_at,
            meetingLink: app.meeting_link,
          }))

          setCandidates(transformedCandidates)
          setTotalPages(paginatedData.last_page || 1)
          setTotalItems(paginatedData.total || applications.length)
        }

        // Set status counts
        if (data.status_counts) {
          setStatusCounts({
            all: data.status_counts.all || 0,
            new: data.status_counts.new || 0,
            reviewed: data.status_counts.reviewed || 0,
            shortlisted: data.status_counts.shortlisted || 0,
            contacting: data.status_counts.contacting || 0,
            interviewing: data.status_counts.interviewing || 0,
            interviewed: data.status_counts.interviewed || 0,
            rejected: data.status_counts.rejected || 0,
            hired: (data.status_counts as any).accepted || 0, // Backend uses 'accepted'
          })
        }
      } else {
        console.error('Failed to fetch candidates:', response.message)
      }
    } catch (error) {
      console.error('Error fetching candidates:', error)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  // Fetch candidates from API
  useEffect(() => {
    fetchCandidates()
  }, [currentPage, rowsPerPage, activeTab, searchQuery, filters.location])

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await jobApplicationApi.getFilters()
        if (response.success && 'data' in response && response.data) {
          const data = response.data as any
          if (data.locations) {
            setUniqueLocations(data.locations)
          }
        }
      } catch (error) {
        console.error('Error fetching filters:', error)
      }
    }

    fetchFilters()
  }, [])

  // Apply client-side filters for dates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesDateFrom = !filters.applyDateFrom || candidate.applyDate >= filters.applyDateFrom
    const matchesDateTo = !filters.applyDateTo || candidate.applyDate <= filters.applyDateTo
    return matchesDateFrom && matchesDateTo
  })

  const activeFilterCount = Object.values(filters).filter(v => v !== "").length

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      location: "",
      applyDateFrom: "",
      applyDateTo: "",
    })
    setCurrentPage(1)
  }

  useEffect(() => {
    if (isFilterOpen || isMessageOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFilterOpen, isMessageOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    if (openMenuId !== null) {
      // Use setTimeout to ensure button clicks fire before closing menu
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [openMenuId])

  const handleMessageClick = async (candidate: Candidate) => {
    setOpenMenuId(null)

    try {
      // Find job ID (assuming jobId is string like 'JOB-123' might need parsing, 
      // but backend takes job_post_id.
      // Wait, app.job_id is mapped to jobId. If it's the external reference ID (string), 
      // we might need the internal ID for `job_post_id`.
      // However, let's assume `app.job_id` IS the internal ID or we don't pass it if it's the external formatted string.
      // If jobId is string "JOB-...", we can't use it directly if backend expects integer.
      // Let's rely on `app.job_post_id` if available or assume `jobId` is the ID.
      // Looking at transformation: `jobId: app.job_id || app.jobPost?.job_id || ""`
      // `job_id` suggests database foreign key in `job_applications`.

      // Actually, let's check transformation again.
      // `nurseId: app.nurse_id`

      const response = await apiMiddleware.post('/conversations', {
        nurse_id: candidate.nurseId,
        job_post_id: candidate.jobPostId
      });

      if (response.data?.success) {
        router.push(`/messages?conversation_id=${response.data.data.id}`);
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to connect to chat");
    }
  }

  const handleTemplateClick = (index: number) => {
    setSelectedTemplate(index)
    setMessageText(messageTemplates[index])
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // TODO: Implement send message functionality
      console.log("Sending message to", selectedCandidate?.candidateName, ":", messageText)
      setMessageText("")
      setSelectedTemplate(null)
    }
  }

  const handleShortlistClick = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsShortlistDialogOpen(true)
    setOpenMenuId(null)
  }

  const handleRejectClick = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsRejectDialogOpen(true)
    setOpenMenuId(null)
  }

  const handleDeleteClick = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsDeleteDialogOpen(true)
    setOpenMenuId(null)
  }

  const handleShortlistConfirm = async () => {
    if (candidateToAction) {
      try {
        const backendStatus = mapStatusToBackend('shortlisted')
        const response = await jobApplicationApi.updateStatus(candidateToAction.id, backendStatus as any)

        if (response.success) {
          toast.success('Candidate shortlisted successfully!', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.map(c =>
              c.id === candidateToAction.id ? { ...c, status: "shortlisted" as const } : c
            )
          )
          setIsShortlistDialogOpen(false)
          setCandidateToAction(null)
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to shortlist candidate'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error shortlisting candidate:', error)
        toast.error('An error occurred while shortlisting the candidate', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const handleRejectConfirm = async () => {
    if (candidateToAction) {
      try {
        const backendStatus = mapStatusToBackend('rejected')
        const response = await jobApplicationApi.updateStatus(candidateToAction.id, backendStatus as any)

        if (response.success) {
          toast.success('Candidate rejected successfully', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.map(c =>
              c.id === candidateToAction.id ? { ...c, status: "rejected" as const } : c
            )
          )
          setIsRejectDialogOpen(false)
          setCandidateToAction(null)
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to reject candidate'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error rejecting candidate:', error)
        toast.error('An error occurred while rejecting the candidate', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const handleDeleteConfirm = async () => {
    if (candidateToAction) {
      try {
        const response = await jobApplicationApi.delete(candidateToAction.id)

        if (response.success) {
          toast.success('Candidate deleted successfully', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.filter(c => c.id !== candidateToAction.id)
          )
          setIsDeleteDialogOpen(false)
          setCandidateToAction(null)
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to delete candidate'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error deleting candidate:', error)
        toast.error('An error occurred while deleting the candidate', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const handleCall = (candidate: Candidate) => {
    // TODO: Implement call functionality
    console.log("Calling candidate:", candidate.candidateName)
    setOpenMenuId(null)
  }

  const handleSetUpInterview = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsInterviewModalOpen(true)
    setOpenMenuId(null)
    // Reset form data
    setInterviewFormData({
      date: "",
      time: "",
      meetingUrl: "",
    })
  }

  const handleEditInterview = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setOpenMenuId(null) // just in case

    // Pre-fill form data if exists
    if (candidate.interviewAt) {
      const dateObj = new Date(candidate.interviewAt);
      // Format YYYY-MM-DD
      const dateStr = dateObj.toISOString().split('T')[0];
      // Format HH:MM
      const timeStr = dateObj.toTimeString().slice(0, 5);

      setInterviewFormData({
        date: dateStr,
        time: timeStr,
        meetingUrl: candidate.meetingLink || "",
      })
    } else {
      setInterviewFormData({
        date: "",
        time: "",
        meetingUrl: "https://meet.google.com/new", // Default or empty
      })
    }

    // Close view modal if open
    setIsViewModalOpen(false)
    setIsInterviewModalOpen(true)
  }

  const handleInterviewSubmit = async () => {
    if (candidateToAction && interviewFormData.date && interviewFormData.time && interviewFormData.meetingUrl) {
      try {
        const interviewDateTime = `${interviewFormData.date} ${interviewFormData.time}:00`
        const payload = {
          interview_at: interviewDateTime,
          meeting_link: interviewFormData.meetingUrl
        }
        const response = await jobApplicationApi.scheduleInterview(candidateToAction.id, payload)

        if (response.success) {
          toast.success('Interview scheduled successfully!', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.map(c =>
              c.id === candidateToAction.id ? { ...c, status: "interviewing" as const } : c
            )
          )
          setIsInterviewModalOpen(false)
          setCandidateToAction(null)
          setInterviewFormData({
            date: "",
            time: "",
            meetingUrl: "",
          })
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to set up interview'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error setting up interview:', error)
        toast.error('An error occurred while setting up the interview', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const handleInterviewCancel = () => {
    setIsInterviewModalOpen(false)
    setCandidateToAction(null)
    setInterviewFormData({
      date: "",
      time: "",
      meetingUrl: "",
    })
  }

  const handleMarkAsHired = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsHiredDialogOpen(true)
    setOpenMenuId(null)
  }

  const handleMarkAsInterviewed = (candidate: Candidate) => {
    setCandidateToAction(candidate)
    setIsInterviewedDialogOpen(true)
    setOpenMenuId(null)
  }

  const handleInterviewedConfirm = async () => {
    if (candidateToAction) {
      try {
        const response = await jobApplicationApi.updateStatus(candidateToAction.id, 'interviewed' as any)

        if (response.success) {
          toast.success('Candidate marked as interviewed!', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.map(c =>
              c.id === candidateToAction.id ? { ...c, status: "interviewed" as const } : c
            )
          )
          setIsInterviewedDialogOpen(false)
          setCandidateToAction(null)
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to mark as interviewed'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error marking as interviewed:', error)
        toast.error('An error occurred while marking the candidate as interviewed', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const handleViewClick = async (candidate: Candidate) => {
    try {
      const response = await jobApplicationApi.getById(candidate.id)
      if (response.success && 'data' in response && response.data) {
        const app = response.data as any
        const transformedCandidate: Candidate = {
          id: app.id,
          nurseId: app.user?.nurse?.id,
          candidateName: app.full_name || `${app.first_name} ${app.last_name}`,
          jobAppliedFor: app.job_title || app.jobPost?.title || "",
          jobId: app.job_id || app.jobPost?.job_id || "",
          status: mapStatus(app.status),
          applyDate: formatDate(app.submitted_at || app.created_at),
          location: app.location || app.jobPost?.location || "",
          // Additional details
          email: app.email,
          contactNumber: app.contact_number,
          willingToRelocate: app.willing_to_relocate,
          inUK: app.in_uk,
          jobRole: app.job_role,
          contractType: app.contract_type,
          registrationStatus: app.registration_status,
          notes: app.notes,
          resumeUrl: app.resume_url,
          certificatesUrl: app.certificates_url,
          nhsBand: app.nhs_band,
          justStartingOut: app.just_starting_out,
          keySkills: app.key_skills,
          workRole: app.work_role,
          employer: app.employer,
          countryOfWork: app.country_of_work,
          jobLocationArea: app.job_location_area,
          isCurrentJob: app.is_current_job,
          fromMonth: app.from_month,
          fromYear: app.from_year,
          toMonth: app.to_month,
          toYear: app.to_year,
          workNotes: app.work_notes,
        }
        setViewCandidate(transformedCandidate)
        setIsViewModalOpen(true)

        // If status was 'new', user has now 'reviewed' it.
        // The backend 'show' endpoint auto-updates status to 'reviewed', so we update frontend state to match.
        if (candidate.status === 'new') {
          setCandidates(prev => prev.map(c =>
            c.id === candidate.id ? { ...c, status: 'reviewed' } : c
          ))

          // Update counts (new--, reviewed++)
          setStatusCounts(prev => ({
            ...prev,
            new: Math.max(0, prev.new - 1),
            reviewed: prev.reviewed + 1
          }))
        }
      } else {
        const errorMessage = response.message || 'Failed to fetch candidate details'
        toast.error(errorMessage, { title: 'Error', duration: 5000 })
        console.error('Failed to fetch candidate details:', response.message)
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error)
      toast.error('An error occurred while fetching candidate details', { title: 'Error', duration: 5000 })
    }
  }

  const handleHiredConfirm = async () => {
    if (candidateToAction) {
      try {
        const backendStatus = mapStatusToBackend('hired')
        const response = await jobApplicationApi.updateStatus(candidateToAction.id, backendStatus as any)

        if (response.success) {
          toast.success('Candidate marked as hired successfully!', {
            title: 'Success',
            duration: 3000,
          })
          setCandidates(prevCandidates =>
            prevCandidates.map(c =>
              c.id === candidateToAction.id ? { ...c, status: "hired" as const } : c
            )
          )
          setIsHiredDialogOpen(false)
          setCandidateToAction(null)
          // Refresh data without page reload
          await fetchCandidates(false)
        } else {
          const errorMessage = response.message || 'Failed to mark as hired'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
        }
      } catch (error) {
        console.error('Error marking as hired:', error)
        toast.error('An error occurred while marking the candidate as hired', {
          title: 'Error',
          duration: 5000,
        })
      }
    }
  }

  const paginatedCandidates = filteredCandidates

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Candidates</h1>
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
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral-200">
          {([
            { key: "all", label: "All applications" },
            { key: "new", label: "New" },
            { key: "reviewed", label: "Reviewed" },
            { key: "shortlisted", label: "Shortlist" },
            { key: "contacting", label: "Contacting" },
            { key: "interviewing", label: "Interviewing" },
            { key: "interviewed", label: "Interviewed" },
            { key: "rejected", label: "Rejected" },
            { key: "hired", label: "Hired" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setCurrentPage(1)
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === key
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
            >
              {label}
              {statusCounts[key] > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === key
                  ? "bg-sky-100 text-sky-700"
                  : "bg-neutral-100 text-neutral-600"
                  }`}>
                  {statusCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-600">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : paginatedCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-neutral-600">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCandidates.map((candidate, index) => (
                    <TableRow
                      key={candidate.id}
                    >
                      <TableCell className="text-neutral-800">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {candidate.candidateName}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {candidate.jobAppliedFor}
                      </TableCell>
                      <TableCell className="text-neutral-800">
                        {candidate.jobId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={statusVariantMap[candidate.status] as keyof typeof statusVariantMap}>
                            {statusLabels[candidate.status]}
                          </Badge>
                          {candidate.status === 'interviewing' && candidate.interviewAt && (
                            (() => {
                              const interviewDate = new Date(candidate.interviewAt);
                              const today = new Date();
                              if (interviewDate.toDateString() === today.toDateString()) {
                                return (
                                  <div className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Today {interviewDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                );
                              }
                              return null;
                            })()
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3 relative">
                          {/* Quick Action Button - context aware based on status */}
                          {candidate.status === "new" ? (
                            /* No quick action for new candidates - must review first */
                            null
                          ) : candidate.status === "reviewed" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-green-700 hover:bg-green-100 transition-colors group relative"
                              title="Shortlist"
                              onClick={() => handleShortlistClick(candidate)}
                            >
                              <Check className="w-4 h-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Shortlist
                              </span>
                            </button>
                          ) : candidate.status === "shortlisted" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-purple-700 hover:bg-purple-100 transition-colors group relative"
                              title="Setup Interview"
                              onClick={() => handleSetUpInterview(candidate)}
                            >
                              <Calendar className="w-4 h-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Setup Interview
                              </span>
                            </button>
                          ) : candidate.status === "interviewing" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-emerald-700 hover:bg-emerald-100 transition-colors group relative"
                              title="Mark as Interviewed"
                              onClick={() => handleMarkAsInterviewed(candidate)}
                            >
                              <ClipboardCheck className="w-4 h-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Mark Interviewed
                              </span>
                            </button>
                          ) : candidate.status === "interviewed" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-teal-700 hover:bg-teal-100 transition-colors group relative"
                              title="Mark as Hired"
                              onClick={() => handleMarkAsHired(candidate)}
                            >
                              <UserCheck className="w-4 h-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Mark as Hired
                              </span>
                            </button>
                          ) : candidate.status === "rejected" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 cursor-not-allowed group relative"
                              title="Rejected"
                              disabled
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Rejected
                              </span>
                            </button>
                          ) : candidate.status === "hired" ? (
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 cursor-not-allowed group relative"
                              title="Hired"
                              disabled
                            >
                              <UserCheck className="w-4 h-4 text-teal-500" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                Hired
                              </span>
                            </button>
                          ) : null}
                          <button
                            className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-blue-600 hover:bg-blue-100 transition-colors group relative"
                            title="View"
                            onClick={() => handleViewClick(candidate)}
                          >
                            <Eye className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                              View
                            </span>
                          </button>
                          <div className="relative" ref={menuRef}>
                            <button
                              className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-red-600 hover:bg-red-100 transition-colors group relative"
                              title="More options"
                              onClick={(e) => {
                                if (openMenuId === candidate.id) {
                                  setOpenMenuId(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  // Calculate position: align right edge with button right edge, top below button
                                  const top = rect.bottom + window.scrollY + 4; // Add scrollY? No, for fixed we don't add scrollY.
                                  // Wait, if using fixed, use rect.bottom directly.
                                  // Warning: parent might be transformed? If parent has transform, fixed behaves like absolute.
                                  // Previous hack added transform to TR. We should REMOVE that.

                                  // Let's use Fixed and rect.bottom.
                                  setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
                                  setOpenMenuId(candidate.id);
                                }
                              }}
                            >
                              <MoreVertical className="w-4 h-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                More options
                              </span>
                            </button>
                            {openMenuId === candidate.id && (
                              <div
                                className="fixed w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-[9999] py-1"
                                style={{ top: menuPosition.top, right: menuPosition.right }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Message - always available */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMessageClick(candidate)
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Message
                                </button>

                                {/* Shortlist - only for reviewed status */}
                                {candidate.status === "reviewed" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleShortlistClick(candidate)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <Check className="w-4 h-4" />
                                    Shortlist
                                  </button>
                                )}

                                {/* View Interview - only for interviewing status */}
                                {candidate.status === 'interviewing' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setViewCandidate(candidate)
                                      setIsViewModalOpen(true)
                                      setOpenMenuId(null)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    View Interview
                                  </button>
                                )}

                                {/* Setup Interview - only for shortlisted status */}
                                {candidate.status === "shortlisted" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSetUpInterview(candidate)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <Calendar className="w-4 h-4" />
                                    Setup Interview
                                  </button>
                                )}

                                {/* Mark as Interviewed - only for interviewing status */}
                                {candidate.status === "interviewing" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsInterviewed(candidate)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <ClipboardCheck className="w-4 h-4" />
                                    Mark as Interviewed
                                  </button>
                                )}

                                {/* Mark as Hired - only for interviewed status */}
                                {candidate.status === "interviewed" && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleMarkAsHired(candidate)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-green-600 hover:bg-green-50 flex items-center gap-2"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                    Mark as Hired
                                  </button>
                                )}

                                {/* Reject - available for most statuses except final ones */}
                                {!["rejected", "hired"].includes(candidate.status) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRejectClick(candidate)
                                    }}
                                    className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </button>
                                )}

                                {/* Call - optional, always available */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCall(candidate)
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                                >
                                  <Phone className="w-4 h-4" />
                                  Call
                                </button>

                                <div className="border-t border-neutral-200 my-1"></div>

                                {/* Delete - always available */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteClick(candidate)
                                  }}
                                  className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
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
                {/* Location Filter */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-3 block">Location</label>
                  <div className="relative">
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                      className="w-full px-4 py-3 pr-10 border border-neutral-200 rounded-lg focus:outline-none focus:border-sky-600 text-sm bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select Location</option>
                      {uniqueLocations.map((location) => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Apply Date Range */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-3 block">Apply Date Range</label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-neutral-600 mb-2 block">From Date</label>
                      <input
                        type="date"
                        value={filters.applyDateFrom}
                        onChange={(e) => handleFilterChange("applyDateFrom", e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-sky-600 text-sm bg-white appearance-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-600 mb-2 block">To Date</label>
                      <input
                        type="date"
                        value={filters.applyDateTo}
                        onChange={(e) => handleFilterChange("applyDateTo", e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-sky-600 text-sm bg-white appearance-none cursor-pointer"
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

        {/* Message Panel */}
        {isMessageOpen && selectedCandidate && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] transition-opacity"
              onClick={() => setIsMessageOpen(false)}
            />

            {/* Slide-in Message Panel */}
            <div
              ref={messageRef}
              className="fixed right-0 top-0 h-screen w-full max-w-lg bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-neutral-200 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-neutral-900">{selectedCandidate.candidateName}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      title="Maximize"
                    >
                      <Maximize2 className="w-5 h-5 text-neutral-600" />
                    </button>
                    <button
                      onClick={() => setIsMessageOpen(false)}
                      className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5 text-neutral-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 overflow-y-auto min-h-0">
                {/* Pre-written Messages */}
                <div>
                  <label className="text-sm font-semibold text-neutral-900 mb-2 block">Drop a message :</label>
                  <div className="space-y-2">
                    {messageTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateClick(index)}
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${selectedTemplate === index
                          ? "border-sky-500 bg-sky-50 text-neutral-900"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
                          }`}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer - Message Input */}
              <div className="sticky bottom-0 bg-white border-t border-neutral-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`Start conversation with ${selectedCandidate.candidateName}...`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="w-full px-4 py-3 pr-20 border border-neutral-200 rounded-lg focus:outline-none focus:ring-none focus:border-sky-600 text-sm transition-all"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-neutral-100 rounded-full transition-colors"
                      title="Attach file"
                    >
                      <Paperclip className="w-4 h-4 text-neutral-600" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Alert Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false)
            setCandidateToAction(null)
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Candidate"
          description={`Are you sure you want to delete ${candidateToAction?.candidateName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Reject Alert Dialog */}
        <AlertDialog
          isOpen={isRejectDialogOpen}
          onClose={() => {
            setIsRejectDialogOpen(false)
            setCandidateToAction(null)
          }}
          onConfirm={handleRejectConfirm}
          title="Reject Candidate"
          description={`Are you sure you want to reject ${candidateToAction?.candidateName}?`}
          confirmText="Reject"
          cancelText="Cancel"
          variant="danger"
        />

        {/* Shortlist Alert Dialog */}
        <AlertDialog
          isOpen={isShortlistDialogOpen}
          onClose={() => {
            setIsShortlistDialogOpen(false)
            setCandidateToAction(null)
          }}
          onConfirm={handleShortlistConfirm}
          title="Shortlist Candidate"
          description={`Are you sure you want to shortlist ${candidateToAction?.candidateName}?`}
          confirmText="Shortlist"
          cancelText="Cancel"
          variant="success"
        />

        {/* Mark as Hired Alert Dialog */}
        <AlertDialog
          isOpen={isHiredDialogOpen}
          onClose={() => {
            setIsHiredDialogOpen(false)
            setCandidateToAction(null)
          }}
          onConfirm={handleHiredConfirm}
          title="Mark as Hired"
          description={`Are you sure you want to mark ${candidateToAction?.candidateName} as hired?`}
          confirmText="Mark as Hired"
          cancelText="Cancel"
          variant="success"
        />

        {/* Mark as Interviewed Alert Dialog */}
        <AlertDialog
          isOpen={isInterviewedDialogOpen}
          onClose={() => {
            setIsInterviewedDialogOpen(false)
            setCandidateToAction(null)
          }}
          onConfirm={handleInterviewedConfirm}
          title="Mark as Interviewed"
          description={`Has the interview with ${candidateToAction?.candidateName} been completed?`}
          confirmText="Yes, Interview Completed"
          cancelText="Cancel"
          variant="success"
        />

        {/* View Candidate Modal */}
        {viewCandidate && (
          <Modal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false)
              setViewCandidate(null)
            }}
            title={`Candidate Details - ${viewCandidate.candidateName}`}
            footer={
              <div className="flex items-center justify-end gap-4">
                <Button variant="outline" onClick={() => {
                  setIsViewModalOpen(false)
                  setViewCandidate(null)
                }}>
                  Close
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              {/* Candidate Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Candidate Details</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Candidate Name</label>
                    <p className="text-sm text-neutral-900 mt-1">{viewCandidate.candidateName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job Applied For</label>
                    <p className="text-sm text-neutral-900 mt-1">{viewCandidate.jobAppliedFor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Job ID</label>
                    <p className="text-sm text-neutral-900 mt-1">{viewCandidate.jobId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Status</label>
                    <div className="mt-1">
                      <Badge variant={statusVariantMap[viewCandidate.status] as keyof typeof statusVariantMap}>
                        {statusLabels[viewCandidate.status]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Apply Date</label>
                    <p className="text-sm text-neutral-900 mt-1">{viewCandidate.applyDate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600">Location</label>
                    <p className="text-sm text-neutral-900 mt-1">{viewCandidate.location}</p>
                  </div>
                </div>
              </div>

              {/* Interview Details Section */}
              {viewCandidate.status === 'interviewing' && viewCandidate.interviewAt && (
                <div className="border-t border-neutral-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900">Interview Details</h3>
                    <button
                      onClick={() => handleEditInterview(viewCandidate)}
                      className="p-1.5 text-neutral-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                      title="Edit Interview"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Scheduled At</label>
                      <p className="text-sm text-neutral-900 mt-1">
                        {new Date(viewCandidate.interviewAt).toLocaleString([], {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-600">Meeting Link</label>
                      <p className="text-sm mt-1">
                        <a
                          href={viewCandidate.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 hover:text-sky-700 hover:underline break-all"
                        >
                          {viewCandidate.meetingLink}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              {(viewCandidate.email || viewCandidate.contactNumber) && (
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {viewCandidate.email && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Email</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.email}</p>
                      </div>
                    )}
                    {viewCandidate.contactNumber && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Contact Number</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.contactNumber}</p>
                      </div>
                    )}
                    {viewCandidate.willingToRelocate !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Willing to Relocate</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.willingToRelocate ? 'Yes' : 'No'}</p>
                      </div>
                    )}
                    {viewCandidate.inUK !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Location Status</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.inUK ? 'UK' : 'Non-UK'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Work Information Section */}
              {(viewCandidate.jobRole || viewCandidate.contractType || viewCandidate.registrationStatus) && (
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Work Information</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewCandidate.jobRole && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Job Role</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.jobRole}</p>
                      </div>
                    )}
                    {viewCandidate.contractType && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Contract Type</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.contractType}</p>
                      </div>
                    )}
                    {viewCandidate.registrationStatus && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Registration Status</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.registrationStatus}</p>
                      </div>
                    )}
                  </div>
                  {viewCandidate.notes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-neutral-600">Additional Notes</label>
                      <p className="text-sm text-neutral-900 mt-1 whitespace-pre-wrap">{viewCandidate.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Work Experience Section */}
              {(viewCandidate.nhsBand || viewCandidate.keySkills || viewCandidate.workRole || viewCandidate.employer) && (
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Work Experience</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {viewCandidate.nhsBand && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">NHS Band</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.nhsBand}</p>
                      </div>
                    )}
                    {viewCandidate.justStartingOut !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Career Level</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.justStartingOut ? 'Just Starting Out' : 'Experienced'}</p>
                      </div>
                    )}
                    {viewCandidate.workRole && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Previous Role</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.workRole}</p>
                      </div>
                    )}
                    {viewCandidate.employer && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Employer</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.employer}</p>
                      </div>
                    )}
                    {viewCandidate.countryOfWork && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Country of Work</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.countryOfWork}</p>
                      </div>
                    )}
                    {viewCandidate.jobLocationArea && (
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Work Location</label>
                        <p className="text-sm text-neutral-900 mt-1">{viewCandidate.jobLocationArea}</p>
                      </div>
                    )}
                  </div>
                  {viewCandidate.keySkills && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-neutral-600">Key Skills</label>
                      <p className="text-sm text-neutral-900 mt-1">{viewCandidate.keySkills}</p>
                    </div>
                  )}
                  {(viewCandidate.fromMonth || viewCandidate.fromYear) && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-neutral-600">Employment Period</label>
                      <p className="text-sm text-neutral-900 mt-1">
                        {viewCandidate.fromMonth && viewCandidate.fromYear && `${viewCandidate.fromMonth} ${viewCandidate.fromYear}`}
                        {viewCandidate.isCurrentJob ? ' - Present' : (viewCandidate.toMonth && viewCandidate.toYear && ` - ${viewCandidate.toMonth} ${viewCandidate.toYear}`)}
                      </p>
                    </div>
                  )}
                  {viewCandidate.workNotes && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-neutral-600">Work Experience Notes</label>
                      <p className="text-sm text-neutral-900 mt-1 whitespace-pre-wrap">{viewCandidate.workNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Section */}
              {(viewCandidate.resumeUrl || viewCandidate.certificatesUrl) && (
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Documents</h3>
                  <div className="flex flex-wrap gap-3">
                    {viewCandidate.resumeUrl && (
                      <a
                        href={viewCandidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">View Resume</span>
                      </a>
                    )}
                    {viewCandidate.certificatesUrl && (
                      <a
                        href={viewCandidate.certificatesUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm font-medium">View Certificates</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Setup Interview Modal */}
        {candidateToAction && (
          <Modal
            isOpen={isInterviewModalOpen}
            onClose={handleInterviewCancel}
            title="Setup Interview"
            description={`Schedule an interview for ${candidateToAction.candidateName}`}
            footer={
              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={handleInterviewCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleInterviewSubmit}
                  disabled={!interviewFormData.date || !interviewFormData.time || !interviewFormData.meetingUrl}
                  className="bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </Button>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Field */}
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-2 block">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={interviewFormData.date}
                    onChange={(e) => {
                      const selectedDate = e.target.value
                      const today = new Date().toISOString().split('T')[0]
                      // Only allow dates from today onwards
                      if (selectedDate >= today || selectedDate === "") {
                        setInterviewFormData(prev => ({ ...prev, date: selectedDate }))
                      }
                    }}
                    className="w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Time Field */}
                <div>
                  <label className="text-sm font-medium text-neutral-900 mb-2 block">
                    Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="time"
                    value={interviewFormData.time}
                    onChange={(e) => setInterviewFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Meeting URL Field */}
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Meeting URL <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  value={interviewFormData.meetingUrl}
                  onChange={(e) => setInterviewFormData(prev => ({ ...prev, meetingUrl: e.target.value }))}
                  className="w-full"
                  placeholder="https://meet.google.com/xxx-xxxx-xxx or paste your meeting link"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Paste your meeting link (Zoom, Google Meet, Teams, etc.)
                </p>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout >
  )
}
