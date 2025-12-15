import * as React from"react";

export interface NeumorphicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const NeumorphicInput = React.forwardRef<HTMLInputElement, NeumorphicInputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-body-small text-foreground">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`
            w-full px-4 py-3 
            bg-background rounded-xl 
            shadow-neu-inset
            border border-border/50
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:shadow-neu-inset-sm focus:border-primary/50
            transition-colors duration-200
            disabled:cursor-not-allowed disabled:opacity-50
            ${error ? 'border-destructive/50' : ''}
            ${className || ''}
          `}
          {...props}
        />
        {error && (
          <p className="text-body-small text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

NeumorphicInput.displayName ="NeumorphicInput";

export { NeumorphicInput };
