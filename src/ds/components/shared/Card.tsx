import * as React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;
export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;
export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className, ...props }: CardProps) {
  return <div className={cx("ui-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cx("ui-card__header", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cx("ui-card__content", className)} {...props} />;
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cx("ui-card__footer", className)} {...props} />;
}
