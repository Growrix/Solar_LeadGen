import * as React from "react";

export type FieldProps = {
  id?: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  children: React.ReactNode;
};

function withA11yProps(
  child: React.ReactNode,
  props: {
    id?: string;
    describedBy?: string;
    invalid?: boolean;
  }
) {
  if (!React.isValidElement(child)) return child;

  const existingProps = child.props as Record<string, unknown>;
  const nextProps: Record<string, unknown> = {};

  const existingId = typeof existingProps.id === "string" ? (existingProps.id as string) : undefined;
  if (!existingId && props.id) nextProps.id = props.id;

  const existingDescribedBy =
    typeof existingProps["aria-describedby"] === "string"
      ? (existingProps["aria-describedby"] as string)
      : undefined;

  if (props.describedBy) {
    nextProps["aria-describedby"] = existingDescribedBy
      ? `${existingDescribedBy} ${props.describedBy}`
      : props.describedBy;
  }

  if (props.invalid) nextProps["aria-invalid"] = true;

  return React.cloneElement(child, nextProps);
}

export function Field({ id, label, hint, error, children }: FieldProps) {
  const hintId = id ? `${id}__hint` : undefined;
  const errorId = id ? `${id}__error` : undefined;
  const describedBy = error ? errorId : hint ? hintId : undefined;
  const child = withA11yProps(children, { id, describedBy, invalid: Boolean(error) });

  return (
    <div className="ui-field">
      <label className="ui-label" htmlFor={id}>
        {label}
      </label>
      {child}
      {error ? (
        <div className="ui-error" id={errorId}>
          {error}
        </div>
      ) : hint ? (
        <div className="ui-helper" id={hintId}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}
