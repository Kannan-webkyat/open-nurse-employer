import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
    
    const variantClasses = {
      default: "bg-sky-500 text-white hover:bg-sky-600 rounded-full",
      outline: "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100 hover:border-neutral-200 hover:text-neutral-800 rounded-full",
      ghost: "hover:bg-neutral-100 text-neutral-700 rounded-full",
      danger: "bg-red-500 text-white hover:bg-red-600 rounded-full",
      block: "w-full bg-neutral-500 text-white hover:bg-neutral-600 rounded-full",
    }
    
    const sizeClasses = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3 text-sm",
      lg: "h-11 rounded-md px-8",
    }
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
    
    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
