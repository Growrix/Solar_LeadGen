import * as React from "react";

import { List, type ListProps } from "./List";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type SectionedListSection<T> = {
  id: string;
  title: React.ReactNode;
  items: T[];
};

export type SectionedListProps<T> = Omit<ListProps, "children"> & {
  sections: Array<SectionedListSection<T>>;
  renderItem: (item: T, info: { sectionId: string; index: number }) => React.ReactNode;
  sectionHeaderClassName?: string;
};

export function SectionedList<T>({
  sections,
  renderItem,
  className,
  ariaLabel,
  sectionHeaderClassName,
}: SectionedListProps<T>) {
  return (
    <div className={cx("ui-sectioned-list", className)} aria-label={ariaLabel}>
      {sections.map((section) => (
        <div key={section.id} className="ui-sectioned-list__section">
          <div className={cx("ui-sectioned-list__header", sectionHeaderClassName)}>{section.title}</div>
          <List ariaLabel={typeof section.title === "string" ? section.title : undefined}>{section.items.map((item, idx) => renderItem(item, { sectionId: section.id, index: idx }))}</List>
        </div>
      ))}
    </div>
  );
}
