import * as React from"react"

export interface NeumorphicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const NeumorphicSelect = React.forwardRef<HTMLSelectElement, NeumorphicSelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-body-small text-foreground">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-3 
              bg-background rounded-xl 
              shadow-neu-inset
              border border-border/50
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:shadow-neu-inset-sm focus:border-primary/50
              transition-colors duration-200
              appearance-none
              ${error ? 'border-destructive/50 shadow-neu-inset' : ''}
              ${className || ''}
            `}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="text-body-small text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
NeumorphicSelect.displayName ="NeumorphicSelect"

export { NeumorphicSelect }
