"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState({
    jobApplicationAlerts: true,
    candidateShortlistUpdates: false,
    interviewScheduledNotifications: true,
    billingSubscriptionUpdates: false,
    systemAnnouncementsUpdates: true,
    realTimeAlerts: true,
    candidateActivityInsights: false,
    frequency: "weekly" as "instant" | "daily" | "weekly",
  })

  const handleToggle = (key: keyof typeof notifications) => {
    if (key === "frequency") return
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleFrequencyChange = (frequency: "instant" | "daily" | "weekly") => {
    setNotifications(prev => ({ ...prev, frequency }))
  }

  const handleSave = () => {
    console.log("Saving notification settings:", notifications)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Notification</h1>
          <p className="text-neutral-600">Manage your notification preferences</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Email Notifications Section */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Email Notifications</h2>
            <div className="space-y-5">
              {/* Job Application Alerts */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Job Application Alerts</p>
                  <p className="text-sm text-neutral-600 mt-1">when a candidate applies</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.jobApplicationAlerts}
                    onChange={() => handleToggle("jobApplicationAlerts")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>

              {/* Candidate Shortlist Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Candidate Shortlist Updates</p>
                  <p className="text-sm text-neutral-600 mt-1">Get notified when candidates are shortlisted</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.candidateShortlistUpdates}
                    onChange={() => handleToggle("candidateShortlistUpdates")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>

              {/* Interview Scheduled Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Interview Scheduled Notifications</p>
                  <p className="text-sm text-neutral-600 mt-1">Receive alerts when interviews are scheduled</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.interviewScheduledNotifications}
                    onChange={() => handleToggle("interviewScheduledNotifications")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>

              {/* Billing & Subscription Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">Billing & Subscription Updates</p>
                  <p className="text-sm text-neutral-600 mt-1">Stay informed about billing and subscription changes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.billingSubscriptionUpdates}
                    onChange={() => handleToggle("billingSubscriptionUpdates")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>

              {/* System Announcements & Updates */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">System Announcements & Updates</p>
                  <p className="text-sm text-neutral-600 mt-1">Important system updates and announcements</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.systemAnnouncementsUpdates}
                    onChange={() => handleToggle("systemAnnouncementsUpdates")}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* In-App Notifications and Preferences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* In-App Notifications Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">In-App Notifications</h2>
              <div className="space-y-5">
                {/* Real-time Alerts */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Real-time Alerts</p>
                    <p className="text-sm text-neutral-600 mt-1">Receive instant notifications for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.realTimeAlerts}
                      onChange={() => handleToggle("realTimeAlerts")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                  </label>
                </div>

                {/* Candidate Activity Insights */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Candidate Activity Insights</p>
                    <p className="text-sm text-neutral-600 mt-1">Get insights into candidate activities and engagement</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.candidateActivityInsights}
                      onChange={() => handleToggle("candidateActivityInsights")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00EB23]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Preferences Card */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-6">Preferences</h2>
              <div className="space-y-4">
                <p className="text-sm font-medium text-neutral-900">Frequency of Notifications:</p>
                <div className="space-y-4">
                  {/* Instant */}
                  <label className="flex items-start cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 transition-all ${
                      notifications.frequency === "instant" 
                        ? "border-[#00EB23] bg-[#00EB23]" 
                        : "border-neutral-300 bg-white group-hover:border-[#00EB23]/50"
                    }`}>
                      {notifications.frequency === "instant" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="radio"
                        name="frequency"
                        value="instant"
                        checked={notifications.frequency === "instant"}
                        onChange={() => handleFrequencyChange("instant")}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-neutral-900 block">Instant</span>
                      <span className="text-sm text-neutral-600 mt-1 block">Receive notifications immediately as they occur</span>
                    </div>
                  </label>

                  {/* Daily Digest */}
                  <label className="flex items-start cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 transition-all ${
                      notifications.frequency === "daily" 
                        ? "border-[#00EB23] bg-[#00EB23]" 
                        : "border-neutral-300 bg-white group-hover:border-[#00EB23]/50"
                    }`}>
                      {notifications.frequency === "daily" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="radio"
                        name="frequency"
                        value="daily"
                        checked={notifications.frequency === "daily"}
                        onChange={() => handleFrequencyChange("daily")}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-neutral-900 block">Daily Digest</span>
                      <span className="text-sm text-neutral-600 mt-1 block">Get a summary of all notifications once per day</span>
                    </div>
                  </label>

                  {/* Weekly Summary */}
                  <label className="flex items-start cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 mt-0.5 transition-all ${
                      notifications.frequency === "weekly" 
                        ? "border-[#00EB23] bg-[#00EB23]" 
                        : "border-neutral-300 bg-white group-hover:border-[#00EB23]/50"
                    }`}>
                      {notifications.frequency === "weekly" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="radio"
                        name="frequency"
                        value="weekly"
                        checked={notifications.frequency === "weekly"}
                        onChange={() => handleFrequencyChange("weekly")}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-neutral-900 block">Weekly Summary</span>
                      <span className="text-sm text-neutral-600 mt-1 block">Receive a weekly summary of all notifications</span>
                    </div>
                  </label>
                </div>
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
