import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  className?: string;
};

export function ProgressBar({ value, max = 100, label = "Progress", className }: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  return (
    <div
      className={cx("ui-progress", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={value}
      style={{ ["--ui-progress" as never]: `${pct}%` } as React.CSSProperties}
    >
      <div className="ui-progress__bar" />
    </div>
  );
}

export type Step = {
  id: string;
  label: React.ReactNode;
  status?: "complete" | "current" | "upcoming";
};

export type StepperProps = {
  steps: Step[];
  className?: string;
};

export function Stepper({ steps, className }: StepperProps) {
  return (
    <ol className={cx("ui-stepper", className)}>
      {steps.map((s) => (
        <li key={s.id} className={cx("ui-stepper__step", s.status && `ui-stepper__step--${s.status}`)}>
          <span className="ui-stepper__dot" aria-hidden="true" />
          <span className="ui-stepper__label text-body-small">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
