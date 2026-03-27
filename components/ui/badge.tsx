import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "active" | "paused" | "draft" | "closed" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "interviewed" | "rejected" | "hired" | "paid" | "pending" | "default" | "approved" | "hidden"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-neutral-50 text-neutral-600 ring-1 ring-inset ring-neutral-500/10",
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    paused: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    draft: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    closed: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
    new: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20",
    reviewed: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20",
    shortlisted: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    contacting: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20",
    interviewing: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    interviewed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    rejected: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20",
    hired: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-600/20",
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
    approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
    hidden: "bg-neutral-50 text-neutral-600 ring-1 ring-inset ring-neutral-500/10",
    inactive: "bg-neutral-50 text-neutral-600 ring-1 ring-inset ring-neutral-500/10",
  }

  const classes = `inline-flex items-center rounded-full  px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`

  return (
    <div className={classes} {...props} />
  )
}

export { Badge }
