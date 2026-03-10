"use client";

import * as React from "react";

import { Input, type InputProps } from "../../primitives/Input";
import { Button } from "../../primitives/Button";
import { Icon } from "./Icon";
import { Eye, EyeOff } from "../../icons";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export type PasswordInputProps = Omit<InputProps, "type"> & {
  defaultVisible?: boolean;
};

export function PasswordInput({ defaultVisible = false, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = React.useState(defaultVisible);

  return (
    <div className="ui-row">
      <Input {...props} type={visible ? "text" : "password"} className={cx("ui-flex-1", className)} />
      <Button size="sm" variant="icon" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((v) => !v)}>
        <Icon icon={visible ? EyeOff : Eye} aria-hidden />
      </Button>
    </div>
  );
}
