"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { TablePagination } from "@/components/ui/table-pagination"
import { Search, Filter, Eye, Check, MoreVertical, X, MessageSquare, Maximize2, Paperclip, Send, MapPin, Phone, Calendar, UserCheck, Trash2, XCircle } from "lucide-react"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { Modal } from "@/components/ui/modal"

interface Candidate {
  id: number
  candidateName: string
  jobAppliedFor: string
  jobId: string
  status: "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired"
  applyDate: string
  location: string
}

const candidatesData: Candidate[] = [
  { id: 1, candidateName: "Emma Johnson", jobAppliedFor: "ICU Nurse", jobId: "JOB-8X2KLM", status: "rejected", applyDate: "Sep 20, 2025", location: "London" },
  { id: 2, candidateName: "Olivia Smith", jobAppliedFor: "Pediatric Nurse", jobId: "JOB-Q9Z4HT", status: "shortlisted", applyDate: "Sep 21, 2025", location: "Manchester" },
  { id: 3, candidateName: "Ava Brown", jobAppliedFor: "ER Nurse", jobId: "JOB-K7M3LD", status: "reviewed", applyDate: "Sep 22, 2025", location: "Birmingham" },
  { id: 4, candidateName: "Sophia Davis", jobAppliedFor: "Surgical Nurse", jobId: "JOB-V4TUP", status: "shortlisted", applyDate: "Sep 23, 2025", location: "Liverpool" },
  { id: 5, candidateName: "Isabella Wilson", jobAppliedFor: "Community Health Nurse", jobId: "JOB-A2R6BN", status: "rejected", applyDate: "Sep 24, 2025", location: "Leeds" },
  { id: 6, candidateName: "Mia Martinez", jobAppliedFor: "Oncology Nurse", jobId: "JOB-P3X8WR", status: "reviewed", applyDate: "Sep 25, 2025", location: "Sheffield" },
  { id: 7, candidateName: "Charlotte Anderson", jobAppliedFor: "Psychiatric Nurse", jobId: "JOB-N6D7QK", status: "shortlisted", applyDate: "Sep 26, 2025", location: "Bristol" },
  { id: 8, candidateName: "Amelia Taylor", jobAppliedFor: "Dialysis Nurse", jobId: "JOB-H5Y9LM", status: "rejected", applyDate: "Sep 27, 2025", location: "Edinburgh" },
  { id: 9, candidateName: "Harper Thomas", jobAppliedFor: "Geriatric Nurse", jobId: "JOB-J2F8XZ", status: "shortlisted", applyDate: "Sep 28, 2025", location: "Glasgow" },
  { id: 10, candidateName: "Evelyn Jackson", jobAppliedFor: "Operating Room Nurse", jobId: "JOB-W9L6TR", status: "rejected", applyDate: "Sep 29, 2025", location: "Cardiff" },
  { id: 11, candidateName: "Abigail White", jobAppliedFor: "ICU Nurse", jobId: "ICU-7K9M2B", status: "reviewed", applyDate: "Sep 30, 2025", location: "London" },
  { id: 12, candidateName: "Emily Harris", jobAppliedFor: "Pediatric Nurse", jobId: "JOB-Q9Z4HT", status: "shortlisted", applyDate: "Oct 1, 2025", location: "Manchester" },
  { id: 13, candidateName: "Elizabeth Martin", jobAppliedFor: "ER Nurse", jobId: "JOB-K7M3LD", status: "rejected", applyDate: "Oct 2, 2025", location: "Birmingham" },
  { id: 14, candidateName: "Sofia Garcia", jobAppliedFor: "Surgical Nurse", jobId: "JOB-V4TUP", status: "reviewed", applyDate: "Oct 3, 2025", location: "Liverpool" },
  { id: 15, candidateName: "Avery Rodriguez", jobAppliedFor: "Community Health Nurse", jobId: "JOB-A2R6BN", status: "shortlisted", applyDate: "Oct 4, 2025", location: "Leeds" },
]

const statusVariantMap = {
  new: "new",
  reviewed: "reviewed",
  shortlisted: "shortlisted",
  contacting: "contacting",
  interviewing: "interviewing",
  rejected: "rejected",
  hired: "hired",
} as const

