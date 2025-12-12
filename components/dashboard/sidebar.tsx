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

export function Sidebar() {
  const pathname = usePathname()
  const isSettingsActive = pathname?.startsWith("/settings")
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive)

  useEffect(() => {
    setIsSettingsOpen(isSettingsActive)
  }, [isSettingsActive])

  return (
    <aside className="mx-5 w-64 bg-white h-[calc(100vh-93px)] border border-neutral-200 rounded-xl sticky top-[93px] overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
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
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-sky-600 rounded-full" />
                  )}
                </Link>
              </li>
            )
          })}
          
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
  )
}

