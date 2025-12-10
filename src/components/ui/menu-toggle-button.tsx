import * as React from"react";
import { cn } from"@/lib/utils";

interface MenuToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen?: boolean;
}

export const MenuToggleButton = React.forwardRef<HTMLButtonElement, MenuToggleButtonProps>(
  ({ isOpen = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
        "p-3 rounded-full transition-colors duration-200",
        "",
        "hover:",
        "active: active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        aria-label={isOpen ?"Close menu" :"Open menu"}
        aria-expanded={isOpen}
        {...props}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 text-foreground-secondary"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 text-foreground-secondary"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>
    );
  }
);

MenuToggleButton.displayName ="MenuToggleButton";