const statusLabels = {
  new: "New",
  reviewed: "Viewed",
  shortlisted: "Shortlisted",
  contacting: "Contacting",
  interviewing: "Interviewing",
  rejected: "Rejected",
  hired: "Hired",
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>(candidatesData)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  const [activeTab, setActiveTab] = useState<"all" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired">("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    location: "",
    applyDateFrom: "",
    applyDateTo: "",
  })
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [messageText, setMessageText] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isShortlistDialogOpen, setIsShortlistDialogOpen] = useState(false)
  const [isHiredDialogOpen, setIsHiredDialogOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null)
  const [candidateToAction, setCandidateToAction] = useState<Candidate | null>(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [interviewFormData, setInterviewFormData] = useState({
    date: "",
    time: "",
    meetingUrl: "",
  })

  const filterRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)

  const messageTemplates = [
    "Thank you for applying. We have received your application.",
    "We will get back to you with the next steps soon.",
    "We would like to schedule an interview. Please share your availability."
  ]

  // Filter candidates based on search, tab, and filters
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobAppliedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobId.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTab = activeTab === "all" || candidate.status === activeTab
    
    const matchesLocation = !filters.location || candidate.location === filters.location
    const matchesDateFrom = !filters.applyDateFrom || candidate.applyDate >= filters.applyDateFrom
    const matchesDateTo = !filters.applyDateTo || candidate.applyDate <= filters.applyDateTo
    
    return matchesSearch && matchesTab && matchesLocation && matchesDateFrom && matchesDateTo
  })

  // Count candidates by status
  const statusCounts = {
    all: candidates.length,
    new: candidates.filter(c => c.status === "new").length,
    reviewed: candidates.filter(c => c.status === "reviewed").length,
    shortlisted: candidates.filter(c => c.status === "shortlisted").length,
    contacting: candidates.filter(c => c.status === "contacting").length,
    interviewing: candidates.filter(c => c.status === "interviewing").length,
    rejected: candidates.filter(c => c.status === "rejected").length,
    hired: candidates.filter(c => c.status === "hired").length,
  }

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

  const handleMessageClick = (candidate: Candidate) => {
    console.log("Opening message panel for:", candidate.candidateName)
    setSelectedCandidate(candidate)
    setIsMessageOpen(true)
    setOpenMenuId(null)
    setMessageText("")
    setSelectedTemplate(null)
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

  const handleShortlistConfirm = () => {
    if (candidateToAction) {
      // TODO: Implement shortlist functionality
      console.log("Shortlisting candidate:", candidateToAction.candidateName)
      setIsShortlistDialogOpen(false)
      setCandidateToAction(null)
    }
  }

  const handleRejectConfirm = () => {
    if (candidateToAction) {
      setCandidates(prevCandidates =>
        prevCandidates.map(c =>
          c.id === candidateToAction.id ? { ...c, status: "rejected" as const } : c
        )
      )
      setIsRejectDialogOpen(false)
      setCandidateToAction(null)
    }
  }

  const handleDeleteConfirm = () => {
    if (candidateToAction) {
      // TODO: Implement delete functionality
      console.log("Deleting candidate:", candidateToAction.candidateName)
      setIsDeleteDialogOpen(false)
      setCandidateToAction(null)
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

  const handleInterviewSubmit = () => {
    if (candidateToAction && interviewFormData.date && interviewFormData.time && interviewFormData.meetingUrl) {
      // TODO: Implement interview setup functionality
      console.log("Setting up interview for:", candidateToAction.candidateName, interviewFormData)
      // Optionally update candidate status to "interviewing"
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

  const handleViewClick = (candidate: Candidate) => {
    setViewCandidate(candidate)
    setIsViewModalOpen(true)
  }

  const handleHiredConfirm = () => {
    if (candidateToAction) {
      setCandidates(prevCandidates =>
        prevCandidates.map(c =>
          c.id === candidateToAction.id ? { ...c, status: "hired" as const } : c
        )
      )
      setIsHiredDialogOpen(false)
      setCandidateToAction(null)
    }
  }

  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredCandidates.length / rowsPerPage)

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  // Get unique locations for dropdown
  const uniqueLocations = Array.from(new Set(candidates.map(c => c.location))).sort()

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
            { key: "rejected", label: "Rejected" },
            { key: "hired", label: "Hired" },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key)
                setCurrentPage(1)
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {label}
              {statusCounts[key] > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === key
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
          <Table>
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
              {paginatedCandidates.map((candidate, index) => (
                <TableRow key={candidate.id}>
                  <TableCell className="text-neutral-800">
                    {startIndex + index + 1}
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
                    <Badge variant={statusVariantMap[candidate.status] as keyof typeof statusVariantMap}>
                      {statusLabels[candidate.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3 relative">
                      {candidate.status === "rejected" ? (
                        <button 
                          className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-red-700 hover:bg-red-100 transition-colors group relative"
                          title="Rejected"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Rejected
                          </span>
                        </button>
                      ) : (
                        <button 
                          className="bg-neutral-100 rounded-full p-1 text-neutral-600 hover:text-green-700 hover:bg-green-100 transition-colors group relative"
                          title="Shortlisted"
                          onClick={() => handleShortlistClick(candidate)}
                        >
                          <Check className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Shortlisted
                          </span>
                        </button>
                      )}
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
                          onClick={() => setOpenMenuId(openMenuId === candidate.id ? null : candidate.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            More options
                          </span>
                        </button>
                        {openMenuId === candidate.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCall(candidate)
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Phone className="w-4 h-4" />
                              Call (Optional)
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetUpInterview(candidate)
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Set up interview
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsHired(candidate)
                              }}
                              className="w-full px-4 py-2 text-sm text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2"
                            >
                              <UserCheck className="w-4 h-4" />
                              Mark as hired
                            </button>
                            <div className="border-t border-neutral-200 my-1"></div>
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
                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                          selectedTemplate === index
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
                <div className="grid grid-cols-4 gap-4">
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
    </DashboardLayout>
  )
}
