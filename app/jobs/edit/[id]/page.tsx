"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import Link from "next/link"

// Mock data - in real app, fetch from API
const mockJobData = {
  id: 1,
  jobTitle: "ICU Nurse",
  jobId: "JOB-8X2KLM",
  specialization: "Intensive Care",
  employmentType: "Full-time",
  yearsOfExperience: "3",
  postedDate: "2025-09-25",
  closedDate: "2025-09-30",
  numberOfOpenings: "2",
  status: "active",
  paymentType: "Range",
  minimum: "3000",
  maximum: "4000",
  startingAmount: "",
  rate: "per month",
  overview: "We are looking for an experienced ICU Nurse...",
  qualifications: "Registered Nurse with ICU certification...",
  applicationProcess: "Submit your application through our portal...",
}

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  
  const [activeTab, setActiveTab] = useState("overview")
  const [formData, setFormData] = useState({
    jobTitle: "",
    jobId: "",
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
    // In real app, fetch job data by ID from API
    // For now, using mock data
    if (jobId) {
      setFormData({
        jobTitle: mockJobData.jobTitle,
        jobId: mockJobData.jobId,
        specialization: mockJobData.specialization,
        employmentType: mockJobData.employmentType,
        yearsOfExperience: mockJobData.yearsOfExperience,
        postedDate: mockJobData.postedDate,
        closedDate: mockJobData.closedDate,
        numberOfOpenings: mockJobData.numberOfOpenings,
        status: mockJobData.status,
        paymentType: mockJobData.paymentType,
        minimum: mockJobData.minimum,
        maximum: mockJobData.maximum,
        startingAmount: mockJobData.startingAmount,
        rate: mockJobData.rate,
        overview: mockJobData.overview,
        qualifications: mockJobData.qualifications,
        applicationProcess: mockJobData.applicationProcess,
      })
    }
  }, [jobId])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission - update job data
    console.log("Updating job:", formData)
    router.push("/jobs")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-neutral-900">Edit Job</h1>
        </div>

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
                  placeholder="Enter job ID"
                  value={formData.jobId}
                  onChange={(e) => handleInputChange("jobId", e.target.value)}
                  className="w-full"
                />
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
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white rounded-full">
              Update Job
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

