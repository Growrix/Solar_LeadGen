"use client";

import * as React from "react";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type AccordionProps = {
  children: React.ReactNode;
  className?: string;
  type?: "single" | "multiple";
  defaultValue?: string | string[];
};

export function Accordion({ children, className, type = "single", defaultValue }: AccordionProps) {
  const [open, setOpen] = React.useState<string[]>(() => {
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === "string") return [defaultValue];
    return [];
  });

  const toggle = React.useCallback(
    (value: string) => {
      setOpen((prev) => {
        const isOpen = prev.includes(value);
        if (type === "single") return isOpen ? [] : [value];
        return isOpen ? prev.filter((v) => v !== value) : [...prev, value];
      });
    },
    [type]
  );

  return (
    <div className={cx("ui-accordion", className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        if (child.type !== AccordionItem) return child;
        const value = (child.props as AccordionItemProps).value;
        return React.cloneElement(child as React.ReactElement<AccordionItemProps>, {
          open: open.includes(value),
          onToggle: () => toggle(value),
        });
      })}
    </div>
  );
}

export type AccordionItemProps = {
  value: string;
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onToggle?: () => void;
};

export function AccordionItem({ title, children, className, open, onToggle }: AccordionItemProps) {
  const id = React.useId();
  return (
    <div className={cx("ui-accordion__item", className)} data-open={open ? "true" : "false"}>
      <button className="ui-accordion__trigger ui-focus-ring" type="button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className="ui-accordion__title text-body-small">{title}</span>
        <span className="ui-accordion__chev" aria-hidden="true" />
      </button>
      <div id={id} className="ui-accordion__panel" hidden={!open}>
        <div className="ui-accordion__content">{children}</div>
      </div>
    </div>
  );
}
