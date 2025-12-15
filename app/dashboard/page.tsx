"use client"

import { DashboardLayout } from "@/components/dashboard/layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Briefcase, 
  Users, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  Activity
} from "lucide-react"

interface StatCard {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  icon: React.ElementType
  color: string
  bgColor: string
}

interface RecentJob {
  id: number
  title: string
  jobId: string
  applications: number
  status: "active" | "paused" | "draft" | "closed"
  postedDate: string
}

interface RecentActivity {
  id: number
  type: "application" | "job" | "message" | "interview"
  title: string
  time: string
  icon: React.ElementType
  color: string
}

const stats: StatCard[] = [
  {
    title: "Active Jobs",
    value: "12",
    change: "+3 from last month",
    changeType: "increase",
    icon: Briefcase,
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    title: "Total Applications",
    value: "248",
    change: "+12% from last month",
    changeType: "increase",
    icon: FileText,
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    title: "New Candidates",
    value: "45",
    change: "+8 from last week",
    changeType: "increase",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    title: "Interview Scheduled",
    value: "8",
    change: "3 this week",
    changeType: "increase",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  }
]

const recentJobs: RecentJob[] = [
  { id: 1, title: "ICU Nurse", jobId: "JOB-8X2KLM", applications: 24, status: "active", postedDate: "Sep 25, 2025" },
  { id: 2, title: "Pediatric Nurse", jobId: "JOB-Q9Z4HT", applications: 18, status: "active", postedDate: "Sep 25, 2025" },
  { id: 3, title: "ER Nurse", jobId: "JOB-K7M3LD", applications: 32, status: "paused", postedDate: "Sep 24, 2025" },
  { id: 4, title: "Surgical Nurse", jobId: "JOB-V4TUP", applications: 15, status: "draft", postedDate: "Sep 23, 2025" },
]

const recentActivities: RecentActivity[] = [
  { id: 1, type: "application", title: "Emma Johnson applied for ICU Nurse", time: "2 hours ago", icon: FileText, color: "text-blue-600" },
  { id: 2, type: "message", title: "New message from Michael", time: "3 hours ago", icon: MessageCircle, color: "text-green-600" },
  { id: 3, type: "interview", title: "Interview scheduled with Ria for Pediatric Nurse", time: "1 day ago", icon: Calendar, color: "text-purple-600" },
  { id: 4, type: "job", title: "New job posting: ER Nurse", time: "1 day ago", icon: Briefcase, color: "text-orange-600" },
  { id: 5, type: "application", title: "Sophia Davis applied for Surgical Nurse", time: "2 days ago", icon: FileText, color: "text-blue-600" },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600 mt-1">Welcome back! Here&apos;s what&apos;s happening with your job postings.</p>
          </div>
          <Link href="/jobs">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-neutral-900 mb-2">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.changeType === "increase" ? (
                        <ArrowUpRight className="w-3 h-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 text-red-600" />
                      )}
                      <span className={stat.changeType === "increase" ? "text-green-600" : "text-red-600"}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Jobs - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Job Postings</h2>
              <Link href="/jobs">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <Link key={job.id} href="/jobs" className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-neutral-900">{job.title}</h3>
                        <Badge variant={job.status}>{job.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-neutral-600">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {job.applications} applications
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {job.postedDate}
                        </span>
                        <span className="text-neutral-400">{job.jobId}</span>
                      </div>
                    </div>
                    <Eye className="w-5 h-5 text-neutral-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity - Takes 1 column */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
              <Activity className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-neutral-100 last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg bg-neutral-50`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900 mb-1">{activity.title}</p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Stats & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Overview */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Applications Overview</h2>
              <BarChart3 className="w-5 h-5 text-neutral-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-neutral-900">New Applications</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">45</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  <span className="text-sm text-neutral-900">Shortlisted</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">28</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm text-neutral-900">Interviewing</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm text-neutral-900">Hired</span>
                </div>
                <span className="text-sm font-semibold text-neutral-900">8</span>
              </div>
            </div>
            <Link href="/candidates">
              <Button variant="outline" className="w-full mt-6">
                View All Candidates
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/jobs">
                <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                  <Briefcase className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-900">Post Job</p>
                  <p className="text-xs text-neutral-600 mt-1">Create new job posting</p>
                </div>
              </Link>
              <Link href="/candidates">
                <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-900">View Candidates</p>
                  <p className="text-xs text-neutral-600 mt-1">Browse applications</p>
                </div>
              </Link>
              <Link href="/messages">
                <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                  <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-900">Messages</p>
                  <p className="text-xs text-neutral-600 mt-1">Check conversations</p>
                </div>
              </Link>
              <Link href="/reports">
                <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
                  <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
                  <p className="text-sm font-medium text-neutral-900">Reports</p>
                  <p className="text-xs text-neutral-600 mt-1">View analytics</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
