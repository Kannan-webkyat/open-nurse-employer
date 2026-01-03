"use client"

import { Suspense, useState } from 'react'
import { DashboardLayout } from "@/components/dashboard/layout"
import { TokenHandler } from "@/components/auth/token-handler"
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
  Activity,
  ChevronDown,
  Filter,
  MoreHorizontal
} from "lucide-react"

interface StatCard {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  icon: React.ElementType
  color: string
  description: string
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
  user: string
  action: string
  time: string
  icon: React.ElementType
  color: string
}

const stats: StatCard[] = [
  {
    title: "Active Jobs",
    value: "12",
    change: "+25%",
    changeType: "increase",
    icon: Briefcase,
    color: "sky",
    description: "Jobs currently live"
  },
  {
    title: "Total Applications",
    value: "248",
    change: "+12%",
    changeType: "increase",
    icon: FileText,
    color: "emerald",
    description: "Applications received"
  },
  {
    title: "New Candidates",
    value: "45",
    change: "+18%",
    changeType: "increase",
    icon: Users,
    color: "violet",
    description: "This week"
  },
  {
    title: "Interview Scheduled",
    value: "8",
    change: "+37%",
    changeType: "increase",
    icon: Calendar,
    color: "amber",
    description: "Upcoming interviews"
  }
]

const recentJobs: RecentJob[] = [
  { id: 1, title: "ICU Nurse", jobId: "JOB-8X2KLM", applications: 24, status: "active", postedDate: "Sep 25, 2025" },
  { id: 2, title: "Pediatric Nurse", jobId: "JOB-Q9Z4HT", applications: 18, status: "active", postedDate: "Sep 25, 2025" },
  { id: 3, title: "ER Nurse", jobId: "JOB-K7M3LD", applications: 32, status: "paused", postedDate: "Sep 24, 2025" },
  { id: 4, title: "Surgical Nurse", jobId: "JOB-V4TUP", applications: 15, status: "draft", postedDate: "Sep 23, 2025" },
]

const recentActivities: RecentActivity[] = [
  { id: 1, type: "application", title: "Emma Johnson applied for ICU Nurse", user: "Emma J.", action: "applied for ICU Nurse", time: "2m ago", icon: FileText, color: "text-blue-600" },
  { id: 2, type: "message", title: "New message from Michael", user: "Michael", action: "sent a message", time: "12m ago", icon: MessageCircle, color: "text-green-600" },
  { id: 3, type: "interview", title: "Interview scheduled with Ria for Pediatric Nurse", user: "Ria K.", action: "interview scheduled", time: "1h ago", icon: Calendar, color: "text-purple-600" },
]

const applicationStats = [
  { name: 'New Applications', status: 'Processing', fill: 45, color: 'sky', value: 45 },
  { name: 'Shortlisted', status: 'In Review', fill: 62, color: 'amber', value: 28 },
  { name: 'Interviewing', status: 'Active', fill: 27, color: 'violet', value: 12 },
  { name: 'Hired', status: 'Complete', fill: 18, color: 'emerald', value: 8 },
]

