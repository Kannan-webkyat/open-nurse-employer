"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

interface BlockedCandidate {
  id: number
  name: string
  email: string
  blockedDate: string
}

interface BlockedEmployer {
  id: number
  companyName: string
  blockedDate: string
}

export default function PrivacyCompliancePage() {
  const [formData, setFormData] = useState({
    candidateDataVisibility: false,
    consentForMarketingEmails: false,
    dataRetentionPolicy: "6 months",
  })

  const [blockType, setBlockType] = useState<"candidate" | "employer">("employer")
  const [blockInput, setBlockInput] = useState("")

  const [blockedCandidates, setBlockedCandidates] = useState<BlockedCandidate[]>([
    { id: 1, name: "Emma Johnson", email: "emma.johnson@email.com", blockedDate: "2025-09-01" },
    { id: 2, name: "Emma Johnson", email: "emma.johnson@email.com", blockedDate: "2025-08-25" },
  ])

  const [blockedEmployers, setBlockedEmployers] = useState<BlockedEmployer[]>([
    { id: 1, companyName: "Care Plus Nursing Ltd.", blockedDate: "2025-09-01" },
    { id: 2, companyName: "MedStaff Recruitment Ltd.", blockedDate: "2025-08-25" },
  ])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUnblockCandidate = (id: number) => {
    setBlockedCandidates(prev => prev.filter(candidate => candidate.id !== id))
  }

  const handleUnblockEmployer = (id: number) => {
    setBlockedEmployers(prev => prev.filter(employer => employer.id !== id))
  }

  const handleBlock = () => {
    if (!blockInput.trim()) return

    if (blockType === "candidate") {
      const newCandidate: BlockedCandidate = {
        id: Date.now(),
        name: blockInput,
        email: `${blockInput.toLowerCase().replace(/\s+/g, ".")}@email.com`,
        blockedDate: new Date().toISOString().split("T")[0],
      }
      setBlockedCandidates(prev => [...prev, newCandidate])
    } else {
      const newEmployer: BlockedEmployer = {
        id: Date.now(),
        companyName: blockInput,
        blockedDate: new Date().toISOString().split("T")[0],
      }
      setBlockedEmployers(prev => [...prev, newEmployer])
    }
    setBlockInput("")
  }

  const handleSave = () => {
    console.log("Saving privacy and compliance settings:", formData)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Privacy & Compliance</h1>
          <p className="text-neutral-600">Manage your privacy and compliance settings</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Data Privacy Preferences (GDPR / Compliance) */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Data Privacy Preferences (GDPR / Compliance)</h2>
            <div className="space-y-6">
              {/* Candidate Data Visibility */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Candidate Data Visibility</p>
                  <p className="text-sm text-neutral-600 mt-1">Control visibility of candidate data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.candidateDataVisibility}
                    onChange={(e) => handleInputChange("candidateDataVisibility", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>

              {/* Consent for Marketing Emails */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Consent for Marketing Emails</p>
                  <p className="text-sm text-neutral-600 mt-1">Allow marketing communications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentForMarketingEmails}
                    onChange={(e) => handleInputChange("consentForMarketingEmails", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              {/* Data Retention Policy */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="text-sm font-medium text-neutral-900 mb-3 block">
                  Data Retention Policy
                </label>
                <select
                  value={formData.dataRetentionPolicy}
                  onChange={(e) => handleInputChange("dataRetentionPolicy", e.target.value)}
                  className="flex h-10 w-full max-w-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                >
                  <option value="1 month">1 month</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="1 year">1 year</option>
                  <option value="2 years">2 years</option>
                  <option value="5 years">5 years</option>
                </select>
              </div>
            </div>
          </div>

          {/* Blocked Candidates / Employers */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Blocked Candidates / Employers</h2>
            
            {/* Blocked Candidates */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Blocked Candidates</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Blocked date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell className="text-neutral-900">{candidate.name}</TableCell>
                      <TableCell className="text-neutral-600">{candidate.email}</TableCell>
                      <TableCell className="text-neutral-600">{candidate.blockedDate}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleUnblockCandidate(candidate.id)}
                          className="border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                          Unlock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Blocked Employers */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Blocked Employers</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company name</TableHead>
                    <TableHead>Blocked date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedEmployers.map((employer) => (
                    <TableRow key={employer.id}>
                      <TableCell className="text-neutral-900">{employer.companyName}</TableCell>
                      <TableCell className="text-neutral-600">{employer.blockedDate}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleUnblockEmployer(employer.id)}
                          className="border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
                        >
                          Unlock
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add New Block */}
            <div className="pt-6 border-t border-neutral-200">
              <h3 className="text-sm font-semibold text-neutral-900 mb-4">Add New Block</h3>
              <div className="flex items-center gap-6">
                {/* Radio Buttons */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-all ${
                      blockType === "candidate" 
                        ? "border-[#00EB23] bg-[#00EB23]" 
                        : "border-neutral-300 bg-white group-hover:border-[#00EB23]/50"
                    }`}>
                      {blockType === "candidate" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="blockType"
                      value="candidate"
                      checked={blockType === "candidate"}
                      onChange={() => setBlockType("candidate")}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-neutral-900">Candidate</span>
                  </label>

                  <label className="flex items-center cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-all ${
                      blockType === "employer" 
                        ? "border-[#00EB23] bg-[#00EB23]" 
                        : "border-neutral-300 bg-white group-hover:border-[#00EB23]/50"
                    }`}>
                      {blockType === "employer" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <input
                      type="radio"
                      name="blockType"
                      value="employer"
                      checked={blockType === "employer"}
                      onChange={() => setBlockType("employer")}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-neutral-900">Employer</span>
                  </label>
                </div>

                {/* Input Field */}
                <Input
                  type="text"
                  value={blockInput}
                  onChange={(e) => setBlockInput(e.target.value)}
                  placeholder={blockType === "candidate" ? "Enter candidate name" : "Enter employer name"}
                  className="flex-1 max-w-md"
                />

                {/* Block Button */}
                <Button
                  type="button"
                  onClick={handleBlock}
                  disabled={!blockInput.trim()}
                  className="!bg-red-100 !text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Block
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button
              type="button"
              variant="outline"
              className="border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-sky-600 text-white hover:bg-sky-700"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
