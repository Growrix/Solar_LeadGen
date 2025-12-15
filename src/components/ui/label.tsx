"use client"

import * as React from"react"
import { cn } from"@/lib/utils"

/**
 * Label Component
 * Simple label component for form fields without Radix UI dependency
 * Part of neumorphic design system
 */

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
      "text-body-small leading-none text-foreground-muted",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
)
Label.displayName ="Label"

export { Label }