export default function DashboardPage() {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState('Last 7 Days')

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <TokenHandler />
      </Suspense>
      <div className="space-y-5">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Employer Dashboard</h1>
            <p className="text-sm text-neutral-500 font-medium">Welcome back! Here&apos;s what&apos;s happening with your job postings.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 border border-neutral-100 shadow-sm rounded-full text-sm font-semibold text-neutral-600 transition-all active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                {selectedRange}
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDateMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl border border-neutral-100 shadow-xl py-1.5 z-[20]">
                  {['Today', 'Last 7 Days', 'Last 30 Days', 'Last Year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedRange(range)
                        setIsDateMenuOpen(false)
                      }}
                      className={`w-full text-left px-4 py-1.5 text-sm font-medium transition-colors ${selectedRange === range ? 'text-sky-600 bg-sky-50' : 'text-neutral-600 hover:bg-neutral-50'
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link href="/jobs">
              <Button className="rounded-full px-4 h-9 shadow-sm text-sm">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Post Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="group bg-white p-4 rounded-2xl border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-${stat.color}-50 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${stat.changeType === "increase" ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.changeType === "increase" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {stat.change}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-2xl font-black text-neutral-900">{stat.value}</h3>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{stat.title}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column - Charts & Jobs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Applications Traffic Chart */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5 overflow-hidden relative">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">Applications Traffic</h2>
                  <p className="text-xs text-neutral-400 font-medium">Daily application volume</p>
                </div>
                <div className="flex gap-1.5">
                  <button className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-all">
                    <Filter className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                  <button className="p-2 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-all">
                    <MoreHorizontal className="w-3.5 h-3.5 text-neutral-500" />
                  </button>
                </div>
              </div>

              {/* Custom SVG Line Chart */}
              <div className="h-44 w-full relative group">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 150 Q 100 80 200 120 T 400 60 T 600 100 T 800 40 L 800 200 L 0 200 Z"
                    fill="url(#gradient)"
                  />
                  <path
                    d="M0 150 Q 100 80 200 120 T 400 60 T 600 100 T 800 40"
                    fill="none"
                    stroke="#0EA5E9"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line x1="0" y1="50" x2="800" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="100" x2="800" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="1" />
                </svg>
                <div className="absolute top-[30%] left-[50%] w-3 h-3 bg-sky-500 border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
                <div className="absolute top-[10%] right-[0%] w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-md group-hover:scale-125 transition-transform" />
              </div>

              <div className="flex justify-between mt-4 px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{day}</span>
                ))}
              </div>
            </div>

            {/* Recent Jobs Table */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">Recent Job Postings</h2>
                <Link href="/jobs">
                  <button className="text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors uppercase tracking-wider">View All</button>
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentJobs.map((job) => (
                  <Link key={job.id} href="/jobs" className="block">
                    <div className="flex items-center justify-between p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl transition-all border border-transparent hover:border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-neutral-100 font-bold text-neutral-300 text-sm">
                          {job.title[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900 text-sm">{job.title}</h4>
                          <p className="text-[10px] text-neutral-400 font-medium">{job.jobId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-center">
                          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Applicants</p>
                          <p className="text-sm font-black text-neutral-900">{job.applications}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${job.status === 'active' ? 'bg-emerald-100 text-emerald-600' :
                          job.status === 'paused' ? 'bg-amber-100 text-amber-600' :
                            job.status === 'draft' ? 'bg-neutral-100 text-neutral-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Blocks */}
          <div className="space-y-5">
            {/* Activity Pulse - Dark Card */}
            <div className="bg-neutral-900 rounded-3xl p-5 shadow-xl shadow-neutral-900/30 text-white">
              <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                Activity Pulse <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 group">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-400 group-hover:text-emerald-400 transition-colors">
                      {activity.user[0]}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-tight">
                        <span className="font-bold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-[9px] font-bold text-neutral-500 uppercase mt-0.5 tracking-wider">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/candidates">
                <button className="w-full mt-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/10 uppercase tracking-wider">
                  View All Activity
                </button>
              </Link>
            </div>

            {/* Application Status Card */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-neutral-900 mb-4 tracking-tight">Application Pipeline</h2>
              <div className="space-y-3">
                {applicationStats.map((stat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-neutral-500">{stat.name}</span>
                      <span className={`text-${stat.color}-500`}>{stat.value}</span>
                    </div>
                    <div className="h-1 w-full bg-neutral-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${stat.color}-500 transition-all duration-1000 ease-out`}
                        style={{ width: `${stat.fill}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/candidates">
                <button className="w-full mt-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all uppercase tracking-wider">
                  View Candidates
                </button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-neutral-900 mb-4 tracking-tight">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/jobs">
                  <div className="p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl transition-all border border-transparent hover:border-neutral-100 cursor-pointer group">
                    <div className="w-8 h-8 bg-sky-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-4 h-4 text-sky-500" />
                    </div>
                    <p className="text-xs font-bold text-neutral-900">Post Job</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Create posting</p>
                  </div>
                </Link>
                <Link href="/candidates">
                  <div className="p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl transition-all border border-transparent hover:border-neutral-100 cursor-pointer group">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold text-neutral-900">Candidates</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Browse all</p>
                  </div>
                </Link>
                <Link href="/messages">
                  <div className="p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl transition-all border border-transparent hover:border-neutral-100 cursor-pointer group">
                    <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-4 h-4 text-violet-500" />
                    </div>
                    <p className="text-xs font-bold text-neutral-900">Messages</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Conversations</p>
                  </div>
                </Link>
                <Link href="/reports">
                  <div className="p-3 bg-neutral-50/50 hover:bg-neutral-50 rounded-xl transition-all border border-transparent hover:border-neutral-100 cursor-pointer group">
                    <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-xs font-bold text-neutral-900">Reports</p>
                    <p className="text-[9px] text-neutral-400 font-medium">Analytics</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
