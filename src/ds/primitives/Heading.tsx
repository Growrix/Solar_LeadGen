import * as React from "react";

type HeadingVariant = 1 | 2 | 3 | 4;

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Maps to DS typography utilities (text-heading-1..4). */
  variant?: HeadingVariant;
  /** Overrides the rendered element; defaults are based on variant. */
  as?: HeadingTag;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function defaultTagForVariant(variant: HeadingVariant): HeadingTag {
  if (variant === 1) return "h1";
  if (variant === 2) return "h2";
  if (variant === 3) return "h3";
  return "h4";
}

/**
 * Heading wrapper around DS typography utility classes.
 * Token-driven; no hardcoded sizes.
 */
export function Heading({ variant = 3, as, className, ...props }: HeadingProps) {
  const Tag = (as ?? defaultTagForVariant(variant)) as HeadingTag;

  return (
    <Tag
      className={cx(
        variant === 1 && "text-heading-1",
        variant === 2 && "text-heading-2",
        variant === 3 && "text-heading-3",
        variant === 4 && "text-heading-4",
        className
      )}
      {...props}
    />
  );
}
