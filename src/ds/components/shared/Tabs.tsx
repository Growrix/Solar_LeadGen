"use client";

import * as React from "react";

export type TabsContextValue = {
  baseId: string;
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
};

export function Tabs({ value, defaultValue, onValueChange, className, children }: TabsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "");
  const isControlled = typeof value === "string";
  const current = isControlled ? value : uncontrolled;
  const baseId = React.useId();

  const setValue = (next: string) => {
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ baseId, value: current, setValue }}>
      <div className={cx("ui-tabs", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return <div className={cx("ui-tabs__list", className)} role="tablist" {...props} />;
}

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({ value, className, type = "button", ...props }: TabsTriggerProps) {
  const tabs = useTabsContext();
  const selected = tabs.value === value;
  const id = `${tabs.baseId}-tab-${value}`;
  const controls = `${tabs.baseId}-panel-${value}`;

  return (
    <button
      type={type}
      className={cx("ui-tabs__trigger ui-focus-ring", selected && "ui-tabs__trigger--active", className)}
      role="tab"
      id={id}
      aria-controls={controls}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={(e) => {
        props.onClick?.(e);
        if (!e.defaultPrevented) tabs.setValue(value);
      }}
      {...props}
    />
  );
}

export type TabsPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
  keepMounted?: boolean;
};

export function TabsPanel({ value, keepMounted, className, children, ...props }: TabsPanelProps) {
  const tabs = useTabsContext();
  const active = tabs.value === value;
  const id = `${tabs.baseId}-panel-${value}`;
  const labelledBy = `${tabs.baseId}-tab-${value}`;

  if (!active && !keepMounted) return null;

  return (
    <div
      className={cx("ui-tabs__panel", !active && "ui-tabs__panel--hidden", className)}
      role="tabpanel"
      id={id}
      aria-labelledby={labelledBy}
      aria-hidden={!active}
      {...props}
    >
      {children}
    </div>
  );
}
