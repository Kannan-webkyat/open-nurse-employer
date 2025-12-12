import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "active" | "paused" | "draft" | "closed" | "new" | "reviewed" | "shortlisted" | "contacting" | "interviewing" | "rejected" | "hired" | "paid" | "pending" | "default"
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-neutral-50 text-neutral-800",
    active: "bg-green-100 text-green-600",
    paused: "bg-yellow-100 text-yellow-600",
    draft: "bg-blue-100 text-blue-600",
    closed: "bg-red-100 text-red-600",
    new: "bg-blue-100 text-blue-600",
    reviewed: "bg-blue-100 text-blue-600",
    shortlisted: "bg-yellow-100 text-yellow-600",
    contacting: "bg-purple-100 text-purple-600",
    interviewing: "bg-indigo-100 text-indigo-600",
    rejected: "bg-red-100 text-red-600",
    hired: "bg-teal-100 text-teal-600",
    paid: "bg-green-100 text-green-600",
    pending: "bg-amber-100 text-amber-600",
  }
  
  const classes = `inline-flex items-center rounded-full  px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`
  
  return (
    <div className={classes} {...props} />
  )
}

export { Badge }
