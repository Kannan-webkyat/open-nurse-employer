"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import { employerProfileApi, accountSecurityApi } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

interface ActiveSession {
  id: number
  name: string
  is_current: boolean
  last_used_at: string | null
  created_at: string
}

export default function AccountSecurityPage() {
  const toast = useToast() as {
    success: (message: string, options?: { title?: string; duration?: number }) => void
    error: (message: string, options?: { title?: string; duration?: number }) => void
    info: (message: string, options?: { title?: string; duration?: number }) => void
    warning: (message: string, options?: { title?: string; duration?: number }) => void
  }
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [formData, setFormData] = useState({
    usernameEmail: "",
    contactNumber: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    securityQuestions: "",
    recoveryEmail: "",
  })

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [lastLoginActivity, setLastLoginActivity] = useState<string>("")

  // Fetch account data on component mount
  useEffect(() => {
    const fetchAccountData = async () => {
      setIsLoading(true)
      try {
        // Fetch profile to get email and phone
        const profileResponse = await employerProfileApi.getProfile()
        if (profileResponse.success && 'data' in profileResponse && profileResponse.data) {
          const user = profileResponse.data as any
          setFormData(prev => ({
            ...prev,
            usernameEmail: user.email || "",
            contactNumber: user.phone || "",
            recoveryEmail: user.email || "", // Using email as recovery email for now
          }))
        }

        // Fetch active sessions
        const sessionsResponse = await accountSecurityApi.getActiveSessions()
        if (sessionsResponse.success && 'data' in sessionsResponse && sessionsResponse.data) {
          const sessions = sessionsResponse.data as ActiveSession[]
          setActiveSessions(sessions)
          
          // Find current session and set last login activity
          const currentSession = sessions.find(s => s.is_current)
          if (currentSession && currentSession.last_used_at) {
            setLastLoginActivity(currentSession.last_used_at)
          } else if (currentSession) {
            setLastLoginActivity(currentSession.created_at)
          }
        }
      } catch (error) {
        console.error('Error fetching account data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccountData()
  }, [])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updates: Promise<any>[] = []

      // Update account info if email or phone changed
      if (formData.usernameEmail || formData.contactNumber) {
        const accountInfoUpdate = accountSecurityApi.updateAccountInfo({
          email: formData.usernameEmail || undefined,
          phone: formData.contactNumber || undefined,
        })
        updates.push(accountInfoUpdate)
      }

      // Change password if provided
      if (formData.currentPassword && formData.newPassword && formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error('New password and confirm password do not match', {
            title: 'Validation Error',
            duration: 5000,
          })
          setIsSubmitting(false)
          return
        }

        const passwordUpdate = accountSecurityApi.changePassword({
          current_password: formData.currentPassword,
          password: formData.newPassword,
          password_confirmation: formData.confirmPassword,
        })
        updates.push(passwordUpdate)
      }

      // Execute all updates
      const results = await Promise.all(updates)
      
      // Check for errors
      const hasErrors = results.some(result => !result.success)
      if (hasErrors) {
        const errorMessages = results
          .filter(result => !result.success)
          .map(result => result.message)
          .join(', ')
        toast.error(errorMessages, {
          title: 'Update Failed',
          duration: 5000,
        })
      } else {
        toast.success('Account security settings updated successfully!', {
          title: 'Success',
          duration: 3000,
        })
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
        // Refresh account data without page reload
        const fetchAccountData = async () => {
          try {
            // Fetch profile to get updated email and phone
            const profileResponse = await employerProfileApi.getProfile()
            if (profileResponse.success && 'data' in profileResponse && profileResponse.data) {
              const user = profileResponse.data as any
              setFormData(prev => ({
                ...prev,
                usernameEmail: user.email || "",
                contactNumber: user.phone || "",
                recoveryEmail: user.email || "",
              }))
            }

            // Refresh active sessions
            const sessionsResponse = await accountSecurityApi.getActiveSessions()
            if (sessionsResponse.success && 'data' in sessionsResponse && sessionsResponse.data) {
              const sessions = sessionsResponse.data as ActiveSession[]
              setActiveSessions(sessions)
              
              // Update last login activity
              const currentSession = sessions.find(s => s.is_current)
              if (currentSession && currentSession.last_used_at) {
                setLastLoginActivity(currentSession.last_used_at)
              } else if (currentSession) {
                setLastLoginActivity(currentSession.created_at)
              }
            }
          } catch (error) {
            console.error('Error refreshing account data:', error)
          }
        }
        await fetchAccountData()
      }
    } catch (error) {
      console.error('Error updating account security:', error)
      toast.error('An error occurred while updating account security', {
        title: 'Error',
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogoutOtherDevices = async () => {
    if (!confirm('Are you sure you want to logout from all other devices?')) {
      return
    }

    try {
      const response = await accountSecurityApi.logoutOtherDevices()
      if (response.success) {
        toast.success('Successfully logged out from all other devices', {
          title: 'Success',
          duration: 3000,
        })
        // Refresh sessions list
        const sessionsResponse = await accountSecurityApi.getActiveSessions()
        if (sessionsResponse.success && 'data' in sessionsResponse && sessionsResponse.data) {
          setActiveSessions(sessionsResponse.data as ActiveSession[])
        }
      } else {
        const errorMessage = response.message || 'Failed to logout from other devices'
        toast.error(errorMessage, {
          title: 'Error',
          duration: 5000,
        })
      }
    } catch (error) {
      console.error('Error logging out other devices:', error)
      toast.error('An error occurred while logging out other devices', {
        title: 'Error',
        duration: 5000,
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Account & Security</h1>
          <p className="text-neutral-600">Manage your account security settings</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
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
                  {isLoading ? "Loading..." : lastLoginActivity || "No activity recorded"}
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
              {isLoading ? (
                <p className="text-sm text-neutral-600">Loading sessions...</p>
              ) : activeSessions.length === 0 ? (
                <p className="text-sm text-neutral-600">No active sessions</p>
              ) : (
                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {session.name || 'Unknown Device'}
                          {session.is_current && (
                            <span className="ml-2 text-xs text-sky-600 font-normal">(Current Session)</span>
                          )}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          Last used: {session.last_used_at || session.created_at}
                        </p>
                      </div>
                      {!session.is_current && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={handleLogoutOtherDevices}
                        >
                          Logout
                        </Button>
                      )}
                    </div>
                  ))}
                  {activeSessions.filter(s => !s.is_current).length > 0 && (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={handleLogoutOtherDevices}
                        className="w-full"
                      >
                        Logout from All Other Devices
                      </Button>
                    </div>
                  )}
                </div>
              )}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
