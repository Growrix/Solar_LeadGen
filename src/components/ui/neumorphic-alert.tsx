import * as React from"react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from"lucide-react"

export interface NeumorphicAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:"error" |"success" |"warning" |"info";
  title?: string;
}

const NeumorphicAlert = React.forwardRef<HTMLDivElement, NeumorphicAlertProps>(
  ({ className, variant ="info", title, children, ...props }, ref) => {
    const variantStyles = {
      error: {
        container:"bg-destructive/10 border-destructive/30",
        icon:"text-destructive",
        title:"text-destructive",
        text:"text-destructive/90"
      },
      success: {
        container:"bg-success/10 border-success/30",
        icon:"text-success",
        title:"text-success",
        text:"text-success/90"
      },
      warning: {
        container:"bg-warning/10 border-warning/30",
        icon:"text-warning",
        title:"text-warning",
        text:"text-warning/90"
      },
      info: {
        container:"bg-info/10 border-info/30",
        icon:"text-info",
        title:"text-info",
        text:"text-info/90"
      }
    };

    const icons = {
      error: AlertCircle,
      success: CheckCircle2,
      warning: AlertTriangle,
      info: Info
    };

    const Icon = icons[variant];
    const styles = variantStyles[variant];

    return (
      <div
        ref={ref}
        className={`
          rounded-xl p-4 border
          bg-background shadow-neu-inset
          ${styles.container}
          ${className || ''}
        `}
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`} />
          <div className="flex-1">
            {title && (
              <h4 className={` mb-1 ${styles.title}`}>{title}</h4>
            )}
            <div className={`text-body-small ${styles.text}`}>
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
NeumorphicAlert.displayName ="NeumorphicAlert"

export { NeumorphicAlert }
