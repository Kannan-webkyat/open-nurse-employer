"use client"

import { Suspense, useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/dashboard/layout"
import { TokenHandler } from "@/components/auth/token-handler"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    MoreHorizontal,
    Loader2,
    Search,
    Settings,
    CreditCard
} from "lucide-react"
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { dashboardApi } from '@/lib/api'

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut" as any
        }
    }
}

const cardHover: any = {
    y: -5,
    transition: {
        duration: 0.3,
        ease: "easeOut"
    }
}


// Interfaces (kept as is)
interface StatCard {
    title: string
    value: string | number
    change: string
    changeType: "increase" | "decrease"
    icon: React.ElementType
    color: string
    description: string
}

// ... other interfaces kept or updated if needed


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



const DashboardPage = () => {
    const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRange, setSelectedRange] = useState('Last 30 Days')
    const [isChartFilterOpen, setIsChartFilterOpen] = useState(false)
    const [selectedJobId, setSelectedJobId] = useState<string | 'all'>('all')
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>({
        stats: {
            active_jobs: 0,
            closed_jobs: 0,
            total_jobs: 0,
            total_applications: 0,
            new_candidates: 0,
            rejected_candidates: 0,
            interviews_scheduled: 0,
            hired_candidates: 0 // Added hired_candidates to state
        },
        recent_jobs: [],
        application_pipeline: [],
        recent_activities: [],
        traffic: [],
        alerts: [],
        billing: {
            plan_name: 'Free Tier', // Default fallback
            status: 'inactive',
            amount: '0.00',
            currency: 'USD',
            next_billing: 'N/A'
        }
    })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Map frontend range label to backend value
                let rangeParam = '7_days'
                if (selectedRange === 'Today') rangeParam = 'today'
                if (selectedRange === 'Last 30 Days') rangeParam = '30_days'
                if (selectedRange === 'Last Year') rangeParam = '1_year'

                const response: any = await dashboardApi.getDashboardStats(rangeParam)
                if (response.success) {
                    setData(response.data)
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedRange])

    const statsCards = [
        {
            title: "Total Jobs",
            value: data.stats.total_jobs || 0,
            subValue: `${data.stats.active_jobs} Active`,
            icon: Briefcase,
            color: "sky",
            description: "All time postings"
        },
        {
            title: "Total Applications",
            value: data.stats.total_applications || 0,
            subValue: `${data.stats.new_candidates} New`,
            icon: Users,
            color: "emerald",
            description: "Candidates applied"
        },
        {
            title: "Interviews",
            value: data.stats.interviews_scheduled || 0,
            subValue: "Scheduled",
            icon: Calendar,
            color: "sky",
            description: "Upcoming sessions"
        },
        {
            title: "Hired Candidates",
            value: data.stats.hired_candidates || 0,
            subValue: "Filled positions",
            icon: CheckCircle,
            color: "amber",
            description: "Successfully hired"
        }
    ]

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                </div>
            </DashboardLayout>
        )
    }



    // Helper to generate smooth SVG path from data points
    const getSmoothPath = (points: { value: number }[], width: number, height: number) => {
        if (points.length < 2) return { path: "", normalizedPoints: [] }

        const max = Math.max(...points.map(p => p.value), 1)

        // Kleon style: Smooth curves
        const normalizedPoints = points.map((p, i) => {
            const x = (i / (points.length - 1)) * width
            const y = height - (p.value / max) * height * 0.8 // Scale down slightly to leave top room
            return [x, y]
        })

        const first = normalizedPoints[0]
        let path = `M ${first[0]},${first[1]}`

        for (let i = 0; i < normalizedPoints.length - 1; i++) {
            const current = normalizedPoints[i]
            const next = normalizedPoints[i + 1]
            const cp1x = current[0] + (next[0] - current[0]) * 0.5
            const cp1y = current[1]
            const cp2x = current[0] + (next[0] - current[0]) * 0.5
            const cp2y = next[1]
            path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next[0]},${next[1]}`
        }

        return { path, normalizedPoints }
    }

    // Compact Kleon Chart Config
    const chartHeight = 160 // Reduced height
    const chartWidth = 800
    const { path: linePath, normalizedPoints } = getSmoothPath(data.traffic, chartWidth, chartHeight)
    const areaPath = linePath ? `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z` : ""


    return (
        <DashboardLayout>
            <Suspense fallback={null}>
                <TokenHandler />
            </Suspense>

            {/* Premium Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-200 blur-[100px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] rounded-full bg-sky-200 blur-[100px]" 
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[-10%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-100 blur-[100px]" 
                />
            </div>

            {/* Compact Kleon Layout */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6 animate-in fade-in duration-500 max-w-[1800px] mx-auto p-4 md:p-6 text-neutral-800 relative z-10"
            >
                {/* Hero Welcome Section */}
                <motion.div 
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 p-4 md:p-5 shadow-xl text-white mb-6 group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <Activity className="w-32 h-32" />
                        </motion.div>
                    </div>
                    <div className="relative z-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-[10px] font-semibold mb-2 text-sky-100"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Portal Active
                        </motion.div>
                        <motion.h1 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="text-xl md:text-2xl font-black mb-0.5 tracking-tight"
                        >
                            Welcome back, {data.company_name || 'Employer'}
                        </motion.h1>
                        <motion.p 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.7 }}
                            className="text-sky-100 max-w-lg text-[10px] md:text-xs leading-relaxed"
                        >
                            Here's your hiring overview. You have <span className="font-bold text-white underline decoration-white/30 underline-offset-4">{data.stats?.new_candidates || 0} new candidates</span> to review {
                                selectedRange === 'Today' ? 'today' : 
                                selectedRange === 'Last 30 Days' ? 'this month' : 
                                selectedRange === 'Last Year' ? 'this year' : 
                                'this week'
                            }.
                        </motion.p>
                    </div>
                </motion.div>
                {/* Header - Compact */}
                <div className="flex items-center justify-between gap-4">
                    <motion.div variants={itemVariants}>
                        <h2 className="text-xl font-bold text-neutral-900">Analytics Overview</h2>
                        <p className="text-neutral-500 text-sm mt-0.5">Key performance metrics for the last 30 days.</p>
                    </motion.div>

                    <div className="flex items-center gap-3">

                        {/* Search Bar - Compact */}
                        <motion.div variants={itemVariants} className="hidden md:block relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4 z-10" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 w-56 h-10 rounded-lg bg-white shadow-sm border-neutral-100 placeholder:text-neutral-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </motion.div>

                        <div className="relative z-20">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
                                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-100 shadow-sm rounded-xl text-xs font-bold transition-all h-10"
                            >
                                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                                {selectedRange}
                            </motion.button>

                            <AnimatePresence>
                                {isDateMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-neutral-100 p-1 z-50"
                                    >
                                        {['Today', 'Last 7 Days', 'Last 30 Days', 'Last Year'].map((range) => (
                                            <button
                                                key={range}
                                                onClick={() => {
                                                    setSelectedRange(range)
                                                    setIsDateMenuOpen(false)
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedRange === range
                                                    ? 'bg-sky-50 text-sky-600'
                                                    : 'text-neutral-600 hover:bg-neutral-50'
                                                    }`}
                                            >
                                                {range}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link href="/jobs">
                            <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="h-10 px-4 bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20 border-0 font-bold text-xs rounded-full">
                                    <Plus className="w-4 h-4 mr-1.5" /> Post Job
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards - Compact Kleon with Gradients */}

                {/* Stats Cards - Modern Clean Look with Interactive Hover */}
                {/* Stats Cards - Compact Kleon with Gradients */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
                    {statsCards.map((stat, index) => {
                        const colorVariants: any = {
                            sky: {
                                bgHover: 'group-hover:shadow-sky-200',
                                textHover: 'group-hover:text-sky-600',
                                iconWrapper: 'bg-sky-50 text-sky-600 group-hover:bg-sky-500 group-hover:text-white',
                                subBadge: 'bg-sky-50 text-sky-700',
                                gradient: 'from-sky-50'
                            },
                            emerald: {
                                bgHover: 'group-hover:shadow-emerald-200',
                                textHover: 'group-hover:text-emerald-600',
                                iconWrapper: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white',
                                subBadge: 'bg-emerald-50 text-emerald-700',
                                gradient: 'from-emerald-50'
                            },
                            amber: {
                                bgHover: 'group-hover:shadow-orange-200',
                                textHover: 'group-hover:text-orange-600',
                                iconWrapper: 'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white',
                                subBadge: 'bg-orange-50 text-orange-700',
                                gradient: 'from-orange-50'
                            }
                        };

                        const variant = colorVariants[stat.color] || colorVariants.sky;

                        return (
                            <motion.div 
                                key={index} 
                                variants={itemVariants}
                                whileHover={cardHover}
                                className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default relative overflow-hidden"
                            >                                {/* Gradient Background on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <p className={`text-neutral-500 font-bold text-[10px] uppercase tracking-wider mb-1 ${variant.textHover} transition-colors`}>{stat.title}</p>
                                        <h3 className="text-2xl font-black text-neutral-900 tracking-tight group-hover:scale-105 transition-transform origin-left">{stat.value}</h3>
                                    </div>
                                    <div className={`p-2.5 rounded-2xl transition-all duration-300 shadow-sm group-hover:rotate-6 ${variant.iconWrapper} ${variant.bgHover}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 relative z-10">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg group-hover:bg-white/80 transition-colors ${variant.subBadge}`}>
                                        {stat.subValue}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-medium">{stat.description}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Left Column (8/12) - Charts Area */}
                    <div className="lg:col-span-8 space-y-5">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Job Status Distribution - Warmer Dark Theme */}
                                <motion.div 
                                    variants={itemVariants}
                                    whileHover={cardHover}
                                    className="bg-neutral-900 rounded-3xl p-6 shadow-xl shadow-black/20 border border-white/10 relative overflow-hidden group backdrop-blur-3xl"
                                >
                                    {/* Warmer Base Glow */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,191,36,0.05),transparent)]" />
                                    
                                    {/* High-Tech Background Pattern - Status Unique */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover/status:opacity-[0.06] transition-opacity duration-700">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <defs>
                                                <pattern id="grid-status-final" width="20" height="20" patternUnits="userSpaceOnUse">
                                                    <circle cx="1" cy="1" r="0.5" fill="white" />
                                                </pattern>
                                            </defs>
                                            <rect width="100" height="100" fill="url(#grid-status-final)" />
                                        </svg>
                                    </div>

                                    {/* Topographic Lines Layer */}
                                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none group-hover/status:opacity-[0.08] transition-opacity duration-1000">
                                        <svg className="w-full h-full" viewBox="0 0 100 100">
                                            <path d="M-10,40 Q20,20 40,40 T90,40 T140,40" fill="none" stroke="white" strokeWidth="0.3" className="animate-pulse" />
                                            <path d="M-10,60 Q25,50 45,70 T85,50 T125,70" fill="none" stroke="white" strokeWidth="0.3" style={{ animationDelay: '1.5s' }} className="animate-pulse" />
                                        </svg>
                                    </div>

                                    {/* Decorative Glows */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover/status:bg-emerald-500/20 transition-all duration-700" />
                                    <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] group-hover/status:bg-amber-500/10 transition-all duration-700" />
                                    
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-tight">Job Status</h3>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">Hiring funnel distribution</p>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded-xl text-white backdrop-blur-md group-hover/status:bg-white/20 transition-all duration-300 group-hover/status:scale-110">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                                        {/* Donut Chart */}
                                        <div className="relative w-32 h-32 flex-shrink-0">
                                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                                {(() => {
                                                    const stats = {
                                                        active: data.stats.active_jobs || 0,
                                                        closed: data.stats.closed_jobs || 0,
                                                        total: data.stats.total_jobs || 1
                                                    };
                                                    const total = stats.total;
                                                    let currentOffset = 0;
                                                    
                                                    const segments = [
                                                        { key: 'active', value: stats.active, color: '#10B981' }, 
                                                        { key: 'closed', value: stats.closed, color: '#94A3B8' },   
                                                    ];

                                                    return segments.map((seg, i) => {
                                                        if (seg.value === 0) return null;
                                                        const circumference = 2 * Math.PI * 40; 
                                                        const dashArray = (seg.value / total) * circumference;
                                                        const offset = currentOffset;
                                                        currentOffset -= dashArray;
                                                        
                                                        return (
                                                            <motion.circle
                                                                key={i}
                                                                cx="50"
                                                                cy="50"
                                                                r="40"
                                                                fill="transparent"
                                                                stroke={seg.color}
                                                                strokeWidth="12"
                                                                strokeDasharray={`${dashArray} ${circumference}`}
                                                                strokeDashoffset={offset}
                                                                strokeLinecap="round"
                                                                initial={{ pathLength: 0, opacity: 0 }}
                                                                whileInView={{ pathLength: 1, opacity: 1 }}
                                                                viewport={{ once: true }}
                                                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 + i * 0.1 }}
                                                                className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
                                                            />
                                                        );
                                                    });
                                                })()}
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                                <span className="text-2xl font-black text-white">{data.stats.total_jobs || 0}</span>
                                                <span className="text-[10px] uppercase font-bold text-neutral-500">Jobs</span>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full space-y-3">
                                            {[
                                                { label: 'Active Positions', value: data.stats.active_jobs, color: 'bg-emerald-500' },
                                                { label: 'Closed/Drafts', value: data.stats.total_jobs - data.stats.active_jobs, color: 'bg-slate-400' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                                                        <span className="text-xs font-bold text-neutral-300">{item.label}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-white">{item.value || 0}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 border-t border-white/10 mt-2">
                                                <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl">
                                                    <span className="text-[10px] font-bold text-indigo-300">Conversion</span>
                                                    <span className="text-xs font-black text-white">{Math.round((data.stats.hired_candidates / Math.max(data.stats.total_applications, 1)) * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Application Pipeline - Deep Indigo Theme */}
                                <motion.div 
                                    variants={itemVariants}
                                    whileHover={cardHover}
                                    className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 shadow-xl shadow-black/40 border border-white/5 relative overflow-hidden group/pipeline backdrop-blur-3xl"
                                >
                                    {/* Nebula Mesh Background */}
                                    <div className="absolute inset-0 bg-slate-950 overflow-hidden">
                                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent_70%)]" />
                                    </div>

                                    {/* High-Detail Micro-Grid */}
                                    <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-overlay">
                                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                            <defs>
                                                <pattern id="micro-grid-pipeline" width="4" height="4" patternUnits="userSpaceOnUse">
                                                    <circle cx="0.5" cy="0.5" r="0.2" fill="white" />
                                                </pattern>
                                            </defs>
                                            <rect width="100" height="100" fill="url(#micro-grid-pipeline)" />
                                        </svg>
                                    </div>

                                    {/* Glass Surface Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none opacity-50" />
                                    <div className="absolute inset-0 backdrop-blur-[2px]" />

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-lg font-black text-white tracking-tight">Application Pipeline</h3>
                                            <p className="text-xs text-emerald-200 font-medium mt-1">Conversion funnel stages</p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-white transition-transform duration-700 group-hover/pipeline:rotate-[360deg] relative z-20 overflow-hidden">
                                            <TrendingUp className="w-5 h-5 relative z-10" />
                                            <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 to-transparent opacity-0 group-hover/pipeline:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4 relative z-10">
                                        {(data.application_pipeline?.map((stage: any) => {
                                            if (stage.name === 'Hired') return { ...stage, value: data.stats.hired_candidates ?? stage.value };
                                            if (stage.name === 'Interviewing') return { ...stage, value: data.stats.interviews_scheduled ?? stage.value };
                                            if (stage.name === 'New Applications') return { ...stage, value: data.stats.new_candidates ?? stage.value };
                                            if (stage.name === 'Rejected') return { ...stage, value: data.stats.rejected_candidates ?? stage.value };
                                            return stage;
                                        }) || [
                                            { name: 'Candidates', value: data.stats.total_applications || 0, color: 'sky' },
                                            { name: 'Interviews', value: data.stats.interviews_scheduled || 0, color: 'violet' },
                                            { name: 'Hired', value: data.stats.hired_candidates || 0, color: 'emerald' }
                                        ]).map((stage: any, i: number) => {
                                            const max = Math.max(...(data.application_pipeline || []).map((s: any) => s.value), data.stats.total_applications || 1, 1);
                                            const percent = (stage.value / max) * 100;
                                            
                                            return (
                                                <div key={i} className="group/bar">
                                                    <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                                                        <span className="text-emerald-200/70 group-hover/bar:text-sky-400 transition-colors uppercase">{stage.name}</span>
                                                        <span className="text-white font-black">{stage.value}</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${percent}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.1 }}
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                                                            stage.color === 'sky' ? 'bg-gradient-to-r from-sky-400 to-sky-500' :
                                                            stage.color === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                                            stage.color === 'violet' ? 'bg-gradient-to-r from-violet-400 to-violet-500' :
                                                            stage.color === 'emerald' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                                            stage.color === 'rose' ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                                                            'bg-gradient-to-r from-sky-400 to-sky-500'
                                                            }`}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                        </motion.div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </motion.div>
                            </div>

                        {/* Top Jobs - Redesigned Rich Rows */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-50 hover:shadow-lg transition-shadow duration-300 flex flex-col relative overflow-hidden group"
                        >                                {/* Decorative Vector Background */}
                                {/* Decorative Vector Background - Refined */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                    {/* Gradient - Radial Pattern - Amber/Gold Theme - Lighter */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/30 via-orange-50/10 to-transparent"></div>
                                </div>

                                {/* Card Content - Z-Index to stay above background */}
                                <div className="relative z-10 flex-1 flex flex-col">
                                    <div className="mb-6 flex justify-between items-end">
                                        <div>
                                            <h3 className="text-lg font-black text-neutral-900 tracking-tight">Top Jobs</h3>
                                            <p className="text-xs text-neutral-400 font-medium mt-1">Most popular positions</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg px-2">
                                            View All
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {[...data.recent_jobs]
                                            .sort((a: any, b: any) => b.applications - a.applications)
                                            .slice(0, 4)
                                            .map((job: any, i: number) => {
                                                // Calculate relative intensity
                                                const maxApps = Math.max(...data.recent_jobs.map((j: any) => j.applications), 1);
                                                const intensity = (job.applications / maxApps);

                                                return (
                                                    <div key={i} className="group flex items-center justify-between p-3 rounded-2xl bg-white border border-neutral-100/80 shadow-sm hover:shadow-md hover:border-amber-200 transition-all duration-300 cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-300 shadow-sm ${i === 0 ? 'bg-amber-100 text-amber-600' :
                                                                i === 1 ? 'bg-neutral-100 text-neutral-500' :
                                                                    i === 2 ? 'bg-orange-50 text-orange-400' :
                                                                        'bg-slate-50 text-slate-400'
                                                                } group-hover:scale-110`}>
                                                                {job.title.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-neutral-900 text-sm group-hover:text-amber-700 transition-colors truncate max-w-[120px] sm:max-w-[150px]">{job.title}</h4>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] font-medium text-neutral-400">ID: {job.jobId}</span>
                                                                    {job.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-1 bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100 group-hover:bg-white group-hover:border-amber-100 transition-colors">
                                                                <Users className="w-3 h-3 text-amber-500" />
                                                                <span className="text-xs font-black text-neutral-900">{job.applications}</span>
                                                            </div>
                                                            {/* Subtle progress bar at bottom of card */}
                                                            <div className="w-12 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${intensity * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                    </div>
                                    {data.recent_jobs.length === 0 && (
                                        <div className="text-center py-8 text-neutral-400 text-xs">No active jobs found.</div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Application Traffic - Bold Neutral Theme */}
                            <motion.div 
                                variants={itemVariants}
                                whileHover={cardHover}
                                className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-3xl p-6 shadow-xl shadow-black/20 border border-white/10 relative overflow-hidden group/traffic backdrop-blur-3xl"
                            >
                                {/* High-Tech Background Pattern - Traffic Unique */}
                                <div className="absolute inset-0 opacity-[0.08] pointer-events-none group-hover/traffic:opacity-[0.12] transition-opacity duration-700">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <defs>
                                            <pattern id="traffic-grid-final" width="8" height="20" patternUnits="userSpaceOnUse">
                                                <line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="0.4" />
                                                <line x1="0" y1="20" x2="8" y2="20" stroke="white" strokeWidth="0.1" />
                                            </pattern>
                                            <radialGradient id="traffic-glow-final" cx="50%" cy="100%" r="80%">
                                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                                                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                            </radialGradient>
                                        </defs>
                                        <rect width="100" height="100" fill="url(#traffic-grid-final)" />
                                        <rect width="100" height="100" fill="url(#traffic-glow-final)" />
                                    </svg>
                                </div>

                                {/* Floating Data Nodes decorative element */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 group-hover/traffic:opacity-40 transition-opacity duration-1000">
                                   <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-emerald-200 rounded-full animate-ping" />
                                   <div className="absolute top-[60%] left-[40%] w-1 h-1 bg-emerald-200 rounded-full animate-ping delay-300" />
                                   <div className="absolute top-[30%] left-[80%] w-1 h-1 bg-emerald-200 rounded-full animate-ping delay-700" />
                                </div>

                                <div className="flex justify-between items-center mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight">Application Traffic</h3>
                                        <p className="text-xs text-emerald-200 font-medium mt-1">Candidate application trends over time</p>
                                    </div>
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsChartFilterOpen(!isChartFilterOpen)}
                                            className={`!rounded-full border-white/20 text-xs font-bold bg-white/10 text-white hover:bg-white/20 hover:text-white ${isChartFilterOpen ? 'bg-white/20 ring-2 ring-white/30' : ''}`}
                                        >
                                            <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                                        </Button>
                                    </div>
                                </div>

                                <div className="h-40 w-full relative z-10 group">
                                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                                        <defs>
                                            <linearGradient id="chartGradient-final" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
                                                <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                                            </linearGradient>
                                            <filter id="glow-final" x="-20%" y="-20%" width="140%" height="140%">
                                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            d={areaPath}
                                            fill="url(#chartGradient-final)"
                                        />
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                                            d={linePath}
                                            fill="none"
                                            stroke="#10B981"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#glow-final)"
                                        />
                                        
                                        {normalizedPoints.map((p: number[], i: number) => (
                                            <g key={i} className="group/point">
                                                <circle
                                                    cx={p[0]}
                                                    cy={p[1]}
                                                    r="4"
                                                    fill="#fff"
                                                    stroke="#10B981"
                                                    strokeWidth="3"
                                                />
                                                <text
                                                    x={p[0]}
                                                    y={chartHeight + 20}
                                                    textAnchor="middle"
                                                    className="text-[10px] fill-emerald-200/50 font-medium"
                                                >
                                                    {data.traffic[i]?.day}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>
                                </div>
                            </motion.div>

                        {/* Recent Jobs List - With Subtle Vector Background & Hover Effects */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-50 relative overflow-hidden group/card hover:shadow-lg transition-all duration-500"
                        >                            {/* Subtle Vector Background */}
                            <div className="absolute inset-0 pointer-events-none opacity-30">
                                <svg className="absolute -right-10 -top-10 text-sky-50 w-64 h-64 rotate-12 group-hover/card:rotate-6 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 200" fill="currentColor">
                                    <path d="M41.2,-70.5C54.4,-63.1,66.6,-54.6,76.5,-43.3C86.4,-32,94,-17.9,92.5,-4.4C91.1,9.1,80.6,22,70.9,33.4C61.2,44.8,52.4,54.7,41.9,62.8C31.4,70.8,19.3,77.1,5.6,80.4C-8.1,83.6,-23.4,83.8,-36.8,78.2C-50.2,72.6,-61.7,61.2,-70.1,48.2C-78.5,35.2,-83.8,20.6,-83.9,6C-84,-8.6,-78.9,-23.2,-69.9,-35.1C-60.9,-47,-48,-56.3,-35.3,-64C-22.6,-71.7,-10.1,-77.9,3.7,-80C17.5,-82.2,35,-80.2,41.2,-70.5Z" transform="translate(100 100)" />
                                </svg>
                                <svg className="absolute -left-16 -bottom-16 text-sky-50 w-72 h-72 -rotate-12 group-hover/card:-rotate-3 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 200" fill="currentColor">
                                    <path d="M47.7,-74.6C62.1,-66.3,74.5,-54.2,81.4,-39.8C88.3,-25.4,89.7,-8.7,85.1,6.2C80.5,21.1,69.9,34.2,58.8,45.6C47.7,56.9,36.1,66.5,22.7,71.2C9.3,75.9,-5.9,75.7,-20.9,71.8C-35.9,67.8,-50.7,60.1,-63.1,49.2C-75.5,38.3,-85.5,24.2,-87.3,8.7C-89.1,-6.8,-82.7,-23.7,-72.2,-37.7C-61.7,-51.7,-47.1,-62.8,-32.9,-71.2C-18.7,-79.6,-4.9,-85.3,8.7,-84.9C22.3,-84.5,33.3,-92.9,47.7,-74.6Z" transform="translate(100 100)" />
                                </svg>
                            </div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div>
                                    <h3 className="text-lg font-black text-neutral-900">Active Jobs</h3>
                                </div>
                                <Link href="/jobs">
                                    <Button variant="ghost" size="sm" className="text-sky-600 font-bold hover:bg-sky-50 rounded-xl transition-colors">
                                        View All
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-3 relative z-10">
                                {data.recent_jobs.slice(0, 4).map((job: any, i: number) => (
                                    <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-100 hover:border-sky-200 hover:shadow-md hover:shadow-sky-100 hover:-translate-x-1 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-sm group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300 shadow-sm">
                                                {job.title.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-neutral-900 group-hover:text-sky-700 transition-colors">{job.title}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-neutral-400 bg-neutral-50 px-1.5 py-0.5 rounded">ID: {job.jobId}</span>
                                                    <span className="text-[10px] text-neutral-400">• {job.postedDate}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, idx) => (
                                                    <div key={idx} className="w-6 h-6 rounded-full bg-neutral-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-neutral-400 group-hover:border-sky-100 transition-colors">
                                                        U
                                                    </div>
                                                ))}
                                            </div>
                                            <Badge variant={(job.status as any) || 'default'} className={`bg-transparent border-transparent ${job.status === 'active' ? 'text-emerald-600 bg-emerald-50' : 'text-neutral-500'
                                                } capitalize font-bold group-hover:bg-emerald-100 transition-colors`}>
                                                {job.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                    </div>

                    {/* Right Column (4/12) */}
                    <div className="lg:col-span-4 space-y-5 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-backwards">

                        {/* Billing Card - Compact Feature Card with Rich Gradient & Animation */}
                        {(() => {
                            const billing = data.billing || {
                                plan_name: 'Free Tier',
                                status: 'inactive',
                                amount: '0.00',
                                currency: 'USD',
                                next_billing: 'N/A'
                            };

                            return (
                                <motion.div 
                                    variants={itemVariants}
                                    whileHover={cardHover}
                                    className="bg-gradient-to-br from-sky-600 to-indigo-700 rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-sky-600/30 group hover:shadow-sky-600/50 transition-all duration-500 cursor-default"
                                >                                    {/* Vector Background Shapes */}
                                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                        <svg className="absolute -right-8 -top-8 text-white/10 w-48 h-48 rotate-12 group-hover:rotate-45 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 200" fill="currentColor">
                                            <path d="M45.7,-78.3C58.9,-69.3,69.1,-56.4,76.5,-42.3C83.9,-28.1,88.5,-12.7,86.9,1.6C85.3,15.9,77.5,29.1,68.6,41.2C59.7,53.3,49.7,64.3,37.6,71.2C25.5,78.1,11.3,80.9,-1.8,84C-14.9,87.1,-28.1,90.5,-40.3,86.5C-52.5,82.5,-63.7,71.1,-71.8,57.9C-79.9,44.7,-84.9,29.7,-83.8,15.2C-82.7,0.7,-75.5,-13.3,-66.6,-25.6C-57.7,-37.9,-47.1,-48.5,-35.1,-58.1C-23.1,-67.7,-9.7,-76.3,4.9,-84.8L19.5,-93.3" transform="translate(100 100)" />
                                        </svg>
                                        <svg className="absolute -left-10 -bottom-10 text-indigo-500/30 w-56 h-56 -rotate-12 group-hover:-rotate-45 transition-transform duration-1000 ease-in-out" viewBox="0 0 200 200" fill="currentColor">
                                            <path d="M42.7,-72.9C54.8,-66.8,63.6,-53.4,70.5,-39.7C77.4,-26,82.4,-11.9,80.7,1.5C79,14.9,70.6,27.6,61.3,38.8C52,50,41.8,59.7,30.3,65.8C18.8,71.9,6,74.4,-6.2,85.1C-18.4,95.8,-30,114.7,-40.3,115.5C-50.6,116.3,-59.6,99,-67.5,83.1C-75.4,67.2,-82.2,52.7,-85.5,37.6C-88.8,22.5,-88.6,6.8,-83.6,-6.6C-78.6,-20,-68.8,-31.1,-58.1,-40.4C-47.4,-49.7,-35.8,-57.2,-23.9,-63.5C-12,-69.8,0.2,-74.9,12.2,-74.4L24.4,-73.9" transform="translate(100 100)" />
                                        </svg>
                                    </div>

                                    <div className="relative z-10 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-black tracking-tight">{billing.plan_name}</h3>
                                                <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{billing.status}</span>
                                            </div>
                                            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg shadow-sm group-hover:bg-white group-hover:text-sky-600 transition-colors duration-300"><CreditCard className="w-4 h-4" /></div>
                                        </div>

                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black">{billing.currency === 'USD' ? '$' : billing.currency}{billing.amount}</span>
                                            <span className="text-indigo-200 font-bold text-xs">/mo</span>
                                        </div>

                                        <Link href="/billing">
                                            <Button size="sm" className="w-full !bg-white !text-sky-700 hover:!bg-white/90 font-bold h-9 !rounded-xl border-0 shadow-md transition-all active:scale-95">
                                                Manage Plan
                                            </Button>
                                        </Link>
                                    </div>
                                </motion.div>
                            );
                        })()}

                        {/* Alerts - Compact & Interactive */}
                        {data.alerts && data.alerts.length > 0 && (
                            <div className="space-y-2">
                                {data.alerts.map((alert: any, idx: number) => (
                                    <div key={idx} className="bg-orange-50/50 border border-orange-100 p-3 rounded-xl flex items-center justify-between text-[10px] hover:bg-orange-100 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-orange-100 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                                <Activity className="w-3 h-3" />
                                            </div>
                                            <span className="font-bold text-orange-800">{alert.message}</span>
                                        </div>
                                        {alert.action_url && <ArrowUpRight className="w-3 h-3 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Quick Actions - Grid 2x2 Interactive */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-50 relative overflow-hidden group hover:shadow-lg transition-all duration-500"
                        >                            <div className="absolute top-0 right-0 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                <svg className="w-32 h-32 text-sky-100" viewBox="0 0 200 200" fill="currentColor">
                                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,79.6,-46.3C87.4,-33.5,90.1,-18,88.4,-3.2C86.7,11.6,80.7,25.7,71.5,37.5C62.3,49.3,49.9,58.8,36.9,65.3C23.9,71.8,10.3,75.3,-2.6,79.8C-15.5,84.3,-27.7,89.8,-39,85.2C-50.3,80.6,-60.7,65.9,-69.3,51.7C-77.9,37.5,-84.7,23.8,-83.8,10.5C-82.9,-2.8,-74.3,-15.7,-64.8,-27.1C-55.3,-38.5,-44.9,-48.4,-33,-56.6C-21.1,-64.8,-7.7,-71.3,6.3,-82.2C20.3,-93.1,40.6,-108.4,44.7,-76.4Z" transform="translate(100 100)" />
                                </svg>
                            </div>

                            <h3 className="text-xs font-bold text-neutral-900 mb-3 px-1 relative z-10">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3 relative z-10">
                                {(() => {
                                    const actionVariants: any = {
                                        sky: {
                                            wrapper: 'bg-sky-50/50 border-sky-100/50 hover:bg-sky-500 hover:shadow-sky-200',
                                            icon: 'text-sky-500',
                                            text: 'text-sky-700'
                                        },
                                        emerald: {
                                            wrapper: 'bg-emerald-50/50 border-emerald-100/50 hover:bg-emerald-500 hover:shadow-emerald-200',
                                            icon: 'text-emerald-500',
                                            text: 'text-emerald-700'
                                        },
                                        amber: {
                                            wrapper: 'bg-orange-50/50 border-orange-100/50 hover:bg-orange-500 hover:shadow-orange-200',
                                            icon: 'text-orange-500',
                                            text: 'text-orange-700'
                                        }
                                    };

                                    return [
                                        { label: 'Post Job', icon: Plus, color: 'sky', href: '/jobs' },
                                        { label: 'Candidates', icon: Users, color: 'sky', href: '/candidates' },
                                        { label: 'Messages', icon: MessageCircle, color: 'emerald', href: '/messages' },
                                        { label: 'Company Profile', icon: Settings, color: 'amber', href: '/settings/profile' },
                                    ].map((action, i) => {
                                        const variant = actionVariants[action.color] || actionVariants.sky;
                                        return (
                                            <Link key={i} href={action.href}>
                                                <div className={`p-3 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 h-20 text-center backdrop-blur-sm border group/action hover:shadow-lg hover:-translate-y-1 ${variant.wrapper}`}>
                                                    <action.icon className={`w-5 h-5 group-hover/action:text-white transition-colors ${variant.icon}`} />
                                                    <span className={`text-[10px] font-bold group-hover/action:text-white transition-colors ${variant.text}`}>{action.label}</span>
                                                </div>
                                            </Link>
                                        );
                                    });
                                })()}
                            </div>
                        </motion.div>

                        {/* Recent Activity - List Interactive */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-50 relative overflow-hidden group hover:shadow-lg transition-all duration-500"
                        >                            <div className="absolute -bottom-10 -left-10 opacity-20 pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                                <svg className="w-40 h-40 text-emerald-100" viewBox="0 0 200 200" fill="currentColor">
                                    <path d="M38.1,-63.9C49.9,-54.9,60.5,-45.5,69.5,-34C78.5,-22.5,85.9,-8.9,86.4,5.1C86.9,19.1,80.5,33.5,70.6,44.5C60.7,55.5,47.3,63.1,33.7,68.8C20.1,74.5,6.3,78.3,-6.9,89.5C-20.1,100.7,-32.7,119.3,-43.3,117.8C-53.9,116.3,-62.5,94.7,-69.7,76.5C-76.9,58.3,-82.7,43.5,-84.8,28.6C-86.9,13.7,-85.3,-1.3,-79.8,-14.8C-74.3,-28.3,-64.9,-40.3,-53.6,-49.5C-42.3,-58.7,-29.1,-65.1,-15.8,-66.1C-2.5,-67.1,10.8,-62.7,24.1,-58.3Z" transform="translate(100 100)" />
                                </svg>
                            </div>

                            <h3 className="text-xs font-bold text-neutral-900 mb-3 px-1 relative z-10">Recent Activity</h3>
                            <div className="space-y-4 relative z-10">
                                {data.recent_activities.slice(0, 4).map((activity: any, i: number) => (
                                    <div key={i} className="flex gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors cursor-default group/activity">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-none ${activity.type === 'job' ? 'bg-sky-500' : 'bg-emerald-500'} group-hover/activity:scale-125 transition-transform`}></div>
                                        <div>
                                            <p className="text-xs font-bold text-neutral-800 leading-tight line-clamp-1 group-hover/activity:text-sky-700 transition-colors">
                                                {activity.description || `${activity.user} ${activity.title}`}
                                            </p>
                                            <p className="text-[10px] text-neutral-400 font-medium">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming Interviews - New Widget */}
                        <motion.div 
                            variants={itemVariants}
                            whileHover={cardHover}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-50 relative overflow-hidden group hover:shadow-lg transition-all duration-500"
                        >                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xs font-bold text-neutral-900">Upcoming Interviews</h3>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-neutral-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg px-2">
                                    Calendar
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {data.upcoming_interviews && data.upcoming_interviews.length > 0 ? (
                                    data.upcoming_interviews.map((interview: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-neutral-50/50 border border-neutral-100 hover:bg-white hover:border-sky-100 hover:shadow-md transition-all duration-300 group/interview">
                                            {/* Date Badge */}
                                            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white border border-neutral-100 shadow-sm text-center group-hover/interview:border-sky-200 group-hover/interview:bg-sky-50 transition-colors">
                                                <span className="text-[10px] font-bold text-neutral-400 uppercase leading-none group-hover/interview:text-sky-400">{interview.date?.split(' ')[0]}</span>
                                                <span className="text-sm font-black text-neutral-900 leading-none mt-0.5 group-hover/interview:text-sky-700">{interview.date?.split(' ')[1]}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-neutral-900 truncate group-hover/interview:text-sky-700 transition-colors">{interview.candidate_name}</h4>
                                                <p className="text-[10px] text-neutral-500 truncate">{interview.job_title}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    <span className="text-[10px] font-medium text-neutral-400">{interview.time}</span>
                                                </div>
                                            </div>

                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-neutral-400 hover:text-white hover:bg-sky-500 transition-all">
                                                <div className="w-4 h-4 flex items-center justify-center">📹</div>
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl grayscale opacity-50">☕️</div>
                                        <p className="text-xs font-bold text-neutral-400">No interviews coming up</p>
                                        <Button variant="ghost" className="text-[10px] text-sky-500 hover:text-sky-600 h-auto p-0 mt-1 hover:bg-transparent underline-offset-4 hover:underline" size="sm">Schedule Now</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>

            </motion.div>
        </DashboardLayout>
    )
}

export default DashboardPage

