import * as React from "react";

import { Avatar, type AvatarProps } from "../../primitives/Avatar";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AvatarGroupProps = {
  people: Array<Pick<AvatarProps, "name" | "src" | "alt">>;
  size?: AvatarProps["size"];
  max?: number;
  className?: string;
};

export function AvatarGroup({ people, size = "sm", max = 5, className }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = Math.max(0, people.length - visible.length);
  return (
    <div className={cx("ui-avatars", className)}>
      {visible.map((p, idx) => (
        <span key={`${p.name ?? p.alt ?? idx}`} className="ui-avatars__item">
          <Avatar name={p.name} src={p.src} alt={p.alt} size={size} />
        </span>
      ))}
      {overflow > 0 ? (
        <span className="ui-avatars__item">
          <Avatar name={`+${overflow}`} alt={`+${overflow} more`} size={size} />
        </span>
      ) : null}
    </div>
  );
}

