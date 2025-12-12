"use client"

import { useState, useRef } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, X, Link as LinkIcon } from "lucide-react"
import Image from "next/image"

export default function CompanyProfilePage() {
  const [formData, setFormData] = useState({
    companyName: "St. Mary's NHS Trust",
    contactPersonName: "John Doe",
    businessEmail: "hr@yourcompany.com",
    contactNumber: "+44 7123 456789",
    companyWebsite: "stmarystrust.com",
    companyAddress: "123 Main Street, London, UK, W1A 1AA",
    aboutCompany: "St. Mary's NHS Trust, is a trusted healthcare recruitment provider connecting skilled professionals with leading hospitals and clinics across the UK. Our focus is on quality placements and compliance-driven solutions.",
    registrationNumber: "ABC-123456",
    vatTaxId: "GB123456789",
    numberOfEmployees: "51-200",
    yearEstablished: "2015",
    averageMonthlyHiring: "Range",
    jobVisibility: "public",
    linkedin: "",
    facebook: "",
    twitter: "",
    instagram: "",
  })

  const [preferredCategories, setPreferredCategories] = useState([
    "ICU Nurse",
    "ER Nurse",
    "Care Assistant",
    "Surgical Nurse",
  ])

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [kycFile, setKycFile] = useState<File | null>(null)
  const [kycFileName, setKycFileName] = useState<string>("")
  const logoInputRef = useRef<HTMLInputElement>(null)
  const kycInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoDelete = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) {
      logoInputRef.current.value = ""
    }
  }

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setKycFile(file)
      setKycFileName(file.name)
    }
  }

  const handleRemoveCategory = (category: string) => {
    setPreferredCategories(prev => prev.filter(c => c !== category))
  }

  const handleAddCategory = () => {
    const newCategory = prompt("Enter category name:")
    if (newCategory && !preferredCategories.includes(newCategory)) {
      setPreferredCategories(prev => [...prev, newCategory])
    }
  }

  const handleSave = () => {
    console.log("Saving company profile:", formData)
    console.log("Logo:", logoFile)
    console.log("KYC File:", kycFile)
    console.log("Preferred Categories:", preferredCategories)
  }

  const handleCancel = () => {
    console.log("Cancelled")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Company Profile</h1>
          <p className="text-neutral-600">Manage your company information and preferences</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Basic Information</h2>

            {/* Company Logo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {logoPreview ? (
                  <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-200 overflow-hidden flex items-center justify-center">
                    <Image
                      src={logoPreview}
                      alt="Company Logo"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-neutral-400" />
                  </div>
                )}
              </div>
              <div className="flex  gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex items-center gap-2 border-neutral-300"
                    onClick={() => logoInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Company Logo
                  </Button>
                </label>
                {(logoFile || logoPreview) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogoDelete}
                    className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 w-fit"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Company / Organization Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Contact Person Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.contactPersonName}
                  onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Business Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => handleInputChange("businessEmail", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Contact number
                </label>
                <Input
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Company Website
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={formData.companyWebsite}
                    onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                    className="w-full pr-10"
                  />
                  <LinkIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Company Verification Documents (KYC) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={kycInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleKycUpload}
                    className="hidden"
                    id="kyc-upload"
                  />
                  <label htmlFor="kyc-upload" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center gap-2 border-neutral-300 justify-start"
                      onClick={() => kycInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      {kycFileName || "Choose File"}
                    </Button>
                  </label>
                </div>
                {!kycFileName && (
                  <p className="text-xs text-neutral-500 mt-1">No file chosen</p>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Company Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.companyAddress}
                  onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  About Company <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.aboutCompany}
                  onChange={(e) => handleInputChange("aboutCompany", e.target.value)}
                  rows={4}
                  className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8] disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Details Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Business Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Company Registration Number <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  VAT / Tax ID <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.vatTaxId}
                  onChange={(e) => handleInputChange("vatTaxId", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Number of Employees <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.numberOfEmployees}
                  onChange={(e) => handleInputChange("numberOfEmployees", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                  required
                >
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Year Established <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.yearEstablished}
                  onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                  required
                >
                  {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hiring Preferences Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Hiring Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Preferred Job Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-2 min-h-[42px] p-2 border border-neutral-300 rounded-md">
                  {preferredCategories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Average Monthly Hiring Volume
                </label>
                <select
                  value={formData.averageMonthlyHiring}
                  onChange={(e) => handleInputChange("averageMonthlyHiring", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8]"
                >
                  <option value="Range">Range</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-20">11-20</option>
                  <option value="21-50">21-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-neutral-900 mb-3 block">
                  Job Visibility Settings
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobVisibility"
                      value="public"
                      checked={formData.jobVisibility === "public"}
                      onChange={(e) => handleInputChange("jobVisibility", e.target.value)}
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-neutral-900">Public</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobVisibility"
                      value="limited"
                      checked={formData.jobVisibility === "limited"}
                      onChange={(e) => handleInputChange("jobVisibility", e.target.value)}
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm text-neutral-900">Limited visibility</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Links Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Social Media Links</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Linkedin
                </label>
                <Input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Facebook
                </label>
                <Input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleInputChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Twitter
                </label>
                <Input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Instagram
                </label>
                <Input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
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

