"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMessages } from "@/components/providers/message-provider"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/candidates", label: "Candidates", icon: Users },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/billing", label: "Billing & Subscriptions", icon: FileText },
  { href: "/reports", label: "Reports & Insights", icon: BarChart3 },
  { href: "/support", label: "Support / Help Center", icon: HelpCircle },
]

const settingsSubItems = [
  { href: "/settings/profile", label: "Company Profile" },
  { href: "/settings/account-security", label: "Account and Security" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/privacy-compliance", label: "Privacy and Compliance" },
  { href: "/settings/delete-account", label: "Delete Account", isDestructive: true },
]

const reportsSubItems = [
  { href: "/reports/monthly-job-reports", label: "Monthly Job Reports" },
  { href: "/reports/candidates-applications", label: "Candidates Applications" },
  { href: "/reports/billing-summary", label: "Billing Summary" },
]

export function Sidebar() {
  const pathname = usePathname()
  const isSettingsActive = pathname?.startsWith("/settings")
  const isReportsActive = pathname?.startsWith("/reports")
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive)
  const { unreadCount } = useMessages()
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsActive)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsSettingsOpen(isSettingsActive)
  }, [isSettingsActive])

  useEffect(() => {
    setIsReportsOpen(isReportsActive)
  }, [isReportsActive])

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev)
    window.addEventListener('toggle-mobile-menu', handleToggle)
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle)
  }, [])

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-neutral-900/50 z-[60]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={cn(
        "bg-white md:border border-neutral-200 md:rounded-xl overflow-y-auto transition-transform duration-300 z-[70] md:z-40",
        "fixed md:sticky top-0 md:top-[93px] bottom-0 md:bottom-auto md:h-[calc(100vh-93px)] w-[280px] md:w-64 shadow-2xl md:shadow-none border-r md:border-r-0 border-neutral-200",
        "left-0 md:mx-5 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Sidebar Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-100 mb-2">
          <img src="/logo.svg" alt="logo" className="w-28" />
        </div>
        <nav className="p-4 md:pt-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              // Skip Reports as it will be handled separately with submenu
              if (item.href === "/reports") return null

              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href))
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                      isActive
                        ? "bg-sky-50 text-sky-600"
                        : "text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.label === "Messages" && unreadCount > 0 && (
                      <span className="bg-sky-600 text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[18px] text-center rounded-full mr-1">
                        {unreadCount}
                      </span>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-sky-600 rounded-full" />
                    )}
                  </Link>
                </li>
              )
            })}

            {/* Reports with Sub-menu */}
            <li>
              <button
                onClick={() => setIsReportsOpen(!isReportsOpen)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                  isReportsActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="flex-1 text-left">Reports & Insights</span>
                {isReportsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {isReportsOpen && (
                <ul className="mt-2 ml-4 space-y-1">
                  {reportsSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm",
                            isSubActive
                              ? "bg-sky-50 text-sky-600 font-medium"
                              : "text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          <span>{subItem.label}</span>
                          {isSubActive && (
                            <div className="w-2 h-2 bg-sky-600 rounded-full" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>

            {/* Settings with Sub-menu */}
            <li>
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                  isSettingsActive
                    ? "bg-sky-50 text-sky-600"
                    : "text-neutral-700 hover:bg-neutral-50"
                )}
              >
                <Settings className="w-5 h-5" />
                <span className="flex-1 text-left">Settings</span>
                {isSettingsOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {isSettingsOpen && (
                <ul className="mt-2 ml-4 space-y-1">
                  {settingsSubItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          className={cn(
                            "flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm",
                            isSubActive
                              ? "bg-sky-50 text-sky-600 font-medium"
                              : subItem.isDestructive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-neutral-700 hover:bg-neutral-50"
                          )}
                        >
                          <span>{subItem.label}</span>
                          {isSubActive && (
                            <div className="w-2 h-2 bg-sky-600 rounded-full" />
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

