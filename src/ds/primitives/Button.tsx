import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "text" | "icon" | "fab" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    isLoading,
    loadingText,
    type = "button",
    disabled,
    children,
    ...props
  },
  ref
) {
  const computedDisabled = Boolean(disabled || isLoading);

  return (
    <button
      ref={ref}
      type={type}
      disabled={computedDisabled}
      aria-busy={isLoading ? true : undefined}
      className={cx(
        "ui-button ui-focus-ring",
        size === "sm" && "ui-button--sm",
        size === "md" && "ui-button--md",
        size === "lg" && "ui-button--lg",
        variant === "primary" && "ui-button--primary",
        variant === "danger" && "ui-button--danger",
        variant === "secondary" && "ui-button--secondary",
        variant === "ghost" && "ui-button--ghost",
        variant === "text" && "ui-button--text",
        variant === "icon" && "ui-button--icon",
        variant === "fab" && "ui-button--fab",
        isLoading && "ui-button--loading",
        className
      )}
      {...props}
    >
      {isLoading ? (loadingText ?? "Loading…") : children}
    </button>
  );
});
