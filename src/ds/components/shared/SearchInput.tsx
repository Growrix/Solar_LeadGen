import * as React from "react";

import { Button } from "../../primitives/Button";
import { Input, type InputProps } from "../../primitives/Input";
import { Icon } from "./Icon";
import { Search, X } from "../../icons";

export type SearchInputProps = Omit<InputProps, "type"> & {
  leading?: React.ReactNode;
  /** When provided, renders a clear button. */
  onClear?: () => void;
  /** Accessible label for the clear button. */
  clearLabel?: string;
  /** When true, always renders the clear button when onClear is present. */
  showClear?: boolean;
  className?: string;
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Search input pattern (token-driven).
 * Uses DS Input + icon slots; styling lives in DS CSS.
 */
export function SearchInput({
  leading,
  onClear,
  clearLabel = "Clear search",
  showClear,
  className,
  ...props
}: SearchInputProps) {
  const shouldShowClear = Boolean(onClear && (showClear ?? true));

  return (
    <div className={cx("ui-search", className)}>
      <span className="ui-search__leading" aria-hidden="true">
        {leading ?? <Icon icon={Search} aria-hidden />}
      </span>

      <Input type="search" className="ui-search__control" {...props} />

      {shouldShowClear ? (
        <span className="ui-search__trailing">
          <Button variant="icon" aria-label={clearLabel} onClick={onClear}>
            <Icon icon={X} aria-hidden />
          </Button>
        </span>
      ) : null}
    </div>
  );
}
