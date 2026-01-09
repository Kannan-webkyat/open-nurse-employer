"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"
import { jobPostApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const toast = useToast() as {
    success: (message: string, options?: { title?: string; duration?: number }) => void
    error: (message: string, options?: { title?: string; duration?: number }) => void
    info: (message: string, options?: { title?: string; duration?: number }) => void
    warning: (message: string, options?: { title?: string; duration?: number }) => void
  }
  const jobId = params.id as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobId: "",
    location: "",
    specialization: "",
    employmentType: "",
    yearsOfExperience: "",
    postedDate: "",
    closedDate: "",
    numberOfOpenings: "",
    status: "",
    paymentType: "Range",
    minimum: "",
    maximum: "",
    startingAmount: "",
    rate: "per month",
    overview: "",
    qualifications: "",
    applicationProcess: "",
  })

  useEffect(() => {
    const fetchJob = async () => {
      if (!jobId) return
      
      setIsLoading(true)
      try {
        const response = await jobPostApi.getById(jobId)
        if (response.success && 'data' in response && response.data) {
          const job = response.data as any
          
          // Format dates for input fields (YYYY-MM-DD)
          const formatDateForInput = (dateString: string) => {
            if (!dateString) return ""
            const date = new Date(dateString)
            return date.toISOString().split('T')[0]
          }

          setFormData({
            jobTitle: job.title || "",
            jobId: job.job_id || "",
            location: job.location || "",
            specialization: job.specialization || "",
            employmentType: job.employment_type || "",
            yearsOfExperience: job.years_of_experience?.toString() || "",
            postedDate: formatDateForInput(job.posted_date),
            closedDate: formatDateForInput(job.closed_date),
            numberOfOpenings: job.number_of_openings?.toString() || "",
            status: job.status || "",
            paymentType: job.payment_type === "range" ? "Range" : "Starting amount",
            minimum: job.minimum_amount?.toString() || "",
            maximum: job.maximum_amount?.toString() || "",
            startingAmount: job.amount?.toString() || "",
            rate: job.rate || "per month",
            overview: job.overview || "",
            qualifications: job.qualifications || "",
            applicationProcess: job.application_process || "",
          })
        } else {
          console.error('Failed to fetch job:', response.message)
          const errorMessage = response.message || 'Failed to load job'
          toast.error(errorMessage, {
            title: 'Error',
            duration: 5000,
          })
          setTimeout(() => {
            router.push("/jobs")
          }, 1000)
        }
      } catch (error) {
        console.error('Error fetching job:', error)
        toast.error('An error occurred while loading the job', {
          title: 'Error',
          duration: 5000,
        })
        setTimeout(() => {
          router.push("/jobs")
        }, 1000)
      } finally {
        setIsLoading(false)
      }
    }

    fetchJob()
  }, [jobId, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Prepare API payload
      const payload: any = {
        title: formData.jobTitle,
        specialization: formData.specialization,
        location: formData.location,
        employment_type: formData.employmentType,
        posted_date: formData.postedDate,
        closed_date: formData.closedDate,
        number_of_openings: parseInt(formData.numberOfOpenings) || 1,
        status: formData.status as 'active' | 'paused' | 'draft' | 'closed',
        payment_type: formData.paymentType === "Range" ? "range" : "starting_amount",
        rate: formData.rate,
        overview: formData.overview,
        qualifications: formData.qualifications,
        application_process: formData.applicationProcess,
      }

      // Add payment fields based on payment type
      if (formData.paymentType === "Range") {
        payload.minimum_amount = parseFloat(formData.minimum) || 0
        payload.maximum_amount = parseFloat(formData.maximum) || 0
      } else {
        payload.amount = parseFloat(formData.startingAmount) || 0
      }

      // Add years of experience if provided
      if (formData.yearsOfExperience) {
        payload.years_of_experience = parseInt(formData.yearsOfExperience) || 0
      }

      const response = await jobPostApi.update(jobId, payload)

      if (response.success) {
        toast.success('Job updated successfully!', {
          title: 'Success',
          duration: 3000,
        })
        setTimeout(() => {
          router.push("/jobs")
        }, 500)
      } else {
        const errorMessage = response.message || 'Failed to update job'
        toast.error(errorMessage, {
          title: 'Error',
          duration: 5000,
        })
        if (response.errors) {
          console.error('Validation errors:', response.errors)
        }
      }
    } catch (error) {
      console.error('Error updating job:', error)
      toast.error('An error occurred while updating the job', {
        title: 'Error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Edit Job</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-neutral-600">Loading job details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Job Details Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Job Details</h2>
            
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Job ID
                </label>
                <Input
                  type="text"
                  value={formData.jobId}
                  readOnly
                  disabled
                  className="w-full bg-neutral-50 cursor-not-allowed"
                />
                <p className="text-xs text-neutral-500 mt-1">Job ID is auto-generated by the system</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter specialization"
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter job location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Employment Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => handleInputChange("employmentType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                >
                  <option value="">Select Employment type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Years of experience <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter years of experience"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Posted Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.postedDate}
                    onChange={(e) => handleInputChange("postedDate", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Closed Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={formData.closedDate}
                    onChange={(e) => handleInputChange("closedDate", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Number of Openings
                </label>
                <Input
                  type="number"
                  placeholder="Enter number of openings"
                  value={formData.numberOfOpenings}
                  onChange={(e) => handleInputChange("numberOfOpenings", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Specify Pay Rate Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Specify Pay Rate</h2>
              <p className="text-sm text-neutral-600">Set the pay rate for this job based on your requirements.</p>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Payment type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => handleInputChange("paymentType", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                >
                  <option value="Range">Range</option>
                  <option value="Starting amount">Starting amount</option>
                </select>
              </div>

              {formData.paymentType === "Starting amount" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">£</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.startingAmount}
                        onChange={(e) => handleInputChange("startingAmount", e.target.value)}
                        className="w-full pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Rate
                    </label>
                    <select
                      value={formData.rate}
                      onChange={(e) => handleInputChange("rate", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                    >
                      <option value="per month">per month</option>
                      <option value="per hour">per hour</option>
                      <option value="per day">per day</option>
                      <option value="per year">per year</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Minimum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">£</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.minimum}
                        onChange={(e) => handleInputChange("minimum", e.target.value)}
                        className="w-full pl-8"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Maximum <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600">£</span>
                      <span className="absolute left-8 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm">to</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.maximum}
                        onChange={(e) => handleInputChange("maximum", e.target.value)}
                        className="w-full pl-14"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Rate
                    </label>
                    <select
                      value={formData.rate}
                      onChange={(e) => handleInputChange("rate", e.target.value)}
                      className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                    >
                      <option value="per month">per month</option>
                      <option value="per hour">per hour</option>
                      <option value="per day">per day</option>
                      <option value="per year">per year</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Job Description Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            {/* Tabs */}
            <div className="border-b border-neutral-200">
              <div className="flex gap-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 px-1 text-sm font-medium transition-colors ${
                    activeTab === "overview"
                      ? "text-sky-600 border-b-2 border-sky-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("qualifications")}
                  className={`pb-4 px-1 text-sm font-medium transition-colors ${
                    activeTab === "qualifications"
                      ? "text-sky-600 border-b-2 border-sky-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Qualifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("applicationProcess")}
                  className={`pb-4 px-1 text-sm font-medium transition-colors ${
                    activeTab === "applicationProcess"
                      ? "text-sky-600 border-b-2 border-sky-600"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Application Process
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "overview" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    About the role <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.overview}
                    onChange={(e) => handleInputChange("overview", e.target.value)}
                    placeholder="Enter job description..."
                    className="flex min-h-[200px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                  />
                </div>
              )}

              {activeTab === "qualifications" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Qualifications <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    placeholder="Enter required qualifications..."
                    className="flex min-h-[200px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                  />
                </div>
              )}

              {activeTab === "applicationProcess" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Application Process <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.applicationProcess}
                    onChange={(e) => handleInputChange("applicationProcess", e.target.value)}
                    placeholder="Enter application process details..."
                    className="flex min-h-[200px] w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pb-6">
            <Link href="/jobs">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white rounded-full" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </DashboardLayout>
  )
}

