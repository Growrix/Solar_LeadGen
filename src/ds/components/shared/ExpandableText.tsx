"use client";

import * as React from "react";

import { Button } from "../../primitives/Button";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type ExpandableTextCollapsedLines = 2 | 3 | 4 | 5;

export type ExpandableTextProps = {
  children: React.ReactNode;
  collapsedLines?: ExpandableTextCollapsedLines;
  moreLabel?: React.ReactNode;
  lessLabel?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
};

export function ExpandableText({
  children,
  collapsedLines = 3,
  moreLabel = "Read more",
  lessLabel = "Show less",
  defaultExpanded = false,
  className,
}: ExpandableTextProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className={cx("ui-expandable", className)} data-expanded={expanded ? "true" : "false"}>
      <div className="ui-expandable__body" data-lines={collapsedLines}>
        {children}
      </div>
      <Button size="sm" variant="text" className="ui-expandable__toggle" onClick={() => setExpanded((v) => !v)}>
        {expanded ? lessLabel : moreLabel}
      </Button>
    </div>
  );
}
