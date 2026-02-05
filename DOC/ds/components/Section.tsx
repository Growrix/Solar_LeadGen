import * as React from "react";

export type SectionTone = "default" | "surface";
export type SectionSize = "sm" | "md" | "lg";
export type SectionContainer = "default" | "narrow" | "wide" | "full";

export type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: SectionTone;
  size?: SectionSize;
  container?: SectionContainer;
  bandClassName?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function Section({
  tone = "default",
  size = "md",
  container = "default",
  className,
  bandClassName,
  ...props
}: SectionProps) {
  return (
    <div className={cx("ui-band", tone === "surface" && "ui-band--surface", bandClassName)}>
      <section
        className={cx(
          "ui-container ui-section",
          size === "sm" && "ui-section--sm",
          size === "lg" && "ui-section--lg",
          container === "narrow" && "ui-container--narrow",
          container === "wide" && "ui-container--wide",
          container === "full" && "ui-container--full",
          className
        )}
        {...props}
      />
    </div>
  );
}
