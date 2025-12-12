"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"

export default function AccountSecurityPage() {
  const [formData, setFormData] = useState({
    usernameEmail: "St. Mary's NHS Trust",
    contactNumber: "+44 7123 456789",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
    securityQuestions: "",
    recoveryEmail: "hr@yourcompany.com",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    console.log("Saving account security settings:", formData)
  }

  const handleLogoutOtherDevices = () => {
    console.log("Logging out from other devices...")
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Account & Security</h1>
          <p className="text-neutral-600">Manage your account security settings</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8">
          {/* Account Information Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Username / Email
                </label>
                <Input
                  type="text"
                  value={formData.usernameEmail}
                  onChange={(e) => handleInputChange("usernameEmail", e.target.value)}
                  className="w-full"
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
              <div className="col-span-2">
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Last Login Activity
                </label>
                <p className="text-sm text-neutral-600">
                  09 Sept 2025, 14:32 GMT — Chrome on Windows 10
                </p>
              </div>
            </div>
          </div>

          {/* Password & Authentication Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Password & Authentication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Current Password */}
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    className="w-full pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {/* New Password */}
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    className="w-full pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {/* Confirm New Password */}
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="w-full pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
         
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {/* Two-Factor Authentication */}
                   <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Two-Factor Authentication</p>
                  <p className="text-sm text-neutral-600 mt-1">Add an extra layer of security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.twoFactorEnabled}
                    onChange={(e) => handleInputChange("twoFactorEnabled", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>
              {/* Security Questions */}
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Security Questions
                </label>
                <select
                  value={formData.securityQuestions}
                  onChange={(e) => handleInputChange("securityQuestions", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-ring-none focus-visible:ring-0 focus-visible:border-[#0576B8] text-neutral-400"
                >
                  <option value="">Choose security questions</option>
                  <option value="mother-maiden-name">What is your mother's maiden name?</option>
                  <option value="first-pet">What was the name of your first pet?</option>
                  <option value="birth-city">What city were you born in?</option>
                  <option value="school-name">What was the name of your elementary school?</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Recovery Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Account Recovery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-900 mb-2 block">
                  Recovery Email
                </label>
                <Input
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={(e) => handleInputChange("recoveryEmail", e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Account Devices Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Account Devices</h2>
            <div>
              <label className="text-sm font-medium text-neutral-900 mb-3 block">
                Active Sessions
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">London, UK</p>
                    <p className="text-sm text-neutral-600 mt-1">Chrome</p>
                  </div>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleLogoutOtherDevices}
                  >
                    Logout from Other Devices
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button
              type="button"
              variant="outline"
              className="border-neutral-300 text-sky-600 bg-sky-50 hover:bg-sky-100"
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
