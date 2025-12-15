import * as React from"react"

export interface NeumorphicCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NeumorphicCheckbox = React.forwardRef<HTMLInputElement, NeumorphicCheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="checkbox"
              ref={ref}
              className={`
                peer sr-only
                ${className || ''}
              `}
              {...props}
            />
            <div className="
              w-5 h-5 
              bg-background rounded-md 
              shadow-neu-inset
              border border-border/50
              peer-checked:shadow-neu-outset peer-checked:border-primary/50
              peer-focus:ring-2 peer-focus:ring-primary/20
              transition-colors duration-200
              cursor-pointer
              flex items-center justify-center
      ">
              <svg 
                className="w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          {label && (
            <label className="text-body-small text-foreground cursor-pointer select-none">
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-body-small text-destructive">{error}</p>
        )}
      </div>
    )
  }
)
NeumorphicCheckbox.displayName ="NeumorphicCheckbox"

export { NeumorphicCheckbox }
