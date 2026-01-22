"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, Trash2, X, Link as LinkIcon, Building, Globe, Mail, Phone, FileText, Layout, Save, User, Calendar, ShieldCheck, MapPin } from "lucide-react"
import Image from "next/image"
import { employerProfileApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { Modal } from "@/components/ui/modal"

export default function CompanyProfilePage() {
  const toast = useToast() as {
    success: (message: string, options?: { title?: string; duration?: number }) => void
    error: (message: string, options?: { title?: string; duration?: number }) => void
    info: (message: string, options?: { title?: string; duration?: number }) => void
    warning: (message: string, options?: { title?: string; duration?: number }) => void
  }
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactPersonName: "",
    businessEmail: "",
    contactNumber: "",
    companyWebsite: "",
    companyAddress: "",
    aboutCompany: "",
    registrationNumber: "",
    vatTaxId: "",
    numberOfEmployees: "",
    yearEstablished: "",
    averageMonthlyHiring: "",
    jobVisibility: "public",
    linkedin: "",
    facebook: "",
    twitter: "",
    instagram: "",
  })

  const [preferredCategories, setPreferredCategories] = useState<string[]>([])
  const [preferredCategoryIds, setPreferredCategoryIds] = useState<number[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [activeTab, setActiveTab] = useState<'overview' | 'business' | 'social'>('overview')

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [shouldDeleteLogo, setShouldDeleteLogo] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [kycFile, setKycFile] = useState<File | null>(null)
  const [kycFileName, setKycFileName] = useState<string>("")
  const [kycFileUrl, setKycFileUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const kycInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file', {
        title: 'Invalid File',
        duration: 3000,
      })
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB', {
        title: 'File Too Large',
        duration: 3000,
      })
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload immediately
    setIsUploadingLogo(true)
    setLogoFile(file)
    setShouldDeleteLogo(false)

    try {
      const updateData: any = {
        company_logo: file,
        delete_company_logo: false,
      }

      const response = await employerProfileApi.updateProfile(updateData)

      if (response.success) {
        toast.success('Logo updated successfully!', {
          title: 'Success',
          duration: 3000,
        })

        // Clear the file state since it's now saved
        setLogoFile(null)

        // Refresh profile to get updated logo URL
        const profileResponse = await employerProfileApi.getProfile()
        if (profileResponse.success && 'data' in profileResponse && profileResponse.data) {
          const user = profileResponse.data as any
          const employer = user.employer || {}
          if (employer.company_logo) {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
            // Handle both relative paths (starting with /) and paths without leading slash
            const logoPath = employer.company_logo.startsWith('/') 
              ? employer.company_logo.substring(1) 
              : employer.company_logo
            const newLogoUrl = `${apiBaseUrl}/storage/${logoPath}`
            setLogoUrl(newLogoUrl)
            setLogoPreview(newLogoUrl)
          }
        }

        // Dispatch event to update header logo
        setTimeout(() => {
          window.dispatchEvent(new Event('profileUpdated'))
        }, 500)
      } else {
        // Extract error message from response
        let errorMessage = 'Failed to update logo'
        
        // Check for field-specific errors first
        if (response.errors && response.errors.company_logo && Array.isArray(response.errors.company_logo)) {
          errorMessage = response.errors.company_logo[0]
        } else if (response.errors && response.errors.company_logo) {
          errorMessage = response.errors.company_logo
        } else if (response.message) {
          errorMessage = response.message
        } else if (typeof response === 'string') {
          errorMessage = response
        }
        
        toast.error(errorMessage, {
          title: 'Upload Failed',
          duration: 6000,
        })
        
        // Revert preview on error
        setLogoPreview(logoUrl || null)
        setLogoFile(null)
        if (logoInputRef.current) {
          logoInputRef.current.value = ""
        }
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error)
      
      // Extract error message from various possible formats
      let errorMessage = 'An error occurred while uploading the logo'
      
      if (error?.response?.data) {
        const errorData = error.response.data
        
        // Check for field-specific errors
        if (errorData.errors?.company_logo) {
          const logoErrors = errorData.errors.company_logo
          errorMessage = Array.isArray(logoErrors) ? logoErrors[0] : logoErrors
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.errors?.company_logo) {
        const logoErrors = error.errors.company_logo
        errorMessage = Array.isArray(logoErrors) ? logoErrors[0] : logoErrors
      }
      
      toast.error(errorMessage, {
        title: 'Upload Failed',
        duration: 6000,
      })
      
      // Revert preview on error
      setLogoPreview(logoUrl || null)
      setLogoFile(null)
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!confirm('Are you sure you want to remove the company logo?')) {
      return
    }

    setIsUploadingLogo(true)
    setShouldDeleteLogo(true)

    try {
      const updateData: any = {
        delete_company_logo: true,
      }

      const response = await employerProfileApi.updateProfile(updateData)

      if (response.success) {
        toast.success('Logo removed successfully!', {
          title: 'Success',
          duration: 3000,
        })

        // Clear logo state
        setLogoFile(null)
        setLogoPreview(null)
        setLogoUrl(null)
        setShouldDeleteLogo(false)

        // Dispatch event to update header
        setTimeout(() => {
          window.dispatchEvent(new Event('profileUpdated'))
        }, 500)
      } else {
        const errorMessage = response.message || 'Failed to remove logo'
        toast.error(errorMessage, {
          title: 'Error',
          duration: 5000,
        })
        setShouldDeleteLogo(false)
      }
    } catch (error) {
      console.error('Error deleting logo:', error)
      toast.error('An error occurred while removing the logo', {
        title: 'Error',
        duration: 5000,
      })
      setShouldDeleteLogo(false)
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) {
        logoInputRef.current.value = ""
      }
    }
  }

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setKycFile(file)
      setKycFileName(file.name)
      setKycFileUrl(null) // Clear URL when new file is selected
    }
  }

  const handleRemoveCategory = (category: string) => {
    setPreferredCategories(prev => prev.filter(c => c !== category))
  }

  const handleAddCategory = () => {
    setIsCategoryModalOpen(true)
    setNewCategory("")
  }

  const handleConfirmAddCategory = () => {
    if (newCategory.trim()) {
      if (!preferredCategories.includes(newCategory.trim())) {
        setPreferredCategories(prev => [...prev, newCategory.trim()])
        setIsCategoryModalOpen(false)
        setNewCategory("")
      } else {
        toast.error("Category already exists")
      }
    }
  }

  // Fetch profile data function (reusable)
  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await employerProfileApi.getProfile()
      if (response.success && 'data' in response && response.data) {
        const user = response.data as any
        const employer = user.employer || {}

        // Set form data
        setFormData({
          companyName: employer.company_name || "",
          contactPersonName: employer.hiring_person_name || "",
          businessEmail: user.email || "",
          contactNumber: user.phone || "",
          companyWebsite: employer.company_website || "",
          companyAddress: employer.company_address || "",
          aboutCompany: employer.about_company || "",
          registrationNumber: employer.company_registration_number || "",
          vatTaxId: employer.vat_tax_id || "",
          numberOfEmployees: employer.number_of_employees || "",
          yearEstablished: employer.year_established?.toString() || "",
          averageMonthlyHiring: employer.average_monthly_hiring_volume || "",
          jobVisibility: employer.job_visibility || "public",
          linkedin: employer.linkedin_url || "",
          facebook: employer.facebook_url || "",
          twitter: employer.twitter_url || "",
          instagram: employer.instagram_url || "",
        })

        // Set logo URL if exists
        if (employer.company_logo) {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'
          // Handle both relative paths (starting with /) and paths without leading slash
          const logoPath = employer.company_logo.startsWith('/') 
            ? employer.company_logo.substring(1) 
            : employer.company_logo
          const logoUrl = `${apiBaseUrl}/storage/${logoPath}`
          setLogoUrl(logoUrl)
          setLogoPreview(logoUrl)
          setShouldDeleteLogo(false) // Reset delete flag when fetching profile
        } else {
          // Clear logo if not present
          setLogoUrl(null)
          setLogoPreview(null)
          setShouldDeleteLogo(false) // Reset delete flag
        }

        // Set KYC document name if exists
        if (employer.kyc_document) {
          const fileName = employer.kyc_document.split('/').pop() || "Document uploaded"
          setKycFileName(fileName)
          const kycUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}/storage/${employer.kyc_document}`
          setKycFileUrl(kycUrl)
        } else {
          // Clear KYC file name if not present
          setKycFileName("")
          setKycFileUrl(null)
        }

        // Set preferred categories
        if (employer.job_categories && Array.isArray(employer.job_categories)) {
          const categoryNames = employer.job_categories.map((cat: any) => cat.name || cat.slug || "")
          const categoryIds = employer.job_categories.map((cat: any) => cat.id)
          setPreferredCategories(categoryNames.filter(Boolean))
          setPreferredCategoryIds(categoryIds)
        } else {
          setPreferredCategories([])
          setPreferredCategoryIds([])
        }
      } else {
        console.error('Failed to fetch profile:', response.message)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updateData: any = {
        company_name: formData.companyName,
        hiring_person_name: formData.contactPersonName,
        company_website: formData.companyWebsite || undefined,
        company_address: formData.companyAddress,
        about_company: formData.aboutCompany,
        company_registration_number: formData.registrationNumber,
        vat_tax_id: formData.vatTaxId,
        number_of_employees: formData.numberOfEmployees || undefined,
        year_established: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
        average_monthly_hiring_volume: formData.averageMonthlyHiring || undefined,
        job_visibility: formData.jobVisibility as 'public' | 'limited',
        linkedin_url: formData.linkedin || undefined,
        twitter_url: formData.twitter || undefined,
        facebook_url: formData.facebook || undefined,
        instagram_url: formData.instagram || undefined,
      }

      // Only handle logo deletion if needed (logo uploads are handled on change)
      if (shouldDeleteLogo && !logoFile) {
        // Mark logo for deletion by sending empty string or null
        updateData.delete_company_logo = true
      }

      // Add KYC document if uploaded
      if (kycFile) {
        updateData.kyc_document = kycFile
      }

      // Add preferred job categories (send names, backend will find or create)
      updateData.preferred_job_categories = preferredCategories.length > 0 ? preferredCategories : undefined

      const response = await employerProfileApi.updateProfile(updateData)

      if (response.success) {
        toast.success('Profile updated successfully!', {
          title: 'Success',
          duration: 3000,
        })

        // Clear file uploads and delete flags after successful update
        setLogoFile(null)
        setKycFile(null)
        setShouldDeleteLogo(false)

        // Refresh profile data without page reload
        await fetchProfile()

        // Dispatch custom event to notify header to refresh
        // Use a small delay to ensure profile is saved before refreshing header
        setTimeout(() => {
          console.log('Dispatching profileUpdated event...')
          window.dispatchEvent(new Event('profileUpdated'))
        }, 500)
      } else {
        const errorMessage = response.message || 'Failed to update profile'
        toast.error(errorMessage, {
          title: 'Error',
          duration: 5000,
        })
        if (response.errors) {
          console.error('Validation errors:', response.errors)
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred while updating the profile', {
        title: 'Error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reload to reset form
    window.location.reload()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Company Profile</h1>
            <p className="text-neutral-500 mt-1">Manage your organization&apos;s presence and settings</p>
          </div>
          <div className="flex gap-3">
             <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
             <Button 
                type="submit" 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="bg-[#0576B8] hover:bg-[#04659e]"
             >
                {isSubmitting ? (
                    <>Saving...</>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </>
                )}
             </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200">
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                        activeTab === 'overview' 
                            ? 'border-[#0576B8] text-[#0576B8]' 
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Building className="w-4 h-4" />
                    Company Overview
                </button>
                <button
                    onClick={() => setActiveTab('business')}
                    className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                        activeTab === 'business' 
                            ? 'border-[#0576B8] text-[#0576B8]' 
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Business Details
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    className={`pb-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                        activeTab === 'social' 
                            ? 'border-[#0576B8] text-[#0576B8]' 
                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Globe className="w-4 h-4" />
                    Social & Web
                </button>
            </div>
        </div>

        {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0576B8]"></div>
            </div>
        ) : (
            <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pt-6">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid gap-6">
                    {/* Logo Card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">Company Logo</h2>
                                <p className="text-sm text-neutral-500">This logo will appear on your job postings and company profile.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative group">
                                <div className={`w-32 h-32 rounded-full border-4 border-neutral-50 bg-neutral-100 overflow-hidden shadow-sm flex items-center justify-center relative ${isUploadingLogo ? 'opacity-50' : ''}`}>
                                    {isUploadingLogo ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100/80 z-10">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0576B8]"></div>
                                        </div>
                                    ) : null}
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Company Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building className="w-12 h-12 text-neutral-300" />
                                    )}
                                </div>
                                {logoPreview && !isUploadingLogo && (
                                    <button
                                        type="button"
                                        onClick={handleLogoDelete}
                                        className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-neutral-200 shadow-md text-red-500 hover:bg-red-50 transition-colors z-20"
                                        title="Remove Logo"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <div className={`flex-1 w-full border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${isUploadingLogo ? 'opacity-50 cursor-not-allowed' : 'hover:border-neutral-300 hover:bg-neutral-50/50 cursor-pointer'}`} onClick={() => !isUploadingLogo && logoInputRef.current?.click()}>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    disabled={isUploadingLogo}
                                />
                                <div className="w-10 h-10 rounded-full bg-[#0576B8]/10 text-[#0576B8] flex items-center justify-center mb-3">
                                    {isUploadingLogo ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0576B8]"></div>
                                    ) : (
                                        <Upload className="w-5 h-5" />
                                    )}
                                </div>
                                <p className="text-sm font-medium text-neutral-900">
                                    {isUploadingLogo ? 'Uploading...' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-neutral-400" />
                            Basic Information
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Company Name <span className="text-red-500">*</span></label>
                                <Input 
                                    value={formData.companyName} 
                                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Contact Person <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        value={formData.contactPersonName} 
                                        onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                                        className="pl-9"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Business Email <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        type="email"
                                        value={formData.businessEmail} 
                                        onChange={(e) => handleInputChange("businessEmail", e.target.value)}
                                        className="pl-9 bg-neutral-50"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        type="tel"
                                        value={formData.contactNumber} 
                                        onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                                        className="pl-9"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Company Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        value={formData.companyAddress} 
                                        onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                                        className="pl-9"
                                        placeholder="Full business address"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-neutral-700">About Company <span className="text-red-500">*</span></label>
                                <textarea
                                    value={formData.aboutCompany}
                                    onChange={(e) => handleInputChange("aboutCompany", e.target.value)}
                                    rows={5}
                                    className="flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0576B8] focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                    placeholder="Tell us about your company, mission, and culture..."
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Business Details Tab */}
              {activeTab === 'business' && (
                <div className="grid gap-6">
                    {/* Compliance Card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-neutral-400" />
                            Use Compliance & Verification
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Registration Number <span className="text-red-500">*</span></label>
                                <Input 
                                    value={formData.registrationNumber} 
                                    onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                                    placeholder="Company Reg. No."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">VAT / Tax ID <span className="text-red-500">*</span></label>
                                <Input 
                                    value={formData.vatTaxId} 
                                    onChange={(e) => handleInputChange("vatTaxId", e.target.value)}
                                    placeholder="Tax ID"
                                    required
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Hiring Preferences (Categories)</label>
                                <div 
                                    className="flex flex-wrap gap-2 min-h-[48px] p-3 border border-neutral-300 rounded-lg cursor-pointer hover:border-[#0576B8] transition-colors bg-white items-center focus-within:ring-2 focus-within:ring-[#0576B8] focus-within:border-transparent"
                                    onClick={handleAddCategory}
                                >
                                    {preferredCategories.length === 0 && (
                                        <span className="text-neutral-400 text-sm">Select job categories you hire for...</span>
                                    )}
                                    {preferredCategories.map((category) => (
                                        <span
                                            key={category}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0576B8]/10 text-[#0576B8] rounded-full text-sm font-medium"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleRemoveCategory(category)
                                                }}
                                                className="hover:text-[#0576B8]/80"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <label className="text-sm font-medium text-neutral-700">KYC Document <span className="text-red-500">*</span></label>
                                <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-900">
                                                {kycFileName || (kycFile ? kycFile.name : "No document uploaded")}
                                            </p>
                                            {kycFileUrl && !kycFile ? (
                                                <a href={kycFileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0576B8] hover:underline flex items-center gap-1 mt-0.5">
                                                    View Current Document <LinkIcon className="w-3 h-3" />
                                                </a>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            ref={kycInputRef}
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={handleKycUpload}
                                            className="hidden"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => kycInputRef.current?.click()}
                                        >
                                            {kycFileName ? "Replace" : "Upload"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-neutral-400" />
                            Organization Stats
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Company Size (Employees) <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.numberOfEmployees}
                                    onChange={(e) => handleInputChange("numberOfEmployees", e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0576B8] focus-visible:border-transparent"
                                    required
                                >
                                    <option value="" disabled>Select Size</option>
                                    <option value="1-10">1-10</option>
                                    <option value="11-50">11-50</option>
                                    <option value="51-200">51-200</option>
                                    <option value="201-500">201-500</option>
                                    <option value="501-1000">501-1000</option>
                                    <option value="1000+">1000+</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Year Established <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.yearEstablished}
                                    onChange={(e) => handleInputChange("yearEstablished", e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0576B8] focus-visible:border-transparent"
                                    required
                                >
                                    <option value="" disabled>Select Year</option>
                                    {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                        <option key={year} value={year.toString()}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Average Monthly Hiring</label>
                                <select
                                    value={formData.averageMonthlyHiring}
                                    onChange={(e) => handleInputChange("averageMonthlyHiring", e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0576B8] focus-visible:border-transparent"
                                >
                                    <option value="">Select Volume</option>
                                    <option value="1-5">1-5</option>
                                    <option value="6-10">6-10</option>
                                    <option value="11-20">11-20</option>
                                    <option value="21-50">21-50</option>
                                    <option value="50+">50+</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
              )}

              {/* Social Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-neutral-400" />
                            Online Presence
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral-700">Company Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        value={formData.companyWebsite} 
                                        onChange={(e) => handleInputChange("companyWebsite", e.target.value)}
                                        className="pl-9"
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">LinkedIn Profile</label>
                                    <Input 
                                        value={formData.linkedin} 
                                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                                        placeholder="LinkedIn URL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Twitter Profile</label>
                                    <Input 
                                        value={formData.twitter} 
                                        onChange={(e) => handleInputChange("twitter", e.target.value)}
                                        placeholder="Twitter URL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Facebook Page</label>
                                    <Input 
                                        value={formData.facebook} 
                                        onChange={(e) => handleInputChange("facebook", e.target.value)}
                                        placeholder="Facebook URL"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-neutral-700">Instagram Profile</label>
                                    <Input 
                                        value={formData.instagram} 
                                        onChange={(e) => handleInputChange("instagram", e.target.value)}
                                        placeholder="Instagram URL"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                            <Building className="w-5 h-5 text-neutral-400" />
                            Job Visibility
                        </h2>
                        <div className="flex flex-col gap-4">
                            <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                                <input
                                    type="radio"
                                    name="jobVisibility"
                                    value="public"
                                    checked={formData.jobVisibility === "public"}
                                    onChange={(e) => handleInputChange("jobVisibility", e.target.value)}
                                    className="mt-1 w-4 h-4 text-[#0576B8] focus:ring-[#0576B8]"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-neutral-900">Public Visibility</span>
                                    <span className="block text-sm text-neutral-500">Your jobs will be visible to all candidates on the platform and search engines.</span>
                                </div>
                            </label>
                            <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
                                <input
                                    type="radio"
                                    name="jobVisibility"
                                    value="limited"
                                    checked={formData.jobVisibility === "limited"}
                                    onChange={(e) => handleInputChange("jobVisibility", e.target.value)}
                                    className="mt-1 w-4 h-4 text-[#0576B8] focus:ring-[#0576B8]"
                                />
                                <div>
                                    <span className="block text-sm font-medium text-neutral-900">Limited Visibility</span>
                                    <span className="block text-sm text-neutral-500">Your jobs will only be visible to logged-in candidates.</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
              )}
            </form>
        )}
      </div>

      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Job Category"
        description="Enter the name of the job category you want to add."
        footer={
           <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
              <Button onClick={handleConfirmAddCategory} className="bg-[#0576B8] hover:bg-[#04659e]">Add Category</Button>
           </div>
        }
      >
        <div className="py-4">
          <label className="text-sm font-medium text-neutral-700 mb-2 block">Category Name</label>
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Critical Care, Pediatrics"
            autoFocus
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleConfirmAddCategory();
                }
            }}
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}
