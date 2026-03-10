import * as React from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg";
export type AvatarShape = "circle" | "rounded";

export type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/g).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function Avatar({ src, alt, name, size = "md", shape = "circle", className }: AvatarProps) {
  const label = alt ?? name ?? "Avatar";
  return (
    <span
      className={cx(
        "ui-avatar",
        size === "xs" && "ui-avatar--xs",
        size === "sm" && "ui-avatar--sm",
        size === "md" && "ui-avatar--md",
        size === "lg" && "ui-avatar--lg",
        shape === "rounded" && "ui-avatar--rounded",
        className
      )}
      aria-label={label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="ui-avatar__img" src={src} alt={label} loading="lazy" />
      ) : (
        <span className="ui-avatar__fallback">{name ? initials(name) : "?"}</span>
      )}
    </span>
  );
}
