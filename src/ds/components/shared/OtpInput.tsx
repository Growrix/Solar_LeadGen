"use client";

import * as React from "react";

import { Input } from "../../primitives/Input";

export type OtpInputMode = "numeric" | "alphanumeric";

export type OtpInputProps = {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: OtpInputMode;
  disabled?: boolean;
  name?: string;
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function sanitize(mode: OtpInputMode, raw: string) {
  const v = raw.replace(/\s+/g, "");
  return mode === "numeric" ? v.replace(/\D+/g, "") : v.replace(/[^0-9a-zA-Z]+/g, "");
}

function toCells(length: number, v: string) {
  const out = Array.from({ length }, (_, i) => v[i] ?? "");
  return out;
}

export function OtpInput({
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  mode = "numeric",
  disabled,
  name,
  autoFocus,
  className,
  "aria-label": ariaLabel = "One-time code",
}: OtpInputProps) {
  const isControlled = typeof value === "string";
  const [internal, setInternal] = React.useState<string>(() => defaultValue ?? "");
  const currentValue = isControlled ? (value as string) : internal;

  const refs = React.useRef<Array<HTMLInputElement | null>>([]);

  const emit = React.useCallback(
    (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
      if (next.length >= length && !next.includes("")) {
        onComplete?.(next.slice(0, length));
      }
    },
    [isControlled, length, onComplete, onValueChange]
  );

  const applyChars = React.useCallback(
    (startIndex: number, rawText: string) => {
      const chars = sanitize(mode, rawText).slice(0, length - startIndex).split("");
      if (chars.length === 0) return { nextValue: currentValue, nextFocus: startIndex };

      const cells = toCells(length, currentValue);
      for (let i = 0; i < chars.length; i++) {
        cells[startIndex + i] = chars[i] ?? "";
      }
      const nextValue = cells.join("").slice(0, length);

      const nextFocus = Math.min(startIndex + chars.length, length - 1);
      return { nextValue, nextFocus };
    },
    [currentValue, length, mode]
  );

  const cells = React.useMemo(() => toCells(length, sanitize(mode, currentValue).slice(0, length)), [currentValue, length, mode]);

  React.useEffect(() => {
    if (!autoFocus) return;
    refs.current[0]?.focus();
  }, [autoFocus]);

  return (
    <div className={cx("ui-otp", className)} aria-label={ariaLabel}>
      {cells.map((cell, idx) => (
        <Input
          key={idx}
          ref={(el) => {
            refs.current[idx] = el;
          }}
          className="ui-otp__cell"
          value={cell}
          name={name ? `${name}-${idx + 1}` : undefined}
          disabled={disabled}
          inputMode={mode === "numeric" ? "numeric" : "text"}
          autoComplete={idx === 0 ? "one-time-code" : "off"}
          aria-label={`${ariaLabel} ${idx + 1}`}
          onChange={(e) => {
            const raw = e.target.value;
            const clean = sanitize(mode, raw);

            if (clean.length > 1) {
              const { nextValue, nextFocus } = applyChars(idx, clean);
              emit(nextValue);
              refs.current[nextFocus]?.focus();
              return;
            }

            const nextCells = [...cells];
            nextCells[idx] = clean.slice(-1);
            const nextValue = nextCells.join("").slice(0, length);
            emit(nextValue);

            if (clean && idx < length - 1) {
              refs.current[idx + 1]?.focus();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              refs.current[Math.max(0, idx - 1)]?.focus();
              return;
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              refs.current[Math.min(length - 1, idx + 1)]?.focus();
              return;
            }
            if (e.key === "Backspace") {
              const hasValue = Boolean(cells[idx]);
              if (hasValue) {
                e.preventDefault();
                const nextCells = [...cells];
                nextCells[idx] = "";
                emit(nextCells.join("").slice(0, length));
                return;
              }
              if (idx > 0) {
                e.preventDefault();
                refs.current[idx - 1]?.focus();
              }
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text");
            const { nextValue, nextFocus } = applyChars(idx, text);
            emit(nextValue);
            refs.current[nextFocus]?.focus();
          }}
        />
      ))}
    </div>
  );
}
